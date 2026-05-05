export function DashboardBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute left-0 top-0 h-[400px] w-[400px] bg-purple-500/20 blur-3xl" />
      <div className="absolute right-0 top-0 h-[400px] w-[400px] bg-indigo-500/20 blur-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.04),transparent_32%)]" />
    </div>
  );
}
