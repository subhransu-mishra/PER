import React, { useState, useEffect, useRef } from "react";
import { UserCircle, Home, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { IoMdArrowRoundBack } from "react-icons/io";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";
import { CgMenuRightAlt } from "react-icons/cg";

const DashNavbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <div
      className={`w-full h-16 px-4 md:px-6 flex items-center justify-between sticky top-0 z-40 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-sm shadow-md"
          : "bg-white shadow-sm"
      }`}
    >
      {/* Left side - Home button and Menu button */}
      <div className="flex items-center gap-2">
        {/* Menu button for small/medium screens */}
        <button
          className="md:hidden mr-2 p-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          onClick={toggleSidebar}
          aria-label="Open sidebar"
        >
          <CgMenuRightAlt className="w-6 h-6" />
        </button>
        <Link
          to="/"
          className="flex font-bold items-center space-x-2 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors duration-200"
        >
          <IoMdArrowRoundBack className="w-5 h-5" />
          <span className="font-medium hidden sm:inline">Home</span>
        </Link>
      </div>

      {/* Right side - User info and logout */}
      {user ? (
        <div className="relative" ref={dropdownRef}>
          <div
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <UserCircle className="w-7 h-7 text-blue-600" />
            <span className="text-gray-800 font-medium hidden md:block">
              {user.name || user.email}
            </span>
          </div>
          {/* Dropdown for logout */}
          <div
            className={`absolute top-full right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 transition-all duration-300 z-50 ${
              isDropdownOpen ? "opacity-100 visible" : "opacity-0 invisible"
            }`}
          >
            <div className="px-4 py-2 border-b">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.name}
              </p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full text-left cursor-pointer flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="text-sm text-gray-500 px-4">Sign In</div>
      )}
    </div>
  );
};

export default DashNavbar;
