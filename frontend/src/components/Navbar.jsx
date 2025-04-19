import { Link } from "react-router-dom";
import { useState } from "react";
import { MenuIcon, CircleX,LayoutDashboard } from "lucide-react";

import { useAuthStore } from "../stores/authStore.js";
import ThemeToggle from "./ThemeToggle.jsx";

function Navbar() {
  const { user, logout } = useAuthStore();
  const [active, setActive] = useState("");
  const [toggle, setToggle] = useState(false);

  const navLinks = [
    { id: "home", name: "Home", path: "/" },
    // { id: "charging-stations", name: "Charging Stations", path: "/stations" },
    { id: "booking", name: "Book Slot", path: "/booking-slot" },
    //{ id: "dashboard", name: "Dashboard", path: user ? `/${user.role}-dashboard` : "/login" },
  ];
  //console.log("in navbar",user);

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-lg bg-neutral bg-opacity-50 shadow-md">
      <div className="navbar w-full max-w-[1400px] mx-auto px-4">
        <div className="navbar-start">
          <Link
            to="/"
            className="flex items-center gap-2"
            onClick={() => setActive("")}
          >
            <img src="/evchargehub-logo.png" className="w-10 h-10 object-contain" />
            <p className="text-[18px] text-white font-bold cursor-pointer flex">
              
              <span className="sm:block hidden">EV Charge Hub</span>
            </p>
          </Link>
        </div>

        <div className="navbar-end flex flex-row items-center pr-3 gap-6 md:flex justify-end">
          <ThemeToggle />

          

          <ul className="list-none hidden md:flex flex-row gap-10 justify-center items-center">
            {navLinks.map(({ id, name, path }) => (
              <li
                key={id}
                onClick={() => setActive(id)}
                className={`cursor-pointer ${
                  active === id ? "text-primary" : "text-white"
                }`}
              >
                <Link to={path}>{name}</Link>
              </li>
            ))}
            {
              user &&(
                <li
                onClick={() => setActive("dashboard")}
                className={`cursor-pointer ${
                  active === "dashboard" ? "text-primary" : "text-white"
                }`}
                >
              <Link to = {`/${user.role}-dashboard`}>
                <LayoutDashboard />
              </Link>
            </li>
              )
            }
            {user ? (
              <li>
            <button className="btn btn-error" onClick={logout}>
              Logout
            </button>
            </li>
          ) : (
            <div className="flex gap-4">
              <li>
              <Link to="/signup">
                <button className="btn btn-primary">Sign Up</button>
              </Link>
              </li>
              <li>
            <Link to="/login">
              <button className="btn btn-primary">Login</button>
            </Link>
            </li>
            </div>  
          )}
          </ul>
          
        </div>

        {/* Mobile Navbar */}
        <div className="md:hidden flex flex-1 justify-end items-center">
          <div
            className="w-[28px] h-[28px] object-contain"
            onClick={() => setToggle(!toggle)}
          >
            {toggle ? <CircleX /> : <MenuIcon />}
          </div>

          <div
            className={`${
              !toggle ? "hidden" : "flex"
            } p-6 bg-neutral absolute top-20 right-0 mx-4 my-2 min-w-[140px] z-10 rounded-xl`}
          >
            <ul className="list-none flex justify-end items-start flex-1 flex-col gap-4">
              {navLinks.map(({ id, name, path }) => (
                <li
                  key={id}
                  onClick={() => {
                    setToggle(!toggle);
                    setActive(id);
                  }}
                  className={`cursor-pointer ${
                    active === id ? "text-primary" : "text-white"
                  }`}
                >
                  <Link to={path}>{name}</Link>
                </li>
              ))}
              {user ? (
                <li>
                  <button className="btn btn-error w-full" onClick={logout}>
                    Logout
                  </button>
                </li>
              ) : (
                <li>
                  <Link to="/login">
                    <button className="btn btn-primary w-full">Login</button>
                  </Link>
                </li>
              )}
              {
                user &&(
                <li>
                  <Link to = {`/${user.role}-dashboard`}>
                    <button className="btn btn-primary w-full">Dashboard</button>
                  </Link>
                </li>
              )
              }
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
