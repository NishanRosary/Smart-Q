import React, { useState, useEffect } from 'react';
import { checkBackendHealth } from './services/api';
import './styles/global.css';

// Customer Components
import LandingPage from './components/customer/LandingPage';
import CustomerLogin from './components/customer/CustomerLogin';
import CustomerDashboard from './components/customer/CustomerDashboard';
import JoinQueue from './components/customer/JoinQueue';
import WelcomePage from './components/customer/WelcomePage';

// Admin Components
import AdminLogin from './components/admin/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';
import EventScheduler from './components/admin/EventScheduler';
import QueueManagement from './components/admin/QueueManagement';
import CounterManagement from './components/admin/CounterManagement';
import Analytics from './components/admin/Analytics';
import Predictions from './components/admin/Predictions';

function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [pageData, setPageData] = useState(null);
  const [backendStatus, setBackendStatus] = useState('');

  const navigate = (page, data = null) => {
    setCurrentPage(page);
    setPageData(data);
  };

  useEffect(() => {
  checkBackendHealth()
    .then((data) => {
      console.log(data.message);
      setBackendStatus(data.message);
    })
    .catch(() => {
      console.error("Backend not reachable");
      setBackendStatus("Backend not reachable ❌");
    });
}, []);

  const renderPage = () => {
    switch (currentPage) {
      // Customer Pages
      case 'landing':
        return <LandingPage onNavigate={navigate} />;
      case 'login':
        return <CustomerLogin onNavigate={navigate} />;
      case 'customer-dashboard':
        return <CustomerDashboard onNavigate={navigate} />;
      case 'join-queue':
        return <JoinQueue onNavigate={navigate} eventData={pageData} />;
      case 'welcome':
        return <WelcomePage onNavigate={navigate} />;
      
      // Admin Pages
      case 'admin-login':
        return <AdminLogin onNavigate={navigate} />;
      case 'admin-dashboard':
        return <AdminDashboard onNavigate={navigate} currentPage={currentPage} />;
      case 'event-scheduler':
        return <EventScheduler onNavigate={navigate} currentPage={currentPage} />;
      case 'queue-management':
        return <QueueManagement onNavigate={navigate} currentPage={currentPage} />;
      case 'counter-management':
        return <CounterManagement onNavigate={navigate} currentPage={currentPage} />;
      case 'analytics':
        return <Analytics onNavigate={navigate} currentPage={currentPage} />;
      case 'predictions':
        return <Predictions onNavigate={navigate} currentPage={currentPage} />;
      case 'settings':
        return <AdminDashboard onNavigate={navigate} currentPage={currentPage} />;
      
      default:
        return <LandingPage onNavigate={navigate} />;
    }
  };

  return ( 
  <div className="App">
     {renderPage()} 
     </div>
      );
}

export default App;

