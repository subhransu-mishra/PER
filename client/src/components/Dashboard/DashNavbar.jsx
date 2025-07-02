// import React from "react";
// import { UserCircle } from "lucide-react";

// const DashNavbar = () => {
//   // Get user from localStorage
//   const user = React.useMemo(() => {
//     const saved = localStorage.getItem("user");
//     return saved ? JSON.parse(saved) : null;
//   }, []);

//   return (
//     <div>
//       {/* Right: User Info */}
//       {user && (
//         <div className="flex items-center space-x-3">
//           <UserCircle className="w-7 h-7 text-blue-600" />
//           <span className="text-gray-800 font-medium">
//             {user.employeeId || user.name || user.email}
//           </span>
//         </div>
//       )}
//     </div>
//   );
// };

// export default DashNavbar;

import React from "react";
import { UserCircle } from "lucide-react";

const DashNavbar = () => {
  const user = React.useMemo(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  }, []);

  return (
    <div className="w-full h-16 px-6 bg-white flex items-center justify-end shadow-sm">
      {user ? (
        <div className="flex items-center space-x-3">
          <UserCircle className="w-7 h-7 text-blue-600" />
          <span className="text-gray-800 font-medium">
            {user.employeeId || user.name || user.email}
          </span>
        </div>
      ) : (
        <div className="text-sm text-gray-500">Sign In</div>
      )}
    </div>
  );
};

export default DashNavbar;

