import React, { useState, useEffect } from 'react';
import { getPortfolios, getPortfolio } from '../api/portfolio';
import './History.css';

const History = () => {
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
      const activePortfolios = response.data.filter(p => p.is_active !== false);
      setPortfolios(activePortfolios);
      setError('');
    } catch (err) {
      setError('Failed to load portfolios');
    } finally {
      setLoading(false);
    }
  };

  const handleViewPortfolio = async (portfolio) => {
    try {
      const response = await getPortfolio(portfolio.id);
      const fullPortfolio = response.data;
      // For now, just alert the full portfolio details (replace with modal as needed)
      alert(`Portfolio: ${fullPortfolio.name}\nDescription: ${fullPortfolio.description}\nHoldings: ${fullPortfolio.holdings.map(h => h.ticker).join(', ')}`);
    } catch (err) {
      alert('Failed to load portfolio details.');
    }
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

  return (
    <div className="history-container">
      <div className="history-header">
        <h1>My Portfolios</h1>
        <p>View your saved portfolios and transaction history.</p>
      </div>
      {loading ? (
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading portfolios...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchPortfolios} className="retry-btn">Try Again</button>
        </div>
      ) : portfolios.length === 0 ? (
        <div className="no-portfolios">
          <h3>No Portfolios Found</h3>
          <p>You haven't created any portfolios yet.</p>
        </div>
      ) : (
        <div className="history-portfolios-grid">
          {portfolios.map((portfolio) => {
            const totalValue = (portfolio.holdings || []).reduce((total, holding) => total + Number(holding.market_value || 0), 0);
            const totalGainLoss = (portfolio.holdings || []).reduce((total, holding) => total + Number(holding.unrealized_gain_loss || 0), 0);
            const totalGainLossPercentage = totalValue > 0 ? (totalGainLoss / (totalValue - totalGainLoss)) * 100 : 0;
            return (
              <div key={portfolio.id} className="history-portfolio-card">
                <div className="history-portfolio-card-header">
                  <div className="portfolio-info">
                    <h3>{portfolio.name}</h3>
                    <span className="risk-badge" style={{ backgroundColor: getRiskColor(portfolio.risk_level) }}>{portfolio.risk_level}</span>
                  </div>
                  <div className="portfolio-actions">
                    <button onClick={() => handleViewPortfolio(portfolio)} className="view-btn">View</button>
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
                    <span className={`metric-value ${totalGainLoss >= 0 ? 'positive' : 'negative'}`}>{formatCurrency(totalGainLoss)}</span>
                    <span className={`metric-percentage ${totalGainLoss >= 0 ? 'positive' : 'negative'}`}>{totalGainLossPercentage.toFixed(2)}%</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Holdings</span>
                    <span className="metric-value">{portfolio.holdings?.length || 0}</span>
                  </div>
                </div>
                <div className="portfolio-footer">
                  <span className="created-date">Created: {formatDate(portfolio.created_at)}</span>
                  <span className="updated-date">Updated: {formatDate(portfolio.updated_at)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default History;
