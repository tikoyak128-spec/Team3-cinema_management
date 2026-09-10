import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function CustomerLayout() {
  return (
    <div className="bg-[var(--app-page)] text-[var(--app-ink)] min-h-screen overflow-x-clip">
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  );
}
