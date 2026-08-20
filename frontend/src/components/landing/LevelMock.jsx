export default function LevelMock() {
  return (
    <div className="card-glass panel-glow">
      <p className="section-label">Level 5</p>
      <h3 className="text-3xl font-bold mt-2">Strategist</h3>
      <p className="tabular font-mono text-accent mt-2 font-semibold">2140 XP</p>
      <div className="mt-4 h-2 rounded-full bg-line overflow-hidden">
        <div
          className="h-full w-[55%] rounded-full bg-gradient-to-r from-accent to-violet shadow-neon-sm"
        />
      </div>
      <div className="mt-4 flex gap-2">
        {['Streak', 'Badges', 'Heat'].map((b) => (
          <span key={b} className="chip-gold text-[10px]">{b}</span>
        ))}
      </div>
    </div>
  );
}
