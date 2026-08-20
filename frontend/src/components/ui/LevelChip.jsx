export default function LevelChip({ level, title }) {
  return (
    <div className="chip-gold w-full justify-center shadow-neon-sm">
      Lv {level} · {title}
    </div>
  );
}
