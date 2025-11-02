import { NavLink, Routes, Route } from "react-router-dom";
import PredictHealth from "./components/PredictHealth";
import Dashboard from "./components/Dashboard";

export default function App() {
  const link = ({ isActive }: { isActive: boolean }) =>
    `px-4 py-2 rounded-lg transition ${
      isActive
        ? "bg-emerald-50 text-emerald-700"
        : "text-gray-700 hover:bg-gray-100"
    }`;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur">
        <div className="app-container !py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-100 text-emerald-700 grid place-items-center font-semibold">
              HM
            </div>
            <div className="font-semibold tracking-tight text-emerald-700">
              Health Monitor
            </div>
          </div>
          <nav className="flex gap-1">
            <NavLink to="/" className={link}>
              Predict Health
            </NavLink>
            <NavLink to="/dashboard" className={link}>
              Dashboard
            </NavLink>
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="app-container">
        <Routes>
          <Route path="/" element={<PredictHealth />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </main>

      {/* Footer (subtle) */}
      <footer className="app-container !py-6 text-xs text-gray-500">
        Built for FDS Project • © {new Date().getFullYear()}
      </footer>
    </div>
  );
}
