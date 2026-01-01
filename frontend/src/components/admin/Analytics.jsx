import React from 'react';
import Sidebar from '../shared/Sidebar';
import { analyticsData, mlPredictions } from '../../data/mockData';
import '../../styles/admin.css';
import '../../styles/global.css';

const Analytics = ({ onNavigate, goBack, currentPage }) => {
  const maxValue = Math.max(...analyticsData.queueTrends.map(d => d.value));

  return (
    <div className="admin-layout">
      <Sidebar currentPage={currentPage} onNavigate={onNavigate} goBack={goBack} />
      <main className="admin-main">
        <div className="admin-header">
          <h1>Analytics & Reports</h1>
          <p style={{ margin: '0.5rem 0 0 0', color: '#6B7280', fontSize: '0.875rem' }}>
            Comprehensive analytics with ML-powered insights
          </p>
        </div>

        {/* ML Insights Banner */}
        <div className="card" style={{
          background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
          color: '#FFFFFF',
          marginBottom: '2rem',
          padding: '1.5rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ margin: 0, marginBottom: '0.5rem' }}>🤖 ML Model Performance</h3>
              <p style={{ margin: 0, opacity: 0.9, fontSize: '0.875rem' }}>
                Real-time predictions with {mlPredictions.mlModelStats.modelAccuracy}% accuracy
              </p>
            </div>
            <button 
              className="btn-primary"
              onClick={() => onNavigate('predictions')}
              style={{ 
                backgroundColor: '#FFFFFF', 
                color: '#3B82F6',
                border: 'none'
              }}
            >
              View All Predictions →
            </button>
          </div>
        </div>

        <div className="analytics-container">
          <div className="analytics-card">
            <h3 className="analytics-title">Queue Trends (Today)</h3>
            <div className="chart-container">
              {analyticsData.queueTrends.map((item, index) => {
                const height = (item.value / maxValue) * 100;
                return (
                  <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div className="chart-bar" style={{ height: `${height}%`, width: '100%' }}>
                      <span className="chart-value">{item.value}</span>
                    </div>
                    <span className="chart-label">{item.hour}</span>
                  </div>
                );
              })}
            </div>
            <div className="chart-legend">
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#3B82F6' }}></div>
                <span>Queue Count</span>
              </div>
            </div>
          </div>

          <div className="analytics-card">
            <h3 className="analytics-title">Peak Hours</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {analyticsData.peakHours.map((item, index) => (
                <div key={index} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem',
                  backgroundColor: '#F3F4F6',
                  borderRadius: '8px'
                }}>
                  <span style={{ fontWeight: 500 }}>{item.hour}</span>
                  <span style={{ fontWeight: 600, color: '#3B82F6' }}>{item.count} customers</span>
                </div>
              ))}
            </div>
          </div>

          <div className="analytics-card">
            <h3 className="analytics-title">Service Popularity</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {analyticsData.servicePopularity.map((item, index) => {
                const maxCount = Math.max(...analyticsData.servicePopularity.map(s => s.count));
                const width = (item.count / maxCount) * 100;
                return (
                  <div key={index}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 500 }}>{item.service}</span>
                      <span style={{ fontWeight: 600, color: '#3B82F6' }}>{item.count}</span>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '8px',
                      backgroundColor: '#E5E7EB',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${width}%`,
                        height: '100%',
                        background: 'linear-gradient(to right, #3B82F6, #60A5FA)',
                        borderRadius: '4px',
                        transition: 'width 0.3s ease'
                      }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ML Predictions Summary */}
          <div className="analytics-card">
            <h3 className="analytics-title">🔮 ML Predictions Summary</h3>
            <div style={{ marginBottom: '1rem', fontSize: '0.875rem', color: '#6B7280' }}>
              Next 6 hours peak time predictions
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {mlPredictions.peakTimes.slice(0, 6).map((item, index) => {
                const maxCustomers = Math.max(...mlPredictions.peakTimes.map(p => p.customers));
                const width = (item.customers / maxCustomers) * 100;
                const color = item.prediction === 'High' ? '#EF4444' : item.prediction === 'Medium' ? '#F59E0B' : '#10B981';
                return (
                  <div key={index} style={{
                    padding: '1rem',
                    backgroundColor: '#F9FAFB',
                    borderRadius: '8px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 600 }}>{item.hour}</span>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                          {item.customers} customers
                        </span>
                        <span className="badge" style={{ 
                          backgroundColor: `${color}20`, 
                          color: color 
                        }}>
                          {item.prediction}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                          {item.confidence}%
                        </span>
                      </div>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '6px',
                      backgroundColor: '#E5E7EB',
                      borderRadius: '3px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${width}%`,
                        height: '100%',
                        backgroundColor: color,
                        borderRadius: '3px'
                      }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Analytics;

