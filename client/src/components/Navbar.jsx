import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Menu, X, Eye, EyeOff, ChevronDown } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { UserCircle } from "lucide-react";
import {
  FiUserPlus,
  FiSettings,
  FiHome,
  FiInfo,
  FiPhone,
  FiTag,
} from "react-icons/fi";
import { RxExit } from "react-icons/rx";
import { PulseLoader, PropagateLoader } from "react-spinners";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, login, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSigninModalOpen, setIsSigninModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCreateUserPassword, setShowCreateUserPassword] = useState(false);
  const [showCreateUserConfirmPassword, setShowCreateUserConfirmPassword] =
    useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const [signupData, setSignupData] = useState({
    companyName: "",
    ownerName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [createUserData, setCreateUserData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "accountant",
  });
  const [navShadow, setNavShadow] = useState(false);
  const [navTransparent, setNavTransparent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);

  // Handle scroll effect for navbar
  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      setNavShadow(window.scrollY > 100);
      if (window.scrollY > lastScrollY && window.scrollY > 100) {
        setNavTransparent(true); // scrolling down
      } else {
        setNavTransparent(false); // scrolling up
      }
      lastScrollY = window.scrollY;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isSigninModalOpen || isSignupModalOpen || isCreateUserModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isSigninModalOpen, isSignupModalOpen, isCreateUserModalOpen]);

  // Listen for custom event to open login modal from ProtectedRoute
  useEffect(() => {
    const handleOpenLoginModal = () => {
      setIsSigninModalOpen(true);
    };

    document.addEventListener("openLoginModal", handleOpenLoginModal);

    return () => {
      document.removeEventListener("openLoginModal", handleOpenLoginModal);
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSignupInputChange = (e) => {
    const { name, value } = e.target;
    setSignupData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateUserInputChange = (e) => {
    const { name, value } = e.target;
    setCreateUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDashboardClick = (e) => {
    e.preventDefault();
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      openSigninModal();
      toast.warning("Please sign in to access the dashboard");
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = formData;
    setLoading(true);
    try {
      await login({ email, password });
      closeSigninModal();
      toast.success("Login successful!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    const { companyName, ownerName, email, password, confirmPassword, phone } =
      signupData;

    if (
      !companyName ||
      !ownerName ||
      !email ||
      !password ||
      !confirmPassword ||
      !phone
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setSignupLoading(true);
    try {
      await axios.post("http://localhost:3000/api/auth/register-company", {
        companyName,
        ownerName,
        email,
        password,
        phone,
      });

      await login({ email, password }); // Use the login function from AuthContext
      setIsSignupModalOpen(false);
      toast.success("Company registered successfully!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "An error occurred during registration"
      );
    } finally {
      setSignupLoading(false);
    }
  };

  const handleCreateUserSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, confirmPassword, role } = createUserData;

    if (!name || !email || !password || !confirmPassword || !role) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:3000/api/user/create",
        {
          name,
          email,
          password,
          role,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("User created successfully!");
      setIsCreateUserModalOpen(false);
      setCreateUserData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "accountant",
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Error creating user");
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const openSigninModal = () => {
    setIsSigninModalOpen(true);
    setIsSignupModalOpen(false);
    setIsMobileMenuOpen(false);
  };

  const closeSigninModal = () => {
    setIsSigninModalOpen(false);
  };

  const openSignupModal = () => {
    setIsSignupModalOpen(true);
    setIsSigninModalOpen(false);
    setIsMobileMenuOpen(false);
  };

  const closeSignupModal = () => {
    setIsSignupModalOpen(false);
  };

  const openCreateUserModal = () => {
    setIsCreateUserModalOpen(true);
    setIsSignupModalOpen(false);
    setIsSigninModalOpen(false);
    setIsMobileMenuOpen(false);
  };

  const closeCreateUserModal = () => {
    setIsCreateUserModalOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    toast.info("Logged out successfully");
  };

  return (
    <>
      {/* Navigation */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          navShadow ? "shadow-lg" : ""
        } ${
          navTransparent ? "bg-white/10 backdrop-blur-md" : "bg-white/95"
        } border-b border-gray-200`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <NavLink to="/">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8  rounded-lg flex items-center justify-center">
                  <img src="/Accure3.png" alt="Accrue Logo" />
                </div>

                <span className="text-xl font-bold text-gray-900">Accrue</span>
              </div>
            </NavLink>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  isActive
                    ? "text-blue-600 transition-colors duration-200 font-medium"
                    : "text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
                }
              >
                Home
              </NavLink>

              <NavLink
                to="/how-to-use"
                className={({ isActive }) =>
                  isActive
                    ? "text-blue-600 transition-colors duration-200 font-medium"
                    : "text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
                }
              >
                How to Use
              </NavLink>

              <NavLink
                to="/about"
                className={({ isActive }) =>
                  isActive
                    ? "text-blue-600 transition-colors duration-200 font-medium"
                    : "text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
                }
              >
                About
              </NavLink>

              <NavLink
                to="/pricing"
                className={({ isActive }) =>
                  isActive
                    ? "text-blue-600 transition-colors duration-200 font-medium"
                    : "text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
                }
              >
                Pricing
              </NavLink>
              
              <NavLink
                to="/contact"
                className={({ isActive }) =>
                  isActive
                    ? "text-blue-600 transition-colors duration-200 font-medium"
                    : "text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
                }
              >
                Contact
              </NavLink>

              {isAuthenticated && (
                <NavLink
                  to="/dashboard"
                  onClick={handleDashboardClick}
                  className={({ isActive }) =>
                    `cursor-pointer text-white px-6 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl ${
                      isActive ? "bg-blue-700" : "bg-blue-600 hover:bg-blue-700"
                    }`
                  }
                >
                  Dashboard
                </NavLink>
              )}
              {isAuthenticated ? (
                <div className="flex items-center space-x-4 relative group">
                  <UserCircle className="w-7 h-7 text-blue-600" />
                  <span className="text-gray-800 font-medium">
                    {user.employeeId || user.name || user.email}
                  </span>
                  {/* Settings Dropdown */}
                  <div className="relative">
                    <button
                      className="ml-2 p-2 rounded-full hover:bg-gray-200 transition-colors"
                      title="Settings"
                      tabIndex={0}
                    >
                      <FiSettings className="w-6 h-6 text-gray-700 cursor-pointer" />
                    </button>
                    <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 pointer-events-none group-hover:pointer-events-auto group-focus-within:pointer-events-auto transition-opacity duration-200 z-50">
                      <ul className="py-2">
                        {user.role === "admin" && (
                          <li>
                            <button
                              onClick={openCreateUserModal}
                              className="cursor-pointer flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                              <FiUserPlus className="mr-2 w-5 h-5 text-green-600" />
                              Create User
                            </button>
                          </li>
                        )}
                        <li>
                          <button
                            onClick={handleLogout}
                            className="cursor-pointer flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            <RxExit className="w-5 h-5 text-red-600 mr-2" />
                            Logout
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={openSigninModal}
                  className="bg-blue-600 cursor-pointer text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Sign In
                </button>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="text-gray-700 hover:text-blue-600 focus:outline-none transition-transform duration-300"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6 transform rotate-90 animate-in zoom-in duration-200" />
                ) : (
                  <Menu className="w-6 h-6 transform animate-in zoom-in duration-200" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div
            className={`md:hidden fixed inset-0 z-40 flex flex-col items-end transition-all duration-500 ${
              isMobileMenuOpen
                ? "pointer-events-auto opacity-100 translate-x-0"
                : "pointer-events-none opacity-0 translate-x-full"
            }`}
            style={{
              background: isMobileMenuOpen
                ? "rgba(255,255,255,0.85)"
                : "transparent",
              backdropFilter: isMobileMenuOpen ? "blur(8px)" : "none",
            }}
          >
            <div
              className={`w-64 bg-white rounded-l-2xl shadow-2xl h-full p-6 flex flex-col transform transition-transform duration-500 ${
                isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
              }`}
            >
              <button
                onClick={toggleMobileMenu}
                className="self-end mb-4 text-gray-700 hover:text-blue-600 focus:outline-none transition-transform duration-300"
                aria-label="Close menu"
              >
                <X className="w-7 h-7" />
              </button>

              {/* User Info Section - Only show when logged in */}
              {isAuthenticated && (
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <UserCircle className="w-10 h-10 text-blue-600" />
                    <div>
                      <span className="text-gray-900 font-medium block">
                        {user.employeeId || user.name || user.email}
                      </span>
                      <span className="text-gray-500 text-sm capitalize">
                        {user.role}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation NavLinks */}
              <div className="flex-1 flex flex-col space-y-2">
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `flex items-center gap-3 ${
                      isActive
                        ? "text-blue-600"
                        : "text-gray-700 hover:text-blue-600"
                    } transition-colors duration-200 font-medium py-2 px-3 rounded-lg ${
                      isActive ? "bg-blue-50" : "hover:bg-blue-50"
                    }`
                  }
                  onClick={toggleMobileMenu}
                >
                  <FiHome className="w-5 h-5" /> Home
                </NavLink>
                <NavLink
                  to="/about"
                  className={({ isActive }) =>
                    `flex items-center gap-3 ${
                      isActive
                        ? "text-blue-600"
                        : "text-gray-700 hover:text-blue-600"
                    } transition-colors duration-200 font-medium py-2 px-3 rounded-lg ${
                      isActive ? "bg-blue-50" : "hover:bg-blue-50"
                    }`
                  }
                  onClick={toggleMobileMenu}
                >
                  <FiInfo className="w-5 h-5" /> About
                </NavLink>
                <NavLink
                  to="/contact"
                  className={({ isActive }) =>
                    `flex items-center gap-3 ${
                      isActive
                        ? "text-blue-600"
                        : "text-gray-700 hover:text-blue-600"
                    } transition-colors duration-200 font-medium py-2 px-3 rounded-lg ${
                      isActive ? "bg-blue-50" : "hover:bg-blue-50"
                    }`
                  }
                  onClick={toggleMobileMenu}
                >
                  <FiPhone className="w-5 h-5" /> Contact
                </NavLink>
                <NavLink
                  to="/pricing"
                  className={({ isActive }) =>
                    `flex items-center gap-3 ${
                      isActive
                        ? "text-blue-600"
                        : "text-gray-700 hover:text-blue-600"
                    } transition-colors duration-200 font-medium py-2 px-3 rounded-lg ${
                      isActive ? "bg-blue-50" : "hover:bg-blue-50"
                    }`
                  }
                  onClick={toggleMobileMenu}
                >
                  <FiTag className="w-5 h-5" /> Pricing
                </NavLink>
                <NavLink
                  to="/how-to-use"
                  className={({ isActive }) =>
                    `flex items-center gap-3 ${
                      isActive
                        ? "text-blue-600"
                        : "text-gray-700 hover:text-blue-600"
                    } transition-colors duration-200 font-medium py-2 px-3 rounded-lg ${
                      isActive ? "bg-blue-50" : "hover:bg-blue-50"
                    }`
                  }
                  onClick={toggleMobileMenu}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>{" "}
                  How to Use
                </NavLink>

                {/* Dashboard NavLink - Only show when logged in */}
                {isAuthenticated && (
                  <NavLink
                    to="/dashboard"
                    onClick={(e) => {
                      handleDashboardClick(e);
                      toggleMobileMenu();
                    }}
                    className={({ isActive }) =>
                      `flex items-center gap-3 ${
                        isActive
                          ? "bg-blue-700"
                          : "bg-blue-600 hover:bg-blue-700"
                      } text-white px-4 py-2 rounded-lg transition-all duration-200 font-medium`
                    }
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                      />
                    </svg>
                    Dashboard
                  </NavLink>
                )}
              </div>

              {/* Bottom Section */}
              <div className="pt-6 mt-6 border-t border-gray-200">
                {isAuthenticated ? (
                  <>
                    {/* Admin Only - Create User Button */}
                    {user.role === "admin" && (
                      <button
                        onClick={() => {
                          openCreateUserModal();
                          toggleMobileMenu();
                        }}
                        className="flex items-center w-full gap-3 text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium py-2 px-3 rounded-lg hover:bg-blue-50 mb-2"
                      >
                        <FiUserPlus className="w-5 h-5" /> Create User
                      </button>
                    )}
                    {/* Logout Button */}
                    <button
                      onClick={() => {
                        handleLogout();
                        toggleMobileMenu();
                      }}
                      className="flex items-center w-full gap-3 text-red-600 hover:text-red-700 transition-colors duration-200 font-medium py-2 px-3 rounded-lg hover:bg-red-50"
                    >
                      <RxExit className="w-5 h-5" /> Logout
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      openSigninModal();
                      toggleMobileMenu();
                    }}
                    className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 transform hover:scale-[1.02] font-medium"
                  >
                    Sign In
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Sign In Modal with Blur Effect */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-500 ${
          isSigninModalOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        style={{
          backdropFilter: isSigninModalOpen ? "blur(8px)" : "none",
          background: isSigninModalOpen ? "rgba(30,41,59,0.3)" : "transparent",
        }}
        aria-modal="true"
        tabIndex={-1}
      >
        {/* Modal content */}
        <div
          className={`bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-500 ${
            isSigninModalOpen
              ? "scale-100 translate-y-0"
              : "scale-95 -translate-y-10"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
            <button
              onClick={closeSigninModal}
              className="text-gray-400 hover:text-gray-600 transition-colors transform hover:rotate-90 duration-300"
            >
              <X className="cursor-pointer w-6 h-6" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6">
            <div className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50/80 focus:bg-white"
                  placeholder="Enter your email"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50/80 focus:bg-white pr-12"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5 cursor-pointer animate-in zoom-in duration-200" />
                    ) : (
                      <Eye className="w-5 h-5 cursor-pointer animate-in zoom-in duration-200" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="remember"
                    name="remember"
                    checked={formData.remember}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label
                    htmlFor="remember"
                    className="ml-2 text-sm text-gray-700"
                  >
                    Remember me
                  </label>
                </div>
                <a
                  href="#"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Forgot password?
                </a>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleLoginSubmit}
                className="flex items-center justify-center w-full cursor-pointer bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200 transform hover:scale-[1.02]"
                disabled={loading}
              >
                {loading ? <PulseLoader color="#fff" size={8} /> : "Sign In"}
              </button>
            </div>

            {/* Divider */}
            <div className="mt-6 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Sign In Modal Body Bottom Section */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <button
                  onClick={openSignupModal}
                  className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                >
                  Register your company
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sign Up Modal with Blur Effect */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-500 overflow-y-auto ${
          isSignupModalOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        style={{
          backdropFilter: isSignupModalOpen ? "blur(8px)" : "none",
          background: isSignupModalOpen ? "rgba(30,41,59,0.3)" : "transparent",
        }}
        aria-modal="true"
        tabIndex={-1}
      >
        {/* Modal content */}
        <div
          className={`bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-500 my-4 ${
            isSignupModalOpen
              ? "scale-100 translate-y-0"
              : "scale-95 -translate-y-10"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="sticky top-0 z-10 flex justify-between items-center p-6 border-b border-gray-200 bg-white/95 backdrop-blur-sm rounded-t-2xl">
            <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
            <button
              onClick={closeSignupModal}
              className="text-gray-400 hover:text-gray-600 transition-colors transform hover:rotate-90 duration-300"
            >
              <X className="cursor-pointer w-6 h-6" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 max-h-[calc(100vh-8rem)] overflow-y-auto">
            <form onSubmit={handleSignupSubmit} className="space-y-5">
              {/* Email Field */}
              <div className="space-y-2">
                <label
                  htmlFor="signup-email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="signup-email"
                  name="email"
                  required
                  value={signupData.email}
                  onChange={handleSignupInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50/80 focus:bg-white"
                  placeholder="Enter your email"
                />
              </div>

              {/* Employee ID Field */}
              <div className="space-y-2">
                <label
                  htmlFor="ownerName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Owner Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="ownerName"
                  name="ownerName"
                  required
                  value={signupData.ownerName}
                  onChange={handleSignupInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50/80 focus:bg-white"
                  placeholder="Enter your owner name"
                />
              </div>

              {/* Company Name Field */}
              <div className="space-y-2">
                <label
                  htmlFor="companyName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  required
                  value={signupData.companyName}
                  onChange={handleSignupInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50/80 focus:bg-white"
                  placeholder="Enter your company name"
                />
              </div>

              {/* Phone Number Field */}
              <div className="space-y-2">
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700"
                >
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  value={signupData.phone}
                  onChange={handleSignupInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50/80 focus:bg-white"
                  placeholder="Enter your phone number"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label
                  htmlFor="signup-password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showSignupPassword ? "text" : "password"}
                    id="signup-password"
                    name="password"
                    required
                    value={signupData.password}
                    onChange={handleSignupInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50/80 focus:bg-white pr-12"
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupPassword(!showSignupPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showSignupPassword ? (
                      <EyeOff className="w-5 h-5 cursor-pointer animate-in zoom-in duration-200" />
                    ) : (
                      <Eye className="w-5 h-5 cursor-pointer animate-in zoom-in duration-200" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Password must be at least 8 characters
                </p>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    required
                    value={signupData.confirmPassword}
                    onChange={handleSignupInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50/80 focus:bg-white pr-12"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5 cursor-pointer animate-in zoom-in duration-200" />
                    ) : (
                      <Eye className="w-5 h-5 cursor-pointer animate-in zoom-in duration-200" />
                    )}
                  </button>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="terms" className="text-gray-600">
                    I agree to the{" "}
                    <a
                      href="#"
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a
                      href="#"
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Privacy Policy
                    </a>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="flex items-center justify-center w-full cursor-pointer bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200 transform hover:scale-[1.02]"
                disabled={signupLoading}
              >
                {signupLoading ? (
                  <PropagateLoader color="#155dfc" size={12} />
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="mt-6 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or sign up with
                </span>
              </div>
            </div>

            {/* Sign In NavLink */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <button
                  onClick={openSigninModal}
                  className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                >
                  Sign in
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Create User Modal with Blur Effect */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-500 ${
          isCreateUserModalOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        style={{
          backdropFilter: isCreateUserModalOpen ? "blur(8px)" : "none",
          background: isCreateUserModalOpen
            ? "rgba(30,41,59,0.3)"
            : "transparent",
        }}
        aria-modal="true"
        tabIndex={-1}
      >
        {/* Modal content */}
        <div
          className={`bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-500 my-8 ${
            isCreateUserModalOpen
              ? "scale-100 translate-y-0"
              : "scale-95 -translate-y-10"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">
              Create New User
            </h2>
            <button
              onClick={closeCreateUserModal}
              className="text-gray-400 hover:text-gray-600 transition-colors transform hover:rotate-90 duration-300"
            >
              <X className="cursor-pointer w-6 h-6" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6">
            <form onSubmit={handleCreateUserSubmit} className="space-y-5">
              {/* Full Name Field */}
              <div className="space-y-2">
                <label
                  htmlFor="create-name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="create-name"
                  name="name"
                  required
                  value={createUserData.name}
                  onChange={handleCreateUserInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50/80 focus:bg-white"
                  placeholder="Enter user's full name"
                />
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label
                  htmlFor="create-email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="create-email"
                  name="email"
                  required
                  value={createUserData.email}
                  onChange={handleCreateUserInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50/80 focus:bg-white"
                  placeholder="Enter user's email"
                />
              </div>

              {/* Role Selection */}
              <div className="space-y-2">
                <label
                  htmlFor="create-role"
                  className="block text-sm font-medium text-gray-700"
                >
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  id="create-role"
                  name="role"
                  required
                  value={createUserData.role}
                  onChange={handleCreateUserInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50/80 focus:bg-white"
                >
                  <option value="accountant">Accountant</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label
                  htmlFor="create-password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showCreateUserPassword ? "text" : "password"}
                    id="create-password"
                    name="password"
                    required
                    value={createUserData.password}
                    onChange={handleCreateUserInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50/80 focus:bg-white pr-12"
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowCreateUserPassword(!showCreateUserPassword)
                    }
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showCreateUserPassword ? (
                      <EyeOff className="w-5 h-5 cursor-pointer animate-in zoom-in duration-200" />
                    ) : (
                      <Eye className="w-5 h-5 cursor-pointer animate-in zoom-in duration-200" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Password must be at least 8 characters
                </p>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <label
                  htmlFor="create-confirmPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showCreateUserConfirmPassword ? "text" : "password"}
                    id="create-confirmPassword"
                    name="confirmPassword"
                    required
                    value={createUserData.confirmPassword}
                    onChange={handleCreateUserInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50/80 focus:bg-white pr-12"
                    placeholder="Confirm password"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowCreateUserConfirmPassword(
                        !showCreateUserConfirmPassword
                      )
                    }
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showCreateUserConfirmPassword ? (
                      <EyeOff className="w-5 h-5 cursor-pointer animate-in zoom-in duration-200" />
                    ) : (
                      <Eye className="w-5 h-5 cursor-pointer animate-in zoom-in duration-200" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="flex items-center justify-center w-full cursor-pointer bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200 transform hover:scale-[1.02]"
              >
                Create User
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
