export function DashboardBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(237,226,200,0.06),transparent_34%)]" />
      <div className="absolute left-[-8%] top-[-6%] h-[280px] w-[280px] rounded-full bg-[rgba(237,226,200,0.035)] blur-3xl" />
      <div className="absolute right-[-10%] top-[12%] h-[220px] w-[220px] rounded-full bg-[rgba(169,155,232,0.045)] blur-3xl" />
    </div>
  );
}
