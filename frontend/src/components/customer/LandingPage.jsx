import React, { useState } from 'react';
import Header from '../shared/Header';
import '../../styles/customer.css';

const LandingPage = ({ onNavigate, goBack, currentPage }) => {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const companies = [
    { name: 'City General Hospital', logo: '🏥', industry: 'Healthcare' },
    { name: 'National Bank', logo: '🏦', industry: 'Banking' },
    { name: 'Tech Corp', logo: '💼', industry: 'Technology' },
    { name: 'Regional Passport Office', logo: '🏛️', industry: 'Government' },
    { name: 'Metro University', logo: '🎓', industry: 'Education' },
    { name: 'Prime Retail', logo: '🛍️', industry: 'Retail' }
  ];

  const faqs = [
    {
      question: 'What is Smart\'Q?',
      answer: 'Smart\'Q is an innovative queue management system that helps organizations manage customer queues efficiently while providing real-time updates and crowd predictions to customers.'
    },
    {
      question: 'How does the queue tracking work?',
      answer: 'Once you join a queue, you receive a token number. Our system tracks your position in real-time and provides estimated waiting times based on current queue flow and crowd levels.'
    },
    {
      question: 'Can I book slots for events in advance?',
      answer: 'Yes! You can view scheduled events and book slots using QR codes. Simply scan the QR code for any event to quickly join the queue for that specific event.'
    },
    {
      question: 'What do the crowd level indicators mean?',
      answer: 'Green (Low) means minimal wait time, Yellow (Medium) indicates moderate waiting, and Red (High) suggests longer wait times. Use this to plan your visit accordingly.'
    },
    {
      question: 'Is Smart\'Q free to use?',
      answer: 'Smart\'Q is free for customers. Organizations can contact us for enterprise pricing and implementation details.'
    },
    {
      question: 'How do I get started?',
      answer: 'Simply click "Join Queue" on the homepage, select your service, and you\'ll receive a token number. You can track your position in real-time through your dashboard.'
    }
  ];

  return (
    <div>
      <Header onNavigate={onNavigate} goBack={goBack} currentPage={currentPage} />
      
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Smart Queue Management with Live Crowd Prediction</h1>
          <p className="hero-subtitle">
            Experience seamless queue management with real-time crowd predictions. 
            Join queues, track your position, and manage your time efficiently.
          </p>
          <div className="hero-buttons">
            <button 
              className="hero-button hero-button-primary"
              onClick={() => onNavigate('join-queue')}
            >
              Join Queue
            </button>
            <button 
              className="hero-button hero-button-secondary"
              onClick={() => onNavigate('login')}
            >
              Login
            </button>
          </div>
        </div>
        <div className="hero-image-wrapper">
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            maxWidth: '600px',
            height: '400px',
            margin: '0 auto',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)'
          }}>
            <img 
              src="/smartq-logo.jpg" 
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

      {/* Key Features Section */}
      <section style={{ 
        padding: '4rem 2rem', 
        maxWidth: '1200px', 
        margin: '0 auto',
        textAlign: 'center',
        backgroundColor: '#FFFFFF'
      }}>
        <h2 style={{ marginBottom: '2rem', color: '#0F172A' }}>Key Features</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2rem',
          marginTop: '2rem'
        }}>
          <div className="card">
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏱️</div>
            <h3>Real-time Tracking</h3>
            <p>Track your position in the queue and estimated waiting time in real-time.</p>
          </div>
          <div className="card">
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
            <h3>Crowd Prediction</h3>
            <p>Get live predictions about crowd levels to plan your visit better.</p>
          </div>
          <div className="card">
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
            <h3>Event Scheduling</h3>
            <p>View and book slots for upcoming events and appointments.</p>
          </div>
        </div>
      </section>
      
      {/* About Section */}
      <section style={{
        padding: '4rem 2rem',
        maxWidth: '1200px',
        margin: '0 auto',
        background: 'linear-gradient(135deg, #F8FAFC 0%, #FFFFFF 100%)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#0F172A' }}>
            About Smart'Q
          </h1>
          <p style={{ fontSize: '1.25rem', color: '#475569', maxWidth: '800px', margin: '0 auto' }}>
            Revolutionizing queue management with intelligent technology
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem',
          marginTop: '2rem'
        }}>
          <div className="card">
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
            <h3>Our Mission</h3>
            <p>
              To eliminate waiting time uncertainty and transform the queue experience 
              for both customers and service providers through smart technology.
            </p>
          </div>
          <div className="card">
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💡</div>
            <h3>Our Vision</h3>
            <p>
              To become the leading queue management solution, making every service 
              interaction seamless, efficient, and customer-friendly.
            </p>
          </div>
          <div className="card">
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚀</div>
            <h3>Innovation</h3>
            <p>
              Leveraging real-time data analytics and AI-powered predictions to 
              optimize queue flow and enhance customer satisfaction.
            </p>
          </div>
        </div>
      </section>

      {/* Companies Using Smart'Q */}
      <section style={{
        padding: '4rem 2rem',
        maxWidth: '1200px',
        margin: '0 auto',
        backgroundColor: '#FFFFFF'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#0F172A' }}>
            Trusted by Leading Organizations
          </h2>
          <p style={{ fontSize: '1.125rem', color: '#475569' }}>
            Join hundreds of companies already using Smart'Q
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginTop: '2rem'
        }}>
          {companies.map((company, index) => (
            <div key={index} className="card" style={{
              textAlign: 'center',
              padding: '2rem',
              transition: 'transform 0.2s ease'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{company.logo}</div>
              <h3 style={{ marginBottom: '0.5rem', color: '#0F172A' }}>{company.name}</h3>
              <p style={{ color: '#475569', fontSize: '0.875rem' }}>{company.industry}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Smart'Q Section */}
      <section style={{
        padding: '4rem 2rem',
        maxWidth: '1200px',
        margin: '0 auto',
        backgroundColor: '#FFFFFF',
        color: '#0F172A',
        marginTop: '2rem',
        marginBottom: '2rem'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#0F172A' }}>Why Choose Smart'Q?</h2>
          <p style={{ fontSize: '1.125rem', color: '#475569' }}>
            Experience the difference with our comprehensive queue management solution
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem'
        }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⚡</div>
            <h3 style={{ marginBottom: '0.75rem', color: '#0F172A' }}>Real-Time Updates</h3>
            <p style={{ color: '#475569' }}>
              Get instant notifications about your queue position and estimated wait times, 
              allowing you to plan your time effectively.
            </p>
          </div>
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📊</div>
            <h3 style={{ marginBottom: '0.75rem', color: '#0F172A' }}>Crowd Prediction</h3>
            <p style={{ color: '#475569' }}>
              AI-powered crowd level predictions help you choose the best time to visit, 
              reducing your waiting time significantly.
            </p>
          </div>
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📱</div>
            <h3 style={{ marginBottom: '0.75rem', color: '#0F172A' }}>QR Code Booking</h3>
            <p style={{ color: '#475569' }}>
              Quick and easy slot booking through QR codes. Scan and join queues instantly 
              without any hassle.
            </p>
          </div>
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🎯</div>
            <h3 style={{ marginBottom: '0.75rem', color: '#0F172A' }}>Event Scheduling</h3>
            <p style={{ color: '#475569' }}>
              View and book slots for upcoming events in advance, ensuring you never miss 
              important appointments.
            </p>
          </div>
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔒</div>
            <h3 style={{ marginBottom: '0.75rem', color: '#0F172A' }}>Secure & Reliable</h3>
            <p style={{ color: '#475569' }}>
              Your data is protected with enterprise-grade security. Our system is reliable 
              and available 24/7.
            </p>
          </div>
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>💼</div>
            <h3 style={{ marginBottom: '0.75rem', color: '#0F172A' }}>Enterprise Ready</h3>
            <p style={{ color: '#475569' }}>
              Scalable solution for organizations of all sizes. Easy integration with 
              existing systems and workflows.
            </p>
          </div>
        </div>
      </section>

      {/* ML & AI Features Section */}
      <section style={{
        padding: '4rem 2rem',
        maxWidth: '1200px',
        margin: '0 auto',
        backgroundColor: '#FFFFFF',
        color: '#0F172A',
        marginTop: '2rem',
        marginBottom: '2rem'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#0F172A' }}>🤖 Powered by Machine Learning</h2>
          <p style={{ fontSize: '1.125rem', color: '#475569' }}>
            Advanced AI algorithms for accurate predictions and optimal queue management
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem'
        }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔮</div>
            <h3 style={{ marginBottom: '0.75rem', color: '#0F172A' }}>Peak Time Prediction</h3>
            <p style={{ color: '#475569' }}>
              Our ML models analyze historical patterns to predict peak hours with 92% accuracy, 
              helping you avoid long waits.
            </p>
          </div>
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⏱️</div>
            <h3 style={{ marginBottom: '0.75rem', color: '#0F172A' }}>Wait Time Forecasting</h3>
            <p style={{ color: '#475569' }}>
              Real-time wait time predictions using machine learning algorithms trained on 
              millions of queue interactions.
            </p>
          </div>
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>👥</div>
            <h3 style={{ marginBottom: '0.75rem', color: '#0F172A' }}>Crowd Level AI</h3>
            <p style={{ color: '#475569' }}>
              Advanced neural networks predict crowd levels hours in advance, enabling 
              better planning and resource allocation.
            </p>
          </div>
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📈</div>
            <h3 style={{ marginBottom: '0.75rem', color: '#0F172A' }}>Pattern Recognition</h3>
            <p style={{ color: '#475569' }}>
              Deep learning models identify patterns in queue behavior, optimizing 
              service flow and reducing bottlenecks.
            </p>
          </div>
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🎯</div>
            <h3 style={{ marginBottom: '0.75rem', color: '#0F172A' }}>Optimal Scheduling</h3>
            <p style={{ color: '#475569' }}>
              AI recommends the best times to visit based on predicted wait times, 
              crowd levels, and your preferences.
            </p>
          </div>
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔄</div>
            <h3 style={{ marginBottom: '0.75rem', color: '#0F172A' }}>Continuous Learning</h3>
            <p style={{ color: '#475569' }}>
              Our models continuously learn and improve from new data, ensuring 
              predictions become more accurate over time.
            </p>
          </div>
        </div>

        <div className="card" style={{
          marginTop: '3rem',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <h3 style={{ marginBottom: '1rem', color: '#0F172A' }}>ML Model Performance</h3>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '3rem',
            flexWrap: 'wrap'
          }}>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#1E40AF' }}>92%</div>
              <div style={{ fontSize: '0.875rem', color: '#475569' }}>Model Accuracy</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#1E40AF' }}>88%</div>
              <div style={{ fontSize: '0.875rem', color: '#475569' }}>Avg Prediction Accuracy</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#1E40AF' }}>156</div>
              <div style={{ fontSize: '0.875rem', color: '#475569' }}>Predictions Today</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section style={{
        padding: '4rem 2rem',
        maxWidth: '1200px',
        margin: '0 auto',
        backgroundColor: '#FFFFFF'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#0F172A' }}>
            Frequently Asked Questions
          </h2>
          <p style={{ fontSize: '1.125rem', color: '#475569' }}>
            Everything you need to know about Smart'Q
          </p>
        </div>

        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {faqs.map((faq, index) => (
            <div key={index} className="card" style={{
              marginBottom: '1rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }} onClick={() => toggleFaq(index)}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h3 style={{ margin: 0, color: '#0F172A', fontSize: '1.125rem' }}>
                  {faq.question}
                </h3>
                <span style={{
                  fontSize: '1.5rem',
                  color: '#1E40AF',
                  transition: 'transform 0.2s ease',
                  transform: openFaq === index ? 'rotate(180deg)' : 'rotate(0deg)'
                }}>
                  ▼
                </span>
              </div>
              {openFaq === index && (
                <p style={{
                  marginTop: '1rem',
                  color: '#475569',
                  paddingTop: '1rem',
                  borderTop: '1px solid #E2E8F0'
                }}>
                  {faq.answer}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Contact & Footer Section */}
      <footer style={{
        backgroundColor: 'rgb(11, 61, 122)',
        color: '#FFFFFF',
        padding: '3rem 2rem',
        marginTop: '4rem'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2rem'
        }}>
          <div>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', color: '#FFFFFF', fontWeight: 700 }}>Smart'Q</h3>
            <p style={{ color: 'white', lineHeight: '1.6', fontSize: '0.9375rem' }}>
            Smarter queue management powered by intelligent technology—delivering seamless and efficient service experiences.
            </p>
          </div>

          <div>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', color: '#FFFFFF', fontWeight: 700 }}>Quick Links</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '0.5rem' }}>
                <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('landing'); }} style={{ color: '#E2E8F0', textDecoration: 'none', fontSize: '0.9375rem', fontWeight: 500 }}>
                  Home
                </a>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('login'); }} style={{ color: '#E2E8F0', textDecoration: 'none', fontSize: '0.9375rem', fontWeight: 500 }}>
                  Login
                </a>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('join-queue'); }} style={{ color: '#E2E8F0', textDecoration: 'none', fontSize: '0.9375rem', fontWeight: 500 }}>
                  Join Queue
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', color: '#FFFFFF', fontWeight: 700 }}>Contact Us</h3>
            <div style={{ lineHeight: '2' }}>
              <p style={{ margin: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#E2E8F0' }}>📧</span>
                <a href="mailto:info@smartq.com" style={{ color: '#E2E8F0', textDecoration: 'none', fontSize: '0.9375rem', fontWeight: 500 }}>
                  hello@smartq.app
                </a>
              </p>
              <p style={{ margin: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#E2E8F0' }}>📞</span>
                <a href="tel:+1234567890" style={{ color: '#E2E8F0', textDecoration: 'none', fontSize: '0.9375rem', fontWeight: 500 }}>
                  +91 9048415225
                </a>
              </p>
              <p style={{ margin: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#E2E8F0', fontSize: '0.9375rem' }}>
                <span>📍</span>
                <span>St Joseph's University, Bangalore</span>
              </p>
            </div>
          </div>

          <div>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', color: '#FFFFFF', fontWeight: 700 }}>Follow Us</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
              <a 
                href="mailto:hello@smartq.app" 
                style={{ 
                  color: '#E2E8F0', 
                  fontSize: '0.9375rem', 
                  textDecoration: 'none', 
                  transition: 'color 0.2s', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  fontWeight: 500
                }}
                onMouseOver={(e) => e.target.style.color = '#FFFFFF'}
                onMouseOut={(e) => e.target.style.color = '#E2E8F0'}
              >
                <span>📧</span> Email
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ 
                  color: '#E2E8F0', 
                  fontSize: '0.9375rem', 
                  textDecoration: 'none', 
                  transition: 'color 0.2s', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  fontWeight: 500
                }}
                onMouseOver={(e) => e.target.style.color = '#FFFFFF'}
                onMouseOut={(e) => e.target.style.color = '#E2E8F0'}
              >
                <span>📷</span> Instagram
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ 
                  color: '#E2E8F0', 
                  fontSize: '0.9375rem', 
                  textDecoration: 'none', 
                  transition: 'color 0.2s', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  fontWeight: 500
                }}
                onMouseOver={(e) => e.target.style.color = '#FFFFFF'}
                onMouseOut={(e) => e.target.style.color = '#E2E8F0'}
              >
                <span>💼</span> LinkedIn
              </a>
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ 
                  color: '#E2E8F0', 
                  fontSize: '0.9375rem', 
                  textDecoration: 'none', 
                  transition: 'color 0.2s', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  fontWeight: 500
                }}
                onMouseOver={(e) => e.target.style.color = '#FFFFFF'}
                onMouseOut={(e) => e.target.style.color = '#E2E8F0'}
              >
                <span>💻</span> GitHub
              </a>
            </div>
          </div>
        </div>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          paddingTop: '2rem',
          marginTop: '2rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          textAlign: 'center'
        }}>
          <p style={{ color: '#E2E8F0', fontSize: '0.875rem', margin: 0 }}>
            © 2024 Smart'Q. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;