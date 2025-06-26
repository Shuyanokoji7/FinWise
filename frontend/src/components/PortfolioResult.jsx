import React, { useState, useEffect } from 'react';
import './PortfolioResult.css';

const PortfolioResult = ({ portfolio, onEdit, onDelete }) => {
  const [expanded, setExpanded] = useState(false);

  if (!portfolio) {
    return (
      <div className="portfolio-result-container">
        <div className="no-portfolio">
          <h3>No Portfolio Selected</h3>
          <p>Please create or select a portfolio to view its details.</p>
        </div>
      </div>
    );
  }

  const calculateTotalValue = () => {
    return portfolio.holdings?.reduce((total, holding) => {
      return total + (holding.market_value || 0);
    }, 0) || 0;
  };

  const calculateTotalGainLoss = () => {
    return portfolio.holdings?.reduce((total, holding) => {
      return total + (holding.unrealized_gain_loss || 0);
    }, 0) || 0;
  };

  const calculateTotalGainLossPercentage = () => {
    const totalValue = calculateTotalValue();
    const totalGainLoss = calculateTotalGainLoss();
    if (totalValue === 0) return 0;
    return (totalGainLoss / (totalValue - totalGainLoss)) * 100;
  };

  const getSectorBreakdown = () => {
    const sectors = {};
    portfolio.holdings?.forEach(holding => {
      const sector = holding.sector || 'Unknown';
      sectors[sector] = (sectors[sector] || 0) + (holding.allocation_percentage || 0);
    });
    return sectors;
  };

  const getTopHoldings = () => {
    return portfolio.holdings
      ?.sort((a, b) => (b.allocation_percentage || 0) - (a.allocation_percentage || 0))
      .slice(0, 5) || [];
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${value.toFixed(2)}%`;
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'Conservative': return '#27ae60';
      case 'Moderate': return '#f39c12';
      case 'Aggressive': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  const totalValue = calculateTotalValue();
  const totalGainLoss = calculateTotalGainLoss();
  const totalGainLossPercentage = calculateTotalGainLossPercentage();
  const sectorBreakdown = getSectorBreakdown();
  const topHoldings = getTopHoldings();

  return (
    <div className="portfolio-result-container">
      <div className="portfolio-header">
        <div className="portfolio-title">
          <h2>{portfolio.name}</h2>
          <span 
            className="risk-badge"
            style={{ backgroundColor: getRiskColor(portfolio.risk_level) }}
          >
            {portfolio.risk_level}
          </span>
        </div>
        <div className="portfolio-actions">
          <button onClick={() => onEdit(portfolio)} className="edit-btn">
            Edit Portfolio
          </button>
          <button onClick={() => onDelete(portfolio.id)} className="delete-btn">
            Delete
          </button>
        </div>
      </div>

      {portfolio.description && (
        <div className="portfolio-description">
          <p>{portfolio.description}</p>
        </div>
      )}

      <div className="portfolio-summary">
        <div className="summary-card">
          <h3>Total Value</h3>
          <div className="summary-value">{formatCurrency(totalValue)}</div>
        </div>
        <div className="summary-card">
          <h3>Total Gain/Loss</h3>
          <div className={`summary-value ${totalGainLoss >= 0 ? 'positive' : 'negative'}`}>
            {formatCurrency(totalGainLoss)}
          </div>
          <div className={`summary-percentage ${totalGainLoss >= 0 ? 'positive' : 'negative'}`}>
            {formatPercentage(totalGainLossPercentage)}
          </div>
        </div>
        <div className="summary-card">
          <h3>Holdings</h3>
          <div className="summary-value">{portfolio.holdings?.length || 0}</div>
        </div>
        <div className="summary-card">
          <h3>Created</h3>
          <div className="summary-value">
            {new Date(portfolio.created_at).toLocaleDateString()}
          </div>
        </div>
      </div>

      <div className="portfolio-details">
        <div className="details-section">
          <h3>Top Holdings</h3>
          <div className="holdings-list">
            {topHoldings.map((holding, index) => (
              <div key={holding.id || index} className="holding-item">
                <div className="holding-info">
                  <div className="holding-ticker">{holding.ticker}</div>
                  <div className="holding-company">{holding.company_name}</div>
                </div>
                <div className="holding-metrics">
                  <div className="holding-allocation">
                    {formatPercentage(holding.allocation_percentage || 0)}
                  </div>
                  <div className="holding-value">
                    {formatCurrency(holding.market_value || 0)}
                  </div>
                  <div className={`holding-gain-loss ${(holding.unrealized_gain_loss || 0) >= 0 ? 'positive' : 'negative'}`}>
                    {formatCurrency(holding.unrealized_gain_loss || 0)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="details-section">
          <h3>Sector Breakdown</h3>
          <div className="sector-breakdown">
            {Object.entries(sectorBreakdown).map(([sector, allocation]) => (
              <div key={sector} className="sector-item">
                <div className="sector-info">
                  <span className="sector-name">{sector}</span>
                  <span className="sector-allocation">{formatPercentage(allocation)}</span>
                </div>
                <div className="sector-bar">
                  <div 
                    className="sector-bar-fill"
                    style={{ width: `${allocation}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button 
          className="expand-btn"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Show Less' : 'Show All Holdings'}
        </button>

        {expanded && (
          <div className="details-section">
            <h3>All Holdings</h3>
            <div className="all-holdings-table">
              <div className="table-header">
                <span>Ticker</span>
                <span>Company</span>
                <span>Sector</span>
                <span>Shares</span>
                <span>Avg Price</span>
                <span>Current Price</span>
                <span>Market Value</span>
                <span>Allocation</span>
                <span>Gain/Loss</span>
              </div>
              {portfolio.holdings?.map((holding, index) => (
                <div key={holding.id || index} className="table-row">
                  <span className="ticker">{holding.ticker}</span>
                  <span className="company">{holding.company_name}</span>
                  <span className="sector">{holding.sector}</span>
                  <span className="shares">{holding.shares?.toFixed(4)}</span>
                  <span className="avg-price">{formatCurrency(holding.average_price || 0)}</span>
                  <span className="current-price">{formatCurrency(holding.current_price || 0)}</span>
                  <span className="market-value">{formatCurrency(holding.market_value || 0)}</span>
                  <span className="allocation">{formatPercentage(holding.allocation_percentage || 0)}</span>
                  <span className={`gain-loss ${(holding.unrealized_gain_loss || 0) >= 0 ? 'positive' : 'negative'}`}>
                    {formatCurrency(holding.unrealized_gain_loss || 0)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioResult;
