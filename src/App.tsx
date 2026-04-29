import { AppShell } from "./components/layout/AppShell";

export default function App() {
  return (
    <AppShell
      menu={
        <div className="px-3 text-sm">
          File Edit View Playback Library Tools Settings Help
        </div>
      }
      sidebar={<div className="p-4">Sidebar</div>}
      player={<div className="p-4">Player</div>}
    >
      <div className="p-4">Main Content</div>
    </AppShell>
  );
}
