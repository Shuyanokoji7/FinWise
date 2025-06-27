import React, { useState } from 'react';
import './PortfolioResult.css';

const PortfolioResult = ({ portfolio, onEdit, onDelete, onSave }) => {
  const [expanded, setExpanded] = useState(false);
  const [showReasoning, setShowReasoning] = useState(false);
  const displayHoldings = portfolio.holdings || [];

  const calculateTotalValue = () => {
    return (displayHoldings || []).reduce((total, holding) => {
      return total + Number(holding.market_value || 0);
    }, 0);
  };

  const calculateTotalGainLoss = () => {
    return (displayHoldings || []).reduce((total, holding) => {
      return total + Number(holding.unrealized_gain_loss || 0);
    }, 0);
  };

  const calculateTotalGainLossPercentage = () => {
    const totalValue = calculateTotalValue();
    const totalGainLoss = calculateTotalGainLoss();
    if (totalValue === 0) return 0;
    return (totalGainLoss / (totalValue - totalGainLoss)) * 100;
  };

  const getSectorBreakdown = () => {
    const sectors = {};
    displayHoldings?.forEach(holding => {
      const sector = holding.sector || 'Unknown';
      sectors[sector] = (sectors[sector] || 0) + (holding.allocation_percentage || 0);
    });
    return sectors;
  };

  const getTopHoldings = () => {
    return displayHoldings
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
    const num = Number(value);
    if (isNaN(num)) return '0.00%';
    return `${num.toFixed(2)}%`;
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

  // Show Save button only if portfolio is not already saved (e.g., no id)
  const showSaveButton = onSave && !portfolio.id;

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
          {showSaveButton && (
            <button onClick={() => onSave(portfolio)} className="save-btn">
              Save Portfolio
            </button>
          )}
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
                <span>Allocation %</span>
                <span>Gain/Loss</span>
                <span>Market Cap</span>
                <span>P/E Ratio</span>
                <span>Beta</span>
                <span>Dividend Yield</span>
                <span>1Y Return</span>
                <span>Volatility</span>
              </div>
              {(displayHoldings || []).map((holding, index) => (
                <div key={holding.id || index} className="table-row">
                  <span className="ticker">{holding.ticker || '-'}</span>
                  <span className="company">{holding.company_name || '-'}</span>
                  <span className="sector">{holding.sector || '-'}</span>
                  <span className="shares">{holding.shares !== undefined ? Number(holding.shares).toFixed(4) : '-'}</span>
                  <span className="avg-price">{holding.average_price !== undefined ? `$${Number(holding.average_price).toFixed(2)}` : '-'}</span>
                  <span className="current-price">{holding.current_price !== undefined ? `$${Number(holding.current_price).toFixed(2)}` : '-'}</span>
                  <span className="market-value">{holding.market_value !== undefined ? `$${Number(holding.market_value).toFixed(2)}` : '-'}</span>
                  <span className="allocation">{holding.allocation_percentage !== undefined ? `${Number(holding.allocation_percentage).toFixed(2)}%` : '-'}</span>
                  <span className="gain-loss">{holding.unrealized_gain_loss !== undefined ? `$${Number(holding.unrealized_gain_loss).toFixed(2)}` : '-'}</span>
                  <span className="market-cap">{holding.market_cap !== undefined ? `$${Number(holding.market_cap).toLocaleString()}` : '-'}</span>
                  <span className="pe">{'pe' in holding ? holding.pe : '-'}</span>
                  <span className="beta">{holding.beta !== undefined ? Number(holding.beta).toFixed(3) : '-'}</span>
                  <span className="dividend-yield">{holding.dividend_yield !== undefined ? `${Number(holding.dividend_yield).toFixed(2)}%` : '-'}</span>
                  <span className="one-year-return">{holding.one_year_return !== undefined ? `${Number(holding.one_year_return).toFixed(2)}%` : '-'}</span>
                  <span className="volatility">{holding.volatility !== undefined ? `${Number(holding.volatility).toFixed(2)}%` : '-'}</span>
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
