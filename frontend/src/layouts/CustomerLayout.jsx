import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function CustomerLayout() {
  return (
    <div className="bg-gray-200 text-gray-900 dark:bg-dark dark:text-gray-300 min-h-screen overflow-x-clip">
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  );
}
