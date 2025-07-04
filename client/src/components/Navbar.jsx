import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSigninModalOpen, setIsSigninModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const [signupData, setSignupData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    employeeId: "",
    companyName: "",
  });
  const navigate = useNavigate();
  const [navShadow, setNavShadow] = useState(false);
  const [navTransparent, setNavTransparent] = useState(false);
  const [user, setUser] = useState(() => {
    // Try to load user from localStorage on mount
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
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
    if (isSigninModalOpen || isSignupModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isSigninModalOpen, isSignupModalOpen]);

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

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = formData;
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:3000/api/auth/login",
        { email, password }
      );
      toast.success("Login successful");
      setIsSigninModalOpen(false);
      setUser(response.data.user);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      localStorage.setItem("token", response.data.token);
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    const { email, password, confirmPassword, employeeId, companyName } =
      signupData;
    if (
      !email ||
      !password ||
      !confirmPassword ||
      !employeeId ||
      !companyName
    ) {
      alert("Please fill in all required fields");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setSignupLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:3000/api/auth/register",
        {
          email,
          password,
          employeeId,
          companyName,
        }
      );
      toast.success("Signup successful!");
      setIsSignupModalOpen(false);
      setUser(response.data.data.user);
      localStorage.setItem("user", JSON.stringify(response.data.data.user));
      localStorage.setItem("token", response.data.data.token);
      navigate("/dashboard");
    } catch (error) {
      toast.error(
        (error.response && error.response.data.message) ||
          "An unknown error occurred."
      );
    } finally {
      setSignupLoading(false);
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
    if (user && user.role === "admin") {
      setIsSignupModalOpen(true);
      setIsSigninModalOpen(false);
    }
  };

  const closeSignupModal = () => {
    setIsSignupModalOpen(false);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
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
            <div className="flex items-center space-x-2">
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

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link
                to="/"
                className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
              >
                Home
              </Link>
              <Link
                to="/about"
                className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
              >
                About
              </Link>
              <Link
                to="/contact"
                className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
              >
                Contact
              </Link>
              <Link
                to="/pricing"
                className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
              >
                Pricing
              </Link>
              {user ? (
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
                              onClick={openSignupModal}
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
              className={`w-64 bg-white rounded-l-2xl shadow-2xl h-full p-6 flex flex-col space-y-4 transform transition-transform duration-500 ${
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
              <Link
                to="/"
                className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium py-2 px-3 rounded-lg hover:bg-blue-50"
                onClick={toggleMobileMenu}
              >
                <FiHome className="w-5 h-5" /> Home
              </Link>
              <Link
                to="/about"
                className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium py-2 px-3 rounded-lg hover:bg-blue-50"
                onClick={toggleMobileMenu}
              >
                <FiInfo className="w-5 h-5" /> About
              </Link>
              <Link
                to="/contact"
                className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium py-2 px-3 rounded-lg hover:bg-blue-50"
                onClick={toggleMobileMenu}
              >
                <FiPhone className="w-5 h-5" /> Contact
              </Link>
              <Link
                to="/pricing"
                className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium py-2 px-3 rounded-lg hover:bg-blue-50"
                onClick={toggleMobileMenu}
              >
                <FiTag className="w-5 h-5" /> Pricing
              </Link>
              <button
                onClick={() => {
                  openSigninModal();
                  toggleMobileMenu();
                }}
                className="bg-blue-600 cursor-pointer text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 w-full transform hover:scale-[1.02] mt-4"
              >
                Sign In
              </button>
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

            <div className="mt-6 text-center">
              {user && user.role === "admin" && (
                <button
                  onClick={openSignupModal}
                  className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                >
                  Sign up here
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sign Up Modal with Blur Effect */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-500 ${
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
          className={`bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-500 ${
            isSignupModalOpen
              ? "scale-100 translate-y-0"
              : "scale-95 -translate-y-10"
          } my-8`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
            <button
              onClick={closeSignupModal}
              className="text-gray-400 hover:text-gray-600 transition-colors transform hover:rotate-90 duration-300"
            >
              <X className="cursor-pointer w-6 h-6" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6">
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
                  htmlFor="employeeId"
                  className="block text-sm font-medium text-gray-700"
                >
                  Employee ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="employeeId"
                  name="employeeId"
                  required
                  value={signupData.employeeId}
                  onChange={handleSignupInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50/80 focus:bg-white"
                  placeholder="Enter your employee ID"
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

            {/* Sign In Link */}
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
    </>
  );
};

export default Navbar;
