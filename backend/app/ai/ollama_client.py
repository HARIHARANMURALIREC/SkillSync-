"""
Ollama HTTP client for SkillSync AI.

Talks to a local Ollama server (default http://localhost:11434) and returns
validated JSON. Connection failures surface as HTTP 503.
"""

import os
import json
import re
from typing import Any, Type, TypeVar

import httpx
from dotenv import load_dotenv
from fastapi import HTTPException, status
from json_repair import repair_json
from pydantic import BaseModel, ValidationError

load_dotenv()

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434").rstrip("/")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "mistral:latest")

T = TypeVar("T", bound=BaseModel)

OLLAMA_DOWN_DETAIL = (
    "Ollama is not running. Start it with `ollama serve` "
    f"and pull a model (e.g. `ollama pull {OLLAMA_MODEL}`)."
)

# Reuse TCP connections so we don't pay handshake cost on every call.
_http = httpx.Client(timeout=httpx.Timeout(90.0, connect=5.0))


def warm_model() -> None:
    """Load Mistral into memory in the background so the first user request is faster."""
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
            # Common alternate keys from Mistral
            if "weekly_paths" not in parsed:
                for alt in ("weeks", "path", "learning_path", "adapted_path"):
                    if alt in parsed and "weekly_paths" in schema.model_fields:
                        parsed = {**parsed, "weekly_paths": parsed[alt]}
                        break
            return schema.model_validate(parsed)
        raise


def chat_json(
    system: str,
    user: str,
    schema: Type[T],
    timeout: float = 45.0,
    num_predict: int = 400,
    retries: int = 1,
) -> T:
    """
    Send a chat request to Ollama and parse a JSON response into `schema`.

    Caps generated tokens so Mistral finishes quickly. Raises HTTP 503 if
    Ollama is unreachable, the model is missing, or the reply cannot be parsed.
    """
    last_error = None
    messages = [
        {"role": "system", "content": system},
        {"role": "user", "content": user},
    ]

    attempts = max(1, retries + 1)
    for attempt in range(attempts):
        predict = num_predict if attempt == 0 else min(num_predict * 2, 1200)
        if attempt > 0 and last_error:
            messages.append({
                "role": "user",
                "content": "Your last reply was cut off or invalid. Return one complete JSON object only.",
            })

        try:
            response = _http.post(
                f"{OLLAMA_BASE_URL}/api/chat",
                json={
                    "model": OLLAMA_MODEL,
                    "stream": False,
                    "format": "json",
                    "keep_alive": "30m",
                    "options": {
                        "temperature": 0.1,
                        "num_predict": predict,
                        "num_ctx": 4096,
                    },
                    "messages": messages,
                },
                timeout=timeout,
            )
            response.raise_for_status()
        except (httpx.ConnectError, httpx.ConnectTimeout) as exc:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=OLLAMA_DOWN_DETAIL,
            ) from exc
        except httpx.TimeoutException as exc:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Ollama timed out. Try again — the model may still be warming up.",
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

        content = response.json().get("message", {}).get("content", "") or ""
        try:
            parsed = _loads_loose(content)
            return _validate_schema(parsed, schema)
        except (json.JSONDecodeError, ValidationError, ValueError, TypeError) as exc:
            last_error = str(exc)
            continue

    raise HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail="Ollama returned incomplete JSON. Please try generating again.",
    )


def chat_text(
    system: str,
    messages: list[dict],
    timeout: float = 60.0,
    num_predict: int = 512,
    temperature: float = 0.4,
) -> str:
    """Send a chat request to Ollama and return plain text."""
    ollama_messages = [{"role": "system", "content": system}]
    for msg in messages:
        if msg.get("role") in ("user", "assistant") and msg.get("content"):
            ollama_messages.append({"role": msg["role"], "content": msg["content"]})

    try:
        response = _http.post(
            f"{OLLAMA_BASE_URL}/api/chat",
            json={
                "model": OLLAMA_MODEL,
                "stream": False,
                "keep_alive": "30m",
                "options": {
                    "temperature": temperature,
                    "num_predict": num_predict,
                    "num_ctx": 4096,
                },
                "messages": ollama_messages,
            },
            timeout=timeout,
        )
        response.raise_for_status()
    except (httpx.ConnectError, httpx.ConnectTimeout) as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=OLLAMA_DOWN_DETAIL,
        ) from exc
    except httpx.TimeoutException as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Ollama timed out. Try again — the model may still be warming up.",
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
