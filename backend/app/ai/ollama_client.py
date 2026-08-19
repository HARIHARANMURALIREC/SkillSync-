"""
LLM client for SkillSync AI.

Tries Groq first (OpenAI-compatible chat completions), then falls back to a
local Ollama server. Connection failures on both backends surface as HTTP 503.
"""

import json
import logging
import os
import re
from pathlib import Path
from typing import Any, Optional, Type, TypeVar

import httpx
from dotenv import load_dotenv
from fastapi import HTTPException, status
from json_repair import repair_json
from pydantic import BaseModel, ValidationError

load_dotenv(Path(__file__).resolve().parents[2] / ".env")
load_dotenv()

GROQ_API_KEY = (os.getenv("GROQ_API_KEY") or "").strip()
GROQ_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-20b")
GROQ_BASE_URL = os.getenv("GROQ_BASE_URL", "https://api.groq.com/openai/v1").rstrip("/")

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434").rstrip("/")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "mistral:latest")

logger = logging.getLogger(__name__)

T = TypeVar("T", bound=BaseModel)

BOTH_DOWN_DETAIL = (
    "Groq and Ollama are unavailable. Check GROQ_API_KEY and start Ollama with "
    f"`ollama serve` (e.g. `ollama pull {OLLAMA_MODEL}`)."
)

OLLAMA_DOWN_DETAIL = (
    "Ollama is not running. Start it with `ollama serve` "
    f"and pull a model (e.g. `ollama pull {OLLAMA_MODEL}`)."
)

_http = httpx.Client(timeout=httpx.Timeout(90.0, connect=5.0))


def groq_configured() -> bool:
    return bool(GROQ_API_KEY)


def llm_status() -> dict:
    """Status for /api/health: Groq config plus Ollama reachability."""
    ollama = ollama_status()
    groq = groq_configured()
    return {
        "primary": "groq" if groq else "ollama",
        "groq": groq,
        "ollama": ollama["reachable"],
        "model": GROQ_MODEL if groq else OLLAMA_MODEL,
        "ollama_model": OLLAMA_MODEL,
        "groq_model": GROQ_MODEL,
        "ollama_model_available": ollama["model_available"],
    }


def warm_model() -> None:
    """Load Mistral into memory in the background so fallback is faster."""
    try:
        _http.post(
            f"{OLLAMA_BASE_URL}/api/generate",
            json={
                "model": OLLAMA_MODEL,
                "prompt": "ok",
                "stream": False,
                "keep_alive": "30m",
                "options": {"num_predict": 1},
            },
            timeout=60.0,
        )
    except Exception:
        pass


def ollama_status() -> dict:
    """Check whether the local Ollama server is reachable."""
    try:
        response = _http.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=5.0)
        response.raise_for_status()
        models = [m.get("name", "") for m in response.json().get("models", [])]
        model_available = any(OLLAMA_MODEL in name for name in models)
        return {
            "reachable": True,
            "model": OLLAMA_MODEL,
            "model_available": model_available,
        }
    except Exception:
        return {
            "reachable": False,
            "model": OLLAMA_MODEL,
            "model_available": False,
        }


def _extract_json_text(content: str) -> str:
    text = (content or "").strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?", "", text, flags=re.IGNORECASE).strip()
        if text.endswith("```"):
            text = text[:-3].strip()
    starts = [i for i in (text.find("{"), text.find("[")) if i >= 0]
    if starts:
        text = text[min(starts):]
    return text


def _loads_loose(content: str) -> Any:
    """Parse model output, repairing truncated or slightly invalid JSON."""
    text = _extract_json_text(content)
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        repaired = repair_json(text, return_objects=True)
        if isinstance(repaired, (dict, list)):
            return repaired
        return json.loads(repaired)


def _validate_schema(parsed: Any, schema: Type[T]) -> T:
    try:
        return schema.model_validate(parsed)
    except ValidationError:
        if isinstance(parsed, list):
            for name in schema.model_fields:
                try:
                    return schema.model_validate({name: parsed})
                except ValidationError:
                    continue
        if isinstance(parsed, dict):
            if "weekly_paths" not in parsed:
                for alt in ("weeks", "path", "learning_path", "adapted_path"):
                    if alt in parsed and "weekly_paths" in schema.model_fields:
                        parsed = {**parsed, "weekly_paths": parsed[alt]}
                        break
            return schema.model_validate(parsed)
        raise


def _strip_think(content: str) -> str:
    """Remove reasoning tags some Groq models leak into the visible reply."""
    text = re.sub(r"<think>.*?</think>", "", content or "", flags=re.DOTALL | re.IGNORECASE)
    return text.strip()


def _groq_chat(
    messages: list[dict],
    timeout: float,
    max_tokens: int,
    temperature: float,
    json_mode: bool,
) -> str:
    """Call Groq chat completions. Raises on any failure so callers can fall back."""
    if not groq_configured():
        raise RuntimeError("GROQ_API_KEY is not set")

    payload: dict[str, Any] = {
        "model": GROQ_MODEL,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }
    if json_mode:
        payload["response_format"] = {"type": "json_object"}

    try:
        response = _http.post(
            f"{GROQ_BASE_URL}/chat/completions",
            headers={
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json",
            },
            json=payload,
            timeout=timeout,
        )
        response.raise_for_status()
    except httpx.HTTPStatusError as exc:
        body = ""
        if exc.response is not None:
            try:
                err = exc.response.json().get("error") or {}
                body = err.get("message") or exc.response.text[:300]
            except Exception:
                body = (exc.response.text or "")[:300]
        raise RuntimeError(f"Groq HTTP {exc.response.status_code if exc.response else '?'}: {body}") from exc

    data = response.json()
    choices = data.get("choices") or []
    if not choices:
        raise ValueError("Groq returned no choices")
    message = choices[0].get("message") or {}
    content = _strip_think((message.get("content") or "").strip())
    finish = choices[0].get("finish_reason")
    if (not content or len(content) < 40) and finish == "length" and max_tokens < 2400:
        return _groq_chat(messages, timeout, min(max_tokens * 2, 2400), temperature, json_mode)
    if not content:
        raise ValueError("Groq returned empty content")
    return content


