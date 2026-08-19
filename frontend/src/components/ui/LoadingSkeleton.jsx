export default function LoadingSkeleton({ rows = 3 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton h-32" />
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return <div className="skeleton h-40" />;
}
