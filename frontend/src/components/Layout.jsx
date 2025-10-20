import { Outlet } from "react-router-dom";
import Navbar from "./Navbar2";

const Layout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      <Navbar />
      <div className="pt-16">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