def _ollama_chat(
    messages: list[dict],
    timeout: float,
    num_predict: int,
    temperature: float,
    json_mode: bool,
) -> str:
    payload: dict[str, Any] = {
        "model": OLLAMA_MODEL,
        "stream": False,
        "keep_alive": "30m",
        "options": {
            "temperature": temperature,
            "num_predict": num_predict,
            "num_ctx": 4096,
        },
        "messages": messages,
    }
    if json_mode:
        payload["format"] = "json"

    try:
        response = _http.post(
            f"{OLLAMA_BASE_URL}/api/chat",
            json=payload,
            timeout=timeout,
        )
        response.raise_for_status()
    except (httpx.ConnectError, httpx.ConnectTimeout) as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=BOTH_DOWN_DETAIL if groq_configured() else OLLAMA_DOWN_DETAIL,
        ) from exc
    except httpx.TimeoutException as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "Groq failed and Ollama timed out. Try again — the local model may still be warming up."
                if groq_configured()
                else "Ollama timed out. Try again — the model may still be warming up."
            ),
        ) from exc
    except httpx.HTTPStatusError as exc:
        if exc.response is not None and exc.response.status_code == 404:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=(
                    f"Ollama model '{OLLAMA_MODEL}' is not available. "
                    f"Run `ollama pull {OLLAMA_MODEL}`."
                ),
            ) from exc
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Ollama request failed: {exc}",
        ) from exc

    return (response.json().get("message", {}).get("content", "") or "").strip()


def chat_json(
    system: str,
    user: str,
    schema: Type[T],
    timeout: float = 45.0,
    num_predict: int = 400,
    retries: int = 1,
) -> T:
    """
    Chat and parse JSON into `schema`. Groq first, then Ollama.
    """
    last_error: Optional[str] = None
    messages = [
        {"role": "system", "content": system},
        {"role": "user", "content": user},
    ]

    attempts = max(1, retries + 1)

    if groq_configured():
        groq_messages = list(messages)
        for attempt in range(attempts):
            predict = num_predict if attempt == 0 else min(num_predict * 2, 1200)
            if attempt > 0 and last_error:
                groq_messages.append({
                    "role": "user",
                    "content": "Your last reply was cut off or invalid. Return one complete JSON object only.",
                })
            try:
                content = _groq_chat(
                    groq_messages,
                    timeout=timeout,
                    max_tokens=predict,
                    temperature=0.1,
                    json_mode=True,
                )
                parsed = _loads_loose(content)
                result = _validate_schema(parsed, schema)
                logger.info("LLM backend: groq")
                return result
            except (
                httpx.HTTPError,
                json.JSONDecodeError,
                ValidationError,
                ValueError,
                TypeError,
                RuntimeError,
            ) as exc:
                last_error = str(exc)
                logger.warning("Groq JSON attempt %s failed: %s", attempt + 1, last_error)
                continue
        logger.info("Falling back to Ollama after Groq JSON failure")

    last_error = None
    ollama_messages = list(messages)
    for attempt in range(attempts):
        predict = num_predict if attempt == 0 else min(num_predict * 2, 1200)
        if attempt > 0 and last_error:
            ollama_messages.append({
                "role": "user",
                "content": "Your last reply was cut off or invalid. Return one complete JSON object only.",
            })
        content = _ollama_chat(
            ollama_messages,
            timeout=timeout,
            num_predict=predict,
            temperature=0.1,
            json_mode=True,
        )
        try:
            parsed = _loads_loose(content)
            result = _validate_schema(parsed, schema)
            logger.info("LLM backend: ollama")
            return result
        except (json.JSONDecodeError, ValidationError, ValueError, TypeError) as exc:
            last_error = str(exc)
            continue

    raise HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail="Groq and Ollama returned incomplete JSON. Please try generating again.",
    )


def chat_text(
    system: str,
    messages: list[dict],
    timeout: float = 60.0,
    num_predict: int = 512,
    temperature: float = 0.4,
) -> str:
    """Send a chat request (Groq first, Ollama fallback) and return plain text."""
    chat_messages = [{"role": "system", "content": system}]
    for msg in messages:
        if msg.get("role") in ("user", "assistant") and msg.get("content"):
            chat_messages.append({"role": msg["role"], "content": msg["content"]})

    if groq_configured():
        try:
            content = _groq_chat(
                chat_messages,
                timeout=timeout,
                max_tokens=num_predict,
                temperature=temperature,
                json_mode=False,
            )
            if content:
                logger.info("LLM backend: groq")
                return content
        except (httpx.HTTPError, ValueError, RuntimeError) as exc:
            logger.warning("Groq text failed, falling back to Ollama: %s", exc)

    content = _ollama_chat(
        chat_messages,
        timeout=timeout,
        num_predict=num_predict,
        temperature=temperature,
        json_mode=False,
    )
    logger.info("LLM backend: ollama")
    return content
