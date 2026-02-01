import React from 'react';
import Sidebar from '../shared/Sidebar';
import { mlPredictions } from '../../data/mockData';
import '../../styles/admin.css';
import '../../styles/global.css';

const Predictions = ({ onNavigate, goBack, currentPage }) => {
  const getPredictionColor = (level) => {
    switch (level) {
      case 'High':
        return '#EF4444';
      case 'Medium':
        return 'var(--color-yellow)';
      case 'Low':
        return 'var(--color-green-light)';
      default:
        return 'var(--color-gray-500)';
    }
  };

  const getPredictionBadge = (level) => {
    const color = getPredictionColor(level);
    return (
      <span className="badge" style={{ backgroundColor: `${color}20`, color: color }}>
        {level}
      </span>
    );
  };

  return (
    <div className="admin-layout">
      <Sidebar currentPage={currentPage} onNavigate={onNavigate} goBack={goBack} />
      <main className="admin-main">
        <div className="admin-header">
          <h1>ML-Powered Predictions</h1>
          <p style={{ margin: '0.5rem 0 0 0', color: 'var(--color-gray-500)', fontSize: '0.875rem' }}>
            AI-driven insights powered by machine learning algorithms
          </p>
        </div>

        {/* ML Model Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div className="card">
            <div style={{ fontSize: '0.875rem', color: 'var(--color-gray-500)', marginBottom: '0.5rem' }}>Model Accuracy</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-green-light)' }}>
              {mlPredictions.mlModelStats.modelAccuracy}%
            </div>
          </div>
          <div className="card">
            <div style={{ fontSize: '0.875rem', color: 'var(--color-gray-500)', marginBottom: '0.5rem' }}>Predictions Today</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-primary)' }}>
              {mlPredictions.mlModelStats.predictionsToday}
            </div>
          </div>
          <div className="card">
            <div style={{ fontSize: '0.875rem', color: 'var(--color-gray-500)', marginBottom: '0.5rem' }}>Avg Accuracy</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#8B5CF6' }}>
              {mlPredictions.mlModelStats.avgAccuracy}%
            </div>
          </div>
          <div className="card">
            <div style={{ fontSize: '0.875rem', color: 'var(--color-gray-500)', marginBottom: '0.5rem' }}>Last Updated</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-gray-900)' }}>
              {mlPredictions.mlModelStats.lastUpdated}
            </div>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {/* Peak Time Predictions */}
          <div className="analytics-card">
            <h3 className="analytics-title">
              🔮 Peak Time Predictions (ML)
            </h3>
            <div style={{ marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--color-gray-500)' }}>
              Predicted using historical data and ML algorithms
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {mlPredictions.peakTimes.map((item, index) => {
                const maxCustomers = Math.max(...mlPredictions.peakTimes.map(p => p.customers));
                const width = (item.customers / maxCustomers) * 100;
                return (
                  <div key={index} style={{
                    padding: '1rem',
                    backgroundColor: '#F9FAFB',
                    borderRadius: '8px',
                    border: `2px solid ${getPredictionColor(item.prediction)}40`
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <div>
                        <span style={{ fontWeight: 600, fontSize: '1.125rem' }}>{item.hour}</span>
                        <span style={{ marginLeft: '0.5rem' }}>{getPredictionBadge(item.prediction)}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 600, color: 'var(--color-gray-900)' }}>{item.customers} customers</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)' }}>{item.confidence}% confidence</div>
                      </div>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '8px',
                      backgroundColor: 'var(--color-gray-200)',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      marginTop: '0.5rem'
                    }}>
                      <div style={{
                        width: `${width}%`,
                        height: '100%',
                        background: `linear-gradient(to right, ${getPredictionColor(item.prediction)}, ${getPredictionColor(item.prediction)}80)`,
                        borderRadius: '4px'
                      }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Wait Time Predictions */}
          <div className="analytics-card">
            <h3 className="analytics-title">
              ⏱️ Wait Time Predictions (ML)
            </h3>
            <div style={{ marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--color-gray-500)' }}>
              AI-predicted wait times with accuracy metrics
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {mlPredictions.waitTimePredictions.map((item, index) => (
                <div key={index} style={{
                  padding: '1.5rem',
                  backgroundColor: '#F9FAFB',
                  borderRadius: '8px',
                  border: '1px solid var(--color-gray-200)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '1.125rem', marginBottom: '0.25rem' }}>
                        {item.time}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--color-gray-500)' }}>
                        Predicted: {item.predictedWait} min
                        {item.actualWait && ` | Actual: ${item.actualWait} min`}
                      </div>
                    </div>
                    <div style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: item.accuracy >= 90 ? 'var(--color-green-bg)' : item.accuracy >= 80 ? 'var(--color-yellow-bg)' : '#FEE2E2',
                      borderRadius: '6px',
                      fontWeight: 600,
                      color: item.accuracy >= 90 ? 'var(--color-green)' : item.accuracy >= 80 ? 'var(--color-yellow)' : '#991B1B'
                    }}>
                      {item.accuracy}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Crowd Forecast */}
        <div className="analytics-card" style={{ marginBottom: '2rem' }}>
          <h3 className="analytics-title">
            📊 Crowd Level Forecast (ML)
          </h3>
          <div style={{ marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--color-gray-500)' }}>
            7-day forecast using machine learning models
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem'
          }}>
            {mlPredictions.crowdForecast.map((item, index) => (
              <div key={index} className="card" style={{
                textAlign: 'center',
                padding: '1.5rem',
                border: `2px solid ${getPredictionColor(item.level)}40`
              }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-gray-500)', marginBottom: '0.5rem' }}>
                  {item.date}
                </div>
                <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
                  {item.time}
                </div>
                <div style={{ marginBottom: '0.5rem' }}>
                  {getPredictionBadge(item.level)}
                </div>
                <div style={{
                  fontSize: '0.875rem',
                  color: 'var(--color-gray-500)',
                  marginTop: '0.5rem'
                }}>
                  {item.probability}% probability
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ML Model Info */}
        <div className="card" style={{
          backgroundColor: 'var(--color-primary-bg)',
          border: '1px solid var(--color-primary)',
          padding: '1.5rem'
        }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--color-gray-900)' }}>🤖 Machine Learning Model Information</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1rem',
            fontSize: '0.875rem',
            color: '#374151'
          }}>
            <div>
              <strong>Algorithm:</strong> Random Forest Regression
            </div>
            <div>
              <strong>Training Data:</strong> 6 months historical data
            </div>
            <div>
              <strong>Features:</strong> Time, Day, Historical patterns, Weather
            </div>
            <div>
              <strong>Update Frequency:</strong> Real-time (every 5 minutes)
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Predictions;

