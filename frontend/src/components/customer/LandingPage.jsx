import React, { useState, useEffect } from "react";
import Header from "../shared/Header";
import "../../styles/customer.css";

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
} from "lucide-react";

const LandingPage = ({ onNavigate, goBack, currentPage }) => {

  const [openFaq, setOpenFaq] = useState(null);
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const initialTheme = localStorage.getItem("smartq-theme") || "light";
    setTheme(initialTheme);

    const handleThemeChange = () => {
      const currentTheme =
        document.documentElement.getAttribute("data-theme") || "light";
      setTheme(currentTheme);
    };

    const handleStorageChange = () => {
      const savedTheme = localStorage.getItem("smartq-theme") || "light";
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    };

    window.addEventListener("storage", handleStorageChange);

    const observer = new MutationObserver(handleThemeChange);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"]
    });

    return () => {
      observer.disconnect();
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const companies = [
    { name: "City General Hospital", logo: <Stethoscope size={48} />, industry: "Healthcare" },
    { name: "National Bank", logo: <Landmark size={48} />, industry: "Banking" },
    { name: "Tech Corp", logo: <Cpu size={48} />, industry: "Technology" },
    { name: "Regional Passport Office", logo: <Building2 size={48} />, industry: "Government" },
    { name: "Metro University", logo: <GraduationCap size={48} />, industry: "Education" },
    { name: "Prime Retail", logo: <ShoppingBag size={48} />, industry: "Retail" }
  ];

  const faqs = [
    {
      question: "What is Smart'Q?",
      answer:
        "Smart'Q is an innovative queue management system that helps organizations manage queues efficiently with real-time updates and crowd prediction."
    },
    {
      question: "How does queue tracking work?",
      answer:
        "Once you join a queue you receive a token number and can track your position live."
    },
    {
      question: "Can I book slots in advance?",
      answer:
        "Yes. Events and services allow advance booking using QR codes."
    },
    {
      question: "What do crowd indicators mean?",
      answer:
        "Green means low wait, yellow moderate wait, red high wait."
    },
    {
      question: "Is Smart'Q free?",
      answer:
        "Customers use Smart'Q for free. Organizations can contact us for enterprise plans."
    }
  ];

  return (
    <div style={{ backgroundColor: "var(--bg-secondary)", minHeight: "100vh" }}>

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
              onClick={() => onNavigate("join-queue")}
            >
              Join as Guest
            </button>

            <button
              className="hero-button hero-button-secondary"
              onClick={() => onNavigate("login")}
              style={{
                borderColor: "var(--color-white)",
                color: "var(--color-white)"
              }}
            >
              Login
            </button>

          </div>

        </div>

        <div className="hero-image-wrapper">

          <img
            src={theme === "dark" ? "/smartq-logo-dark.jpg" : "/smartq-logo.jpg"}
            alt="SmartQ"
            style={{
              maxWidth: "420px",
              width: "100%",
              borderRadius: "16px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.2)"
            }}
          />

        </div>

      </section>

      {/* FEATURES */}

      <section className="features-section">

        <h2>Key Features</h2>

        <div className="features-grid">

          <div className="feature-card">
            <Clock size={36} />
            <h3>Real-time Tracking</h3>
            <p>Track your queue position live.</p>
          </div>

          <div className="feature-card">
            <Users size={36} />
            <h3>Crowd Prediction</h3>
            <p>Know peak hours before visiting.</p>
          </div>

          <div className="feature-card">
            <Calendar size={36} />
            <h3>Event Scheduling</h3>
            <p>Book slots in advance easily.</p>
          </div>

        </div>

      </section>

      {/* COMPANIES */}

      <section className="companies-section">

        <h2>Trusted by Organizations</h2>

        <div className="companies-grid">

          {companies.map((company, i) => (
            <div key={i} className="company-card">
              {company.logo}
              <h4>{company.name}</h4>
              <p>{company.industry}</p>
            </div>
          ))}

        </div>

      </section>

      {/* FAQ */}

      <section className="faq-section">

        <h2>Frequently Asked Questions</h2>

        {faqs.map((faq, index) => (

          <div key={index} className="faq-item" onClick={() => toggleFaq(index)}>

            <div className="faq-question">
              {faq.question}
              {openFaq === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>

            {openFaq === index && (
              <p className="faq-answer">{faq.answer}</p>
            )}

          </div>

        ))}

      </section>

      {/* FOOTER */}

      <footer className="landing-footer">

        <div className="footer-grid">

          <div>
            <h3>Smart'Q</h3>
            <p>
              Smarter queue management powered by intelligent technology.
            </p>
          </div>

          <div>
            <h3>Quick Links</h3>

            <p onClick={() => onNavigate("landing")}>Home</p>
            <p onClick={() => onNavigate("login")}>Login</p>
            <p onClick={() => onNavigate("join-queue")}>Join Queue</p>

          </div>

          <div>
            <h3>Contact</h3>
            <p><Mail size={16}/> info@smartq.app</p>
            <p><Phone size={16}/> +91 1234567890</p>
            <p><MapPin size={16}/> Bangalore</p>
          </div>

          <div>
            <h3>Follow Us</h3>
            <div style={{display:"flex",gap:"10px"}}>
              <Instagram/>
              <Linkedin/>
              <Github/>
            </div>
          </div>

        </div>

        <p style={{textAlign:"center",marginTop:"20px"}}>
          © 2025 Smart'Q
        </p>

      </footer>

    </div>
  );
};

export default LandingPage;