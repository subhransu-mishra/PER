import React from "react";
import { UserCircle } from "lucide-react";

const DashNavbar = () => {
  // Get user from localStorage
  const user = React.useMemo(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  }, []);

  return (
    <div className="relative w-full h-16 flex items-center">
      {/* Logo Centered in dashboard area (not including sidebar) */}
      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center space-x-2">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <svg
            className="w-5 h-5 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
          </svg>
        </div>
        <span className="text-xl font-bold text-gray-900">PER Entry</span>
      </div>
      {/* User Details Right End */}
      {user && (
        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center space-x-3">
          <UserCircle className="w-7 h-7 text-blue-600" />
          <span className="text-gray-800 font-medium">
            {user.employeeId || user.name || user.email}
          </span>
        </div>
      )}
    </div>
  );
};

export default DashNavbar;
