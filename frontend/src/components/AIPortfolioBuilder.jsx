import React, { useState } from 'react';
import './AIPortfolioBuilder.css';

const AIPortfolioBuilder = ({ onSavePortfolio, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    risk_level: 'Moderate',
    total_amount: '',
    tickers: ''
  });

  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const riskLevels = ['Conservative', 'Moderate', 'Aggressive'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateAISuggestions = async () => {
    if (!formData.tickers.trim() || !formData.total_amount) {
      setError('Please provide both tickers and total amount');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Simulate AI API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const tickerList = formData.tickers.split(',').map(t => t.trim().toUpperCase()).filter(t => t);
      const totalAmount = parseFloat(formData.total_amount);
      
      // Generate AI suggestions based on risk level and tickers
      const suggestions = generateSuggestions(tickerList, totalAmount, formData.risk_level);
      setSuggestions(suggestions);
    } catch (err) {
      setError('Failed to generate AI suggestions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateSuggestions = (tickers, totalAmount, riskLevel) => {
    // AI-like allocation logic based on risk level and ticker characteristics
    const allocations = {};
    const numTickers = tickers.length;
    
    // Base allocation percentages based on risk level
    let baseAllocation = 0;
    let maxAllocation = 0;
    
    switch (riskLevel) {
      case 'Conservative':
        baseAllocation = 100 / numTickers;
        maxAllocation = Math.min(40, 100 / numTickers);
        break;
      case 'Moderate':
        baseAllocation = 100 / numTickers;
        maxAllocation = Math.min(35, 100 / numTickers);
        break;
      case 'Aggressive':
        baseAllocation = 100 / numTickers;
        maxAllocation = Math.min(30, 100 / numTickers);
        break;
      default:
        baseAllocation = 100 / numTickers;
        maxAllocation = 100 / numTickers;
    }

    // Generate allocations with some variation
    tickers.forEach((ticker, index) => {
      let allocation = baseAllocation;
      
      // Add some AI-like variation based on ticker characteristics
      if (ticker.includes('AAPL') || ticker.includes('MSFT') || ticker.includes('GOOGL')) {
        allocation += 5; // Tech giants get slightly higher allocation
      } else if (ticker.includes('JNJ') || ticker.includes('PG') || ticker.includes('KO')) {
        allocation += 3; // Stable companies get moderate boost
      } else if (ticker.includes('TSLA') || ticker.includes('NVDA')) {
        allocation -= 2; // Volatile stocks get slightly lower allocation
      }
      
      // Ensure allocation stays within bounds
      allocation = Math.max(5, Math.min(maxAllocation, allocation));
      
      allocations[ticker] = {
        allocation_percentage: parseFloat(allocation.toFixed(2)),
        reasoning: generateReasoning(ticker, allocation, riskLevel)
      };
    });

    // Normalize allocations to 100%
    const totalAllocation = Object.values(allocations).reduce((sum, item) => sum + item.allocation_percentage, 0);
    const normalizationFactor = 100 / totalAllocation;
    
    Object.keys(allocations).forEach(ticker => {
      allocations[ticker].allocation_percentage = parseFloat((allocations[ticker].allocation_percentage * normalizationFactor).toFixed(2));
    });

    return {
      tickers: Object.keys(allocations),
      allocations,
      total_amount: totalAmount,
      risk_level: riskLevel,
      summary: generateSummary(allocations, riskLevel)
    };
  };

  const generateReasoning = (ticker, allocation, riskLevel) => {
    const reasons = {
      'AAPL': 'Strong fundamentals, consistent growth, and robust ecosystem',
      'MSFT': 'Cloud leadership, stable revenue streams, and AI integration',
      'GOOGL': 'Dominant search position, advertising revenue, and AI innovation',
      'TSLA': 'EV market leader but higher volatility - adjusted for risk',
      'NVDA': 'AI chip leader with strong growth potential but higher volatility',
      'JNJ': 'Healthcare giant with stable dividends and defensive characteristics',
      'PG': 'Consumer staples leader with consistent cash flows',
      'KO': 'Global brand with stable earnings and dividend growth',
      'AMZN': 'E-commerce and cloud leader with strong market position',
      'BRK.B': 'Diversified conglomerate with value investing approach'
    };

    const baseReason = reasons[ticker] || 'Well-established company with good fundamentals';
    
    if (riskLevel === 'Conservative') {
      return `${baseReason}. Conservative allocation due to focus on capital preservation.`;
    } else if (riskLevel === 'Moderate') {
      return `${baseReason}. Balanced allocation for growth and stability.`;
    } else {
      return `${baseReason}. Aggressive allocation for maximum growth potential.`;
    }
  };

  const generateSummary = (allocations, riskLevel) => {
    const topHoldings = Object.entries(allocations)
      .sort(([,a], [,b]) => b.allocation_percentage - a.allocation_percentage)
      .slice(0, 3);

    return {
      strategy: `${riskLevel} risk strategy with diversified allocation`,
      top_holdings: topHoldings.map(([ticker, data]) => `${ticker} (${data.allocation_percentage}%)`).join(', '),
      diversification: `Portfolio spread across ${Object.keys(allocations).length} stocks`,
      risk_notes: riskLevel === 'Conservative' ? 'Focus on capital preservation and stable returns' :
                 riskLevel === 'Moderate' ? 'Balanced approach for growth and stability' :
                 'Growth-focused strategy with higher potential returns and volatility'
    };
  };

  const handleAcceptSuggestions = () => {
    if (!suggestions) return;

    const portfolioData = {
      name: formData.name || 'AI-Generated Portfolio',
      description: formData.description || suggestions.summary.strategy,
      risk_level: formData.risk_level,
      holdings: suggestions.tickers.map(ticker => ({
        ticker,
        company_name: getCompanyName(ticker),
        sector: getSector(ticker),
        allocation_percentage: suggestions.allocations[ticker].allocation_percentage,
        shares: 0, // Will be calculated based on current price
        average_price: 0,
        current_price: getMockPrice(ticker)
      }))
    };

    onSavePortfolio(portfolioData);
  };

  const getCompanyName = (ticker) => {
    const companies = {
      'AAPL': 'Apple Inc.',
      'MSFT': 'Microsoft Corporation',
      'GOOGL': 'Alphabet Inc.',
      'TSLA': 'Tesla, Inc.',
      'NVDA': 'NVIDIA Corporation',
      'JNJ': 'Johnson & Johnson',
      'PG': 'Procter & Gamble Co.',
      'KO': 'The Coca-Cola Company',
      'AMZN': 'Amazon.com, Inc.',
      'BRK.B': 'Berkshire Hathaway Inc.'
    };
    return companies[ticker] || `${ticker} Corporation`;
  };

  const getSector = (ticker) => {
    const sectors = {
      'AAPL': 'Technology',
      'MSFT': 'Technology',
      'GOOGL': 'Technology',
      'TSLA': 'Automotive',
      'NVDA': 'Technology',
      'JNJ': 'Healthcare',
      'PG': 'Consumer Defensive',
      'KO': 'Consumer Defensive',
      'AMZN': 'Consumer Cyclical',
      'BRK.B': 'Financial Services'
    };
    return sectors[ticker] || 'General';
  };

  const getMockPrice = (ticker) => {
    const prices = {
      'AAPL': 175.50,
      'MSFT': 320.75,
      'GOOGL': 145.25,
      'TSLA': 180.00,
      'NVDA': 550.00,
      'JNJ': 165.25,
      'PG': 142.50,
      'KO': 58.75,
      'AMZN': 145.75,
      'BRK.B': 335.25
    };
    return prices[ticker] || 100.00;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="ai-portfolio-builder-container">
      <div className="ai-portfolio-form">
        <h2>AI Portfolio Builder</h2>
        <p className="subtitle">Get AI-powered allocation suggestions for your investment portfolio</p>
        
        {error && <div className="error-message">{error}</div>}

        <div className="form-section">
          <h3>Portfolio Details</h3>
          
          <div className="form-group">
            <label htmlFor="name">Portfolio Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter portfolio name (optional)"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter portfolio description (optional)"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="risk_level">Risk Level</label>
            <select
              id="risk_level"
              name="risk_level"
              value={formData.risk_level}
              onChange={handleInputChange}
            >
              {riskLevels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-section">
          <h3>Investment Parameters</h3>
          
          <div className="form-group">
            <label htmlFor="total_amount">Total Investment Amount ($)</label>
            <input
              type="number"
              id="total_amount"
              name="total_amount"
              value={formData.total_amount}
              onChange={handleInputChange}
              placeholder="e.g., 10000"
              min="1000"
              step="100"
            />
          </div>

          <div className="form-group">
            <label htmlFor="tickers">Stock Tickers</label>
            <textarea
              id="tickers"
              name="tickers"
              value={formData.tickers}
              onChange={handleInputChange}
              placeholder="Enter stock tickers separated by commas (e.g., AAPL, MSFT, GOOGL, TSLA, NVDA)"
              rows="4"
            />
            <small className="help-text">
              Enter 3-10 stock tickers. The AI will analyze and suggest optimal allocations.
            </small>
          </div>
        </div>

        <div className="form-actions">
          <button 
            onClick={generateAISuggestions}
            disabled={loading || !formData.tickers.trim() || !formData.total_amount}
            className="generate-btn"
          >
            {loading ? 'Generating Suggestions...' : 'Generate AI Suggestions'}
          </button>
          <button onClick={onCancel} className="cancel-btn">
            Cancel
          </button>
        </div>

        {suggestions && (
          <div className="suggestions-section">
            <h3>AI Portfolio Suggestions</h3>
            
            <div className="suggestion-summary">
              <div className="summary-card">
                <h4>Strategy</h4>
                <p>{suggestions.summary.strategy}</p>
              </div>
              <div className="summary-card">
                <h4>Top Holdings</h4>
                <p>{suggestions.summary.top_holdings}</p>
              </div>
              <div className="summary-card">
                <h4>Diversification</h4>
                <p>{suggestions.summary.diversification}</p>
              </div>
              <div className="summary-card">
                <h4>Risk Notes</h4>
                <p>{suggestions.summary.risk_notes}</p>
              </div>
            </div>

            <div className="allocations-table">
              <h4>Suggested Allocations</h4>
              <div className="table-header">
                <span>Ticker</span>
                <span>Company</span>
                <span>Allocation %</span>
                <span>Amount</span>
                <span>Reasoning</span>
              </div>
              
              {suggestions.tickers.map(ticker => {
                const allocation = suggestions.allocations[ticker];
                const amount = (suggestions.total_amount * allocation.allocation_percentage) / 100;
                
                return (
                  <div key={ticker} className="table-row">
                    <span className="ticker">{ticker}</span>
                    <span className="company">{getCompanyName(ticker)}</span>
                    <span className="allocation">{allocation.allocation_percentage}%</span>
                    <span className="amount">{formatCurrency(amount)}</span>
                    <span className="reasoning">{allocation.reasoning}</span>
                  </div>
                );
              })}
            </div>

            <div className="suggestion-actions">
              <button onClick={handleAcceptSuggestions} className="accept-btn">
                Accept Suggestions & Create Portfolio
              </button>
              <button onClick={() => setSuggestions(null)} className="regenerate-btn">
                Regenerate Suggestions
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIPortfolioBuilder; 