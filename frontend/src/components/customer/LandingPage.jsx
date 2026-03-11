import React, { useState, useEffect } from 'react';
import Header from '../shared/Header';
import '../../../styles/customer.css';

import {
  Building2,
  Landmark,
  Cpu,
  GraduationCap,
  ShoppingBag,
  Stethoscope,
  Clock,
  Users,
  Calendar,
  Target,
  Lightbulb,
  Rocket,
  Zap,
  BarChart2,
  Smartphone,
  CalendarDays,
  ShieldCheck,
  Briefcase,
  Brain,
  Hourglass,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  MapPin,
  Instagram,
  Linkedin,
  Github
} from 'lucide-react';

const LandingPage = ({ onNavigate, goBack, currentPage }) => {

  const [openFaq, setOpenFaq] = useState(null);
  const [theme, setTheme] = useState('light');

  useEffect(() => {

    const initialTheme = localStorage.getItem('smartq-theme') || 'light';
    setTheme(initialTheme);

    const handleThemeChange = () => {
      const currentTheme =
        document.documentElement.getAttribute('data-theme') || 'light';
      setTheme(currentTheme);
    };

    const handleStorageChange = () => {
      const savedTheme = localStorage.getItem('smartq-theme') || 'light';
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    };

    window.addEventListener('storage', handleStorageChange);

    const observer = new MutationObserver(handleThemeChange);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    return () => {
      observer.disconnect();
      window.removeEventListener('storage', handleStorageChange);
    };

  }, []);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const companies = [
    { name: 'City General Hospital', logo: <Stethoscope size={48} color="#2563EB" />, industry: 'Healthcare' },
    { name: 'National Bank', logo: <Landmark size={48} color="#2563EB" />, industry: 'Banking' },
    { name: 'Tech Corp', logo: <Cpu size={48} color="#2563EB" />, industry: 'Technology' },
    { name: 'Regional Passport Office', logo: <Building2 size={48} color="#2563EB" />, industry: 'Government' },
    { name: 'Metro University', logo: <GraduationCap size={48} color="#2563EB" />, industry: 'Education' },
    { name: 'Prime Retail', logo: <ShoppingBag size={48} color="#2563EB" />, industry: 'Retail' }
  ];

  const faqs = [
    {
      question: "What is Smart'Q?",
      answer:
        "Smart'Q is an innovative queue management system that helps organizations manage customer queues efficiently while providing real-time updates and crowd predictions to customers."
    },
    {
      question: 'How does the queue tracking work?',
      answer:
        'Once you join a queue, you receive a token number. Our system tracks your position in real-time and provides estimated waiting times based on current queue flow and crowd levels.'
    },
    {
      question: 'Can I book slots for events in advance?',
      answer:
        'Yes! You can view scheduled events and book slots using QR codes. Simply scan the QR code for any event to quickly join the queue.'
    },
    {
      question: 'What do the crowd level indicators mean?',
      answer:
        'Green means minimal wait time, Yellow moderate waiting, and Red suggests longer wait times.'
    },
    {
      question: "Is Smart'Q free to use?",
      answer:
        "Smart'Q is free for customers. Organizations can contact us for enterprise pricing."
    },
    {
      question: 'How do I get started?',
      answer:
        'Click "Join Queue", select your service, and you will receive a token number.'
    }
  ];

  return (
    <div style={{ backgroundColor: 'var(--bg-secondary)', minHeight: '100vh' }}>

      <Header onNavigate={onNavigate} goBack={goBack} currentPage={currentPage} />

      {/* HERO */}

      <section className="hero-section">

        <div className="hero-content">

          <h1 className="hero-title">
            Smart Queue Management with Live Crowd Prediction
          </h1>

          <p className="hero-subtitle">
            Experience seamless queue management with real-time crowd predictions.
            Join queues, track your position, and manage your time efficiently.
          </p>

          <div className="hero-buttons">

            <button
              className="hero-button hero-button-primary"
              onClick={() => onNavigate('join-queue')}
            >
              Join as Guest
            </button>

            <button
              className="hero-button hero-button-secondary"
              onClick={() => onNavigate('login')}
              style={{
                borderColor: 'var(--color-white)',
                color: 'var(--color-white)'
              }}
            >
              Login
            </button>

          </div>

        </div>

        <div className="hero-image-wrapper">

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              maxWidth: '600px',
              height: '400px',
              margin: '0 auto',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
            }}
          >

            <img
            src={theme === 'dark' ? "/smartq-logo-dark.jpg" : "/smartq-logo.jpg"}
            alt="Smart'Q Logo"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '16px'
            }}
            />

          </div>

        </div>

      </section>

      {/* Remaining sections unchanged */}

      {/* Footer */}

      <footer className="landing-footer">
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '2rem'
            }}
          >

            <div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Smart'Q</h3>
              <p>
                Smarter queue management powered by intelligent technology—
                delivering seamless and efficient service experiences.
              </p>
            </div>

            <div>
              <h3>Quick Links</h3>

              <ul style={{ listStyle: 'none', padding: 0 }}>

                <li>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate('landing');
                    }}
                  >
                    Home
                  </a>
                </li>

                <li>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate('login');
                    }}
                  >
                    Login
                  </a>
                </li>

                <li>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate('join-queue');
                    }}
                  >
                    Join Queue
                  </a>
                </li>

              </ul>

            </div>

            <div>
              <h3>Contact Us</h3>
              <p><Mail size={16}/> info@smartq.app</p>
              <p><Phone size={16}/> +91 1234567890</p>
              <p><MapPin size={16}/> Bangalore, India</p>
            </div>

            <div>
              <h3>Follow Us</h3>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <Instagram size={24}/>
                <Linkedin size={24}/>
                <Github size={24}/>
              </div>

            </div>

          </div>

          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <p>© 2025 Smart'Q. All rights reserved.</p>
          </div>

        </div>
      </footer>

    </div>
  );
};

export default LandingPage;