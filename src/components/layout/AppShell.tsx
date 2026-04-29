import React from "react";

export const AppShell = ({
  menu,
  sidebar,
  children,
  player,
}: {
  menu: React.ReactNode;
  sidebar: React.ReactNode;
  children: React.ReactNode;
  player: React.ReactNode;
}) => {
  return (
    <div className="h-screen w-screen flex flex-col bg-background text-foreground">
      {/* Desktop-style app menu */}
      <header className="h-9 shrink-0 border-b bg-muted/60">{menu}</header>

      {/* Main app area */}
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 shrink-0 border-r bg-muted/30">{sidebar}</aside>

        <main className="flex-1 overflow-hidden">{children}</main>
      </div>

      {/* Persistent playback controls */}
      <footer className="h-24 shrink-0 border-t bg-background">{player}</footer>
    </div>
  );
};
