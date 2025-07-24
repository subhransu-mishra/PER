import "swiper/css";
import "swiper/css/pagination";
import "react-toastify/dist/ReactToastify.css";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import About from "./pages/About";
import Pricing from "./pages/Pricing";
import Contact from "./pages/Contact";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import PettyCash from "./components/Dashboard/PettyCash";
import Revenue from "./components/Dashboard/Revenue";
import Expenses from "./components/Dashboard/Expenses";
import Reports from "./components/Dashboard/Reports";
import DashboardHome from "./components/Dashboard/DashboardHome";
import Settings from "./components/Dashboard/Settings";
import HowToUse from "./pages/HowToUse";

const App = () => {
  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/how-to-use" element={<HowToUse />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardHome />} />
          <Route path="petty-cash" element={<PettyCash />} />
          <Route path="revenue" element={<Revenue />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="analytics" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

export default App;
