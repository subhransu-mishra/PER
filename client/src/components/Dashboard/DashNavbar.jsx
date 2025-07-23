import React from "react";
import { UserCircle, Home, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { IoMdArrowRoundBack } from "react-icons/io";
import { FiMenu } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";

const DashNavbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <div className="w-full h-16 px-6 bg-white flex items-center justify-between shadow-sm">
      {/* Left side - Home button and Menu button */}
      <div className="flex items-center gap-2">
        {/* Menu button for small/medium screens */}
        <button
          className="md:hidden mr-2 p-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          onClick={toggleSidebar}
          aria-label="Open sidebar"
        >
          <FiMenu className="w-6 h-6" />
        </button>
        <Link
          to="/"
          className="flex font-bold items-center space-x-2 px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors duration-200"
        >
          <IoMdArrowRoundBack className="w-5 h-5" />
          <span className="font-medium">Home</span>
        </Link>
      </div>

      {/* Right side - User info and logout */}
      {user ? (
        <div className="flex items-center space-x-4 py-2 px-4">
          <div className="flex items-center space-x-3">
            <UserCircle className="w-7 h-7 text-blue-600" />
            <span className="text-gray-800 font-medium">
              {user.name || user.email}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center cursor-pointer space-x-2 px-3 py-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      ) : (
        <div className="text-sm text-gray-500 px-4">Sign In</div>
      )}
    </div>
  );
};

export default DashNavbar;
