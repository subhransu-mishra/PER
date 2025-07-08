import React from "react";
import { UserCircle, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { IoMdArrowRoundBack } from "react-icons/io";


const DashNavbar = () => {
  const user = React.useMemo(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  }, []);

  return (
    <div className="w-full h-16 px-6 bg-white border-b flex items-center justify-between shadow-sm">
      {/* Left side - Home button */}
      <Link
        to="/"
        className="flex font-bold items-center space-x-2 px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors duration-200"
      >
        <IoMdArrowRoundBack className="w-5 h-5" />
        <span className="font-medium">Home</span>
      </Link>

      {/* Right side - User info */}
      {user ? (
        <div className="flex items-center space-x-4 py-2 px-4">
          <UserCircle className="w-7 h-7 text-blue-600" />
          <span className="text-gray-800 font-medium">
            {user.name || user.email}
          </span>
        </div>
      ) : (
        <div className="text-sm text-gray-500 px-4">Sign In</div>
      )}
    </div>
  );
};

export default DashNavbar;
