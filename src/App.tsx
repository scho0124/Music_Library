import { AppShell } from "./components/layout/AppShell";
import { MenuBar } from "./components/layout/MenuBar";
import { SideBar } from "./components/layout/SideBar";
import { PlayerBar } from "./components/layout/PlayerBar";

export default function App() {
  return (
    <AppShell menu={<MenuBar />} sidebar={<SideBar />} player={<PlayerBar />}>
      <div className="p-4">Main Content</div>
    </AppShell>
  );
}
