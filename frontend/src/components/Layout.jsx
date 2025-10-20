import { Outlet } from "react-router-dom";
import Navbar from "./Navbar2";

const Layout = () => {
  return (
    <div className="min-h-screen bg-dark-bg-primary dark:bg-dark-bg-primary">
      <Navbar />
      <div className="pt-16">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
