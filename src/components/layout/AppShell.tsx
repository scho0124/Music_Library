export const AppShell = ({ menu, sidebar, player, children }: any) => {
  return (
    <div className="grid h-screen w-screen grid-rows-[auto_1fr_auto]">
      {/* Top menu */}
      <div className="border-b">{menu}</div>

      {/* Main area */}
      <div className="grid grid-cols-[220px_1fr] overflow-hidden">
        {/* Sidebar */}
        <div className="border-r">{sidebar}</div>

        <main className="min-w-0 w-full overflow-hidden">{children}</main>
      </div>

      {/* Player */}
      <div className="h-20 border-t">{player}</div>
    </div>
  );
};
