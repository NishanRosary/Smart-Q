import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./styles/global.css";

// Customer
import LandingPage from "./components/customer/LandingPage";
import CustomerLogin from "./components/customer/CustomerLogin";
import CustomerDashboard from "./components/customer/CustomerDashboard";
import JoinQueue from "./components/customer/JoinQueue";
import WelcomePage from "./components/customer/WelcomePage";

// Admin
import AdminLogin from "./components/admin/AdminLogin";
import AdminDashboard from "./components/admin/AdminDashboard";
import QueueManagement from "./components/admin/QueueManagement";
import EventScheduler from "./components/admin/EventScheduler";
import CounterManagement from "./components/admin/CounterManagement";
import Analytics from "./components/admin/Analytics";
import Predictions from "./components/admin/Predictions";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Customer */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<CustomerLogin />} />
        <Route path="/customer-dashboard" element={<CustomerDashboard />} />
        <Route path="/join-queue" element={<JoinQueue />} />
        <Route path="/welcome" element={<WelcomePage />} />

        {/* Admin */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/queue-management" element={<QueueManagement />} />
        <Route path="/admin/event-scheduler" element={<EventScheduler />} />
        <Route path="/admin/counters" element={<CounterManagement />} />
        <Route path="/admin/analytics" element={<Analytics />} />
        <Route path="/admin/predictions" element={<Predictions />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;