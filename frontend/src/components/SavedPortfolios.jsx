import React, { useState, useEffect } from 'react';
import { getPortfolios, deletePortfolio } from '../api/portfolio';
import './SavedPortfolios.css';

const SavedPortfolios = ({ onSelectPortfolio, onEditPortfolio, onRefresh }) => {
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPortfolios();
  }, []);

  const fetchPortfolios = async () => {
    try {
      setLoading(true);
      const response = await getPortfolios();
      // Filter out inactive portfolios
      const activePortfolios = response.data.filter(portfolio => portfolio.is_active !== false);
      setPortfolios(activePortfolios);
      setError('');
    } catch (err) {
      setError('Failed to load portfolios');
      console.error('Error fetching portfolios:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePortfolio = async (portfolioId) => {
    if (window.confirm('Are you sure you want to delete this portfolio? This action cannot be undone.')) {
      try {
        await deletePortfolio(portfolioId);
        setPortfolios(prev => prev.filter(p => p.id !== portfolioId));
        if (onRefresh) onRefresh();
      } catch (err) {
        setError('Failed to delete portfolio');
        console.error('Error deleting portfolio:', err);
      }
    }
  };

  const calculateTotalValue = (portfolio) => {
    return portfolio.holdings?.reduce((total, holding) => {
      return total + (holding.market_value || 0);
    }, 0) || 0;
  };

  const calculateTotalGainLoss = (portfolio) => {
    return portfolio.holdings?.reduce((total, holding) => {
      return total + (holding.unrealized_gain_loss || 0);
    }, 0) || 0;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'Conservative': return '#27ae60';
      case 'Moderate': return '#f39c12';
      case 'Aggressive': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  if (loading) {
    return (
      <div className="saved-portfolios-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading portfolios...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="saved-portfolios-container">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchPortfolios} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (portfolios.length === 0) {
    return (
      <div className="saved-portfolios-container">
        <div className="no-portfolios">
          <h3>No Portfolios Found</h3>
          <p>You haven't created any portfolios yet. Start by creating your first portfolio!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="saved-portfolios-container">
      <div className="portfolios-header">
        <h2>Your Portfolios</h2>
        <p>{portfolios.length} portfolio{portfolios.length !== 1 ? 's' : ''} found</p>
      </div>

      <div className="portfolios-grid">
        {portfolios.map((portfolio) => {
          const totalValue = calculateTotalValue(portfolio);
          const totalGainLoss = calculateTotalGainLoss(portfolio);
          const totalGainLossPercentage = totalValue > 0 ? (totalGainLoss / (totalValue - totalGainLoss)) * 100 : 0;

          return (
            <div key={portfolio.id} className="portfolio-card">
              <div className="portfolio-card-header">
                <div className="portfolio-info">
                  <h3>{portfolio.name}</h3>
                  <span 
                    className="risk-badge"
                    style={{ backgroundColor: getRiskColor(portfolio.risk_level) }}
                  >
                    {portfolio.risk_level}
                  </span>
                </div>
                <div className="portfolio-actions">
                  <button 
                    onClick={() => onSelectPortfolio(portfolio)}
                    className="view-btn"
                  >
                    View
                  </button>
                  <button 
                    onClick={() => onEditPortfolio(portfolio)}
                    className="edit-btn"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeletePortfolio(portfolio.id)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {portfolio.description && (
                <div className="portfolio-description">
                  <p>{portfolio.description}</p>
                </div>
              )}

              <div className="portfolio-metrics">
                <div className="metric">
                  <span className="metric-label">Total Value</span>
                  <span className="metric-value">{formatCurrency(totalValue)}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Gain/Loss</span>
                  <span className={`metric-value ${totalGainLoss >= 0 ? 'positive' : 'negative'}`}>
                    {formatCurrency(totalGainLoss)}
                  </span>
                  <span className={`metric-percentage ${totalGainLoss >= 0 ? 'positive' : 'negative'}`}>
                    {totalGainLossPercentage.toFixed(2)}%
                  </span>
                </div>
                <div className="metric">
                  <span className="metric-label">Holdings</span>
                  <span className="metric-value">{portfolio.holdings?.length || 0}</span>
                </div>
              </div>

              <div className="portfolio-footer">
                <span className="created-date">
                  Created: {formatDate(portfolio.created_at)}
                </span>
                <span className="updated-date">
                  Updated: {formatDate(portfolio.updated_at)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SavedPortfolios;
