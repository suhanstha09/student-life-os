import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="ml-[240px] transition-all duration-200">
        <div className="p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
      {/* Top glow effect */}
      <div
        className="fixed top-0 left-0 right-0 h-[300px] pointer-events-none z-0"
        style={{ background: "var(--gradient-glow)" }}
      />
    </div>
  );
};

export default AppLayout;
