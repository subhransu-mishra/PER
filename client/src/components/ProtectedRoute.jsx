import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
  </div>
);

// Protected route component
const ProtectedRoute = ({
  children,
  requiredRole,
  requiredPermission,
  requiredFeature,
}) => {
  const {
    isAuthenticated,
    isLoading,
    user,
    hasPermission,
    hasFeature,
    hasActiveSubscription,
  } = useAuth();

  // Trigger login modal when user is not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Create and dispatch a custom event that Navbar can listen for
      const event = new CustomEvent("openLoginModal");
      document.dispatchEvent(event);
    }
  }, [isLoading, isAuthenticated]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // If not authenticated, redirect to home page and the useEffect above will trigger the login modal
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Check subscription status
  if (hasActiveSubscription === false) {
    return <Navigate to="/subscription" replace />;
  }

  // Check role requirements
  if (requiredRole && !requiredRole.includes(user?.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.888-.833-2.598 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            Access Denied
          </h3>
          <p className="mt-2 text-base text-gray-500">
            You don't have the required role to access this page
          </p>
        </div>
      </div>
    );
  }

  // Check permission requirements
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">Access Denied</h3>
          <p className="mt-2 text-base text-gray-500">
            You don't have the required permissions to access this page
          </p>
        </div>
      </div>
    );
  }

  // Check feature requirements
  if (requiredFeature && !hasFeature(requiredFeature)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">
            Feature Not Available
          </h3>
          <p className="mt-2 text-base text-gray-500">
            This feature is not available in your current plan
          </p>
        </div>
      </div>
    );
  }

  // If all checks pass, render the protected content
  return children;
};

// Specialized route components
export const AdminRoute = ({ children }) => (
  <ProtectedRoute requiredRole={["admin"]}>{children}</ProtectedRoute>
);

export const OwnerRoute = ({ children }) => (
  <ProtectedRoute requiredPermission="manage_subscription">
    {children}
  </ProtectedRoute>
);

export const FeatureRoute = ({ children, feature }) => (
  <ProtectedRoute requiredFeature={feature}>{children}</ProtectedRoute>
);

export default ProtectedRoute;
