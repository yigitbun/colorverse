import { Navigate, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SiteHeader } from "@/components/SiteHeader";
import Home from "@/pages/Home";
import Explore from "@/pages/Explore";
import Extract from "@/pages/Extract";
import About from "@/pages/About";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import PaletteRedirect from "@/pages/PaletteRedirect";

export default function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-white text-neutral-900 dark:bg-[#0B1220] dark:text-[#E2E8F0]">
        <SiteHeader />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/extract" element={<Extract />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/palette/:id" element={<PaletteRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </ThemeProvider>
  );
}
