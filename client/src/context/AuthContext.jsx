import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from "react";

// Initial state
const initialState = {
  user: null,
  organization: null,
  token: localStorage.getItem("token"),
  isAuthenticated: false,
  isLoading: true,
  error: null,
  hasActiveSubscription: true, // Set default to true until subscription feature is implemented
};

// Action types
const AUTH_ACTIONS = {
  SET_LOADING: "SET_LOADING",
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  LOGIN_FAILURE: "LOGIN_FAILURE",
  LOGOUT: "LOGOUT",
  CLEAR_ERROR: "CLEAR_ERROR",
  UPDATE_USER: "UPDATE_USER",
  UPDATE_ORGANIZATION: "UPDATE_ORGANIZATION",
};

// Create context
const AuthContext = createContext();

// API base URL (host + /api)
const API_BASE_URL =
  (import.meta.env.VITE_API_URL || "http://localhost:3000") + "/api";

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        organization: action.payload.organization,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        hasActiveSubscription: action.payload.hasActiveSubscription ?? true, // Keep true as default
      };
    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        organization: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        organization: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    case AUTH_ACTIONS.UPDATE_ORGANIZATION:
      return {
        ...state,
        organization: { ...state.organization, ...action.payload },
      };
    default:
      return state;
  }
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // API helper function
  const apiCall = useCallback(
    async (method, endpoint, data = null) => {
      const url = `${API_BASE_URL}${endpoint}`;
      const config = {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(state.token && { Authorization: `Bearer ${state.token}` }),
        },
        ...(data && { body: JSON.stringify(data) }),
      };

      try {
        const response = await fetch(url, config);
        const responseData = await response.json();

        if (!response.ok) {
          throw new Error(responseData.message || "Something went wrong");
        }

        return responseData;
      } catch (error) {
        console.error("API call failed:", error);
        throw error;
      }
    },
    [state.token]
  );

  // Permission check helper
  const hasPermission = useCallback(
    (permission) => {
      if (!state.user) return false;
      if (state.user.role === "system_admin") return true;
      return state.user.permissions?.[permission] || false;
    },
    [state.user]
  );

  // Feature check helper
  const hasFeature = useCallback(
    (feature) => {
      if (!state.user || !state.organization) return false;
      if (state.user.role === "system_admin") return true;

      // Get the organization's plan features
      const planFeatures = state.organization.subscription?.features || [];

      // Check if the feature exists in the organization's plan
      return planFeatures.includes(feature);
    },
    [state.user, state.organization]
  );

  // Check token and load user data on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE });
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load user");
        }

        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: {
            user: data.user,
            organization: data.organization,
            token,
          },
        });
      } catch (error) {
        console.error("Error loading user:", error);
        dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE });
      }
    };

    loadUser();
  }, []); // Only run once on mount

  // Login function
  const login = async (credentials) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      const data = await apiCall("POST", "/auth/login", credentials);

      localStorage.setItem("token", data.token);

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: {
          user: data.user,
          organization: data.organization,
          token: data.token,
        },
      });

      return data;
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: error.message,
      });
      throw error;
    }
  };

  // Logout function
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  }, []);

  const value = {
    ...state,
    login,
    logout,
    apiCall,
    hasPermission,
    hasFeature,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
