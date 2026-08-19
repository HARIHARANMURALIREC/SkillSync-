export default function LevelChip({ level, title }) {
  return (
    <div className="chip-gold w-full justify-center">
      Lv {level} · {title}
    </div>
  );
}
