import React, { useState, useEffect } from 'react';
import { createPortfolio, updatePortfolio, addHolding, updateHolding } from '../api/portfolio';
import './PortfolioForm.css';

const PortfolioForm = ({ portfolio = null, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: portfolio?.name || '',
    description: portfolio?.description || '',
    risk_level: portfolio?.risk_level || 'Moderate',
  });

  const [holdings, setHoldings] = useState(portfolio?.holdings || []);
  const [newHolding, setNewHolding] = useState({
    ticker: '',
    company_name: '',
    sector: '',
    shares: '',
    average_price: '',
    current_price: '',
    allocation_percentage: '',
  });

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

  const handleHoldingInputChange = (e) => {
    const { name, value } = e.target;
    setNewHolding(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addHoldingToForm = () => {
    if (!newHolding.ticker || !newHolding.shares || !newHolding.average_price) {
      setError('Please fill in ticker, shares, and average price');
      return;
    }

    const holding = {
      ...newHolding,
      id: Date.now(), // Temporary ID for frontend
      shares: parseFloat(newHolding.shares),
      average_price: parseFloat(newHolding.average_price),
      current_price: parseFloat(newHolding.current_price) || parseFloat(newHolding.average_price),
      allocation_percentage: parseFloat(newHolding.allocation_percentage) || 0,
    };

    setHoldings(prev => [...prev, holding]);
    setNewHolding({
      ticker: '',
      company_name: '',
      sector: '',
      shares: '',
      average_price: '',
      current_price: '',
      allocation_percentage: '',
    });
    setError('');
  };

  const removeHolding = (index) => {
    setHoldings(prev => prev.filter((_, i) => i !== index));
  };

  const updateHoldingInForm = (index, field, value) => {
    setHoldings(prev => prev.map((holding, i) => 
      i === index ? { ...holding, [field]: value } : holding
    ));
  };

  const calculateTotalAllocation = () => {
    return holdings.reduce((total, holding) => total + (holding.allocation_percentage || 0), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let savedPortfolio;

      if (portfolio) {
        // Update existing portfolio
        const response = await updatePortfolio(portfolio.id, formData);
        savedPortfolio = response.data;
      } else {
        // Create new portfolio
        const response = await createPortfolio(formData);
        savedPortfolio = response.data;
      }

      // Add/update holdings
      for (const holding of holdings) {
        const holdingData = {
          ticker: holding.ticker,
          company_name: holding.company_name,
          sector: holding.sector,
          shares: holding.shares,
          average_price: holding.average_price,
          current_price: holding.current_price,
          allocation_percentage: holding.allocation_percentage,
        };

        if (holding.id && typeof holding.id === 'number' && holding.id > 1000) {
          // This is a new holding (temporary ID)
          await addHolding(savedPortfolio.id, holdingData);
        } else if (holding.id) {
          // This is an existing holding
          await updateHolding(savedPortfolio.id, holding.id, holdingData);
        }
      }

      onSave(savedPortfolio);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while saving the portfolio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="portfolio-form-container">
      <form onSubmit={handleSubmit} className="portfolio-form">
        <h2>{portfolio ? 'Edit Portfolio' : 'Create New Portfolio'}</h2>
        
        {error && <div className="error-message">{error}</div>}

        <div className="form-section">
          <h3>Portfolio Details</h3>
          
          <div className="form-group">
            <label htmlFor="name">Portfolio Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="Enter portfolio name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter portfolio description"
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
          <h3>Portfolio Holdings</h3>
          
          <div className="holdings-input">
            <div className="custom-holdings-form-row">
              <div className="holdings-form-row-top">
                <input
                  type="text"
                  name="ticker"
                  value={newHolding.ticker}
                  onChange={handleHoldingInputChange}
                  placeholder="Ticker (e.g., AAPL)"
                  className="ticker-input"
                />
                <input
                  type="text"
                  name="company_name"
                  value={newHolding.company_name}
                  onChange={handleHoldingInputChange}
                  placeholder="Company Name"
                  className="company-input"
                />
                <input
                  type="text"
                  name="sector"
                  value={newHolding.sector}
                  onChange={handleHoldingInputChange}
                  placeholder="Sector"
                  className="sector-input"
                />
                <input
                  type="number"
                  name="shares"
                  value={newHolding.shares}
                  onChange={handleHoldingInputChange}
                  placeholder="Shares"
                  step="0.0001"
                  className="shares-input"
                />
              </div>
              <div className="holdings-form-row-bottom">
                <input
                  type="number"
                  name="average_price"
                  value={newHolding.average_price}
                  onChange={handleHoldingInputChange}
                  placeholder="Avg Price"
                  step="0.01"
                  className="price-input"
                />
                <input
                  type="number"
                  name="current_price"
                  value={newHolding.current_price}
                  onChange={handleHoldingInputChange}
                  placeholder="Current Price"
                  step="0.01"
                  className="price-input"
                />
                <input
                  type="number"
                  name="allocation_percentage"
                  value={newHolding.allocation_percentage}
                  onChange={handleHoldingInputChange}
                  placeholder="Allocation %"
                  step="0.01"
                  className="allocation-input"
                />
                <button
                  type="button"
                  onClick={addHoldingToForm}
                  className="add-holding-btn"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {holdings.length > 0 && (
            <div className="holdings-list">
              <div className="holdings-header">
                <span>Ticker</span>
                <span>Company</span>
                <span>Sector</span>
                <span>Shares</span>
                <span>Avg Price</span>
                <span>Current Price</span>
                <span>Allocation %</span>
                <span>Actions</span>
              </div>
              
              {holdings.map((holding, index) => (
                <div key={index} className="holding-item">
                  <input
                    type="text"
                    value={holding.ticker}
                    onChange={(e) => updateHoldingInForm(index, 'ticker', e.target.value)}
                    className="holding-input"
                  />
                  <input
                    type="text"
                    value={holding.company_name || ''}
                    onChange={(e) => updateHoldingInForm(index, 'company_name', e.target.value)}
                    className="holding-input"
                  />
                  <input
                    type="text"
                    value={holding.sector || ''}
                    onChange={(e) => updateHoldingInForm(index, 'sector', e.target.value)}
                    className="holding-input"
                  />
                  <input
                    type="number"
                    value={holding.shares}
                    onChange={(e) => updateHoldingInForm(index, 'shares', parseFloat(e.target.value))}
                    step="0.0001"
                    className="holding-input"
                  />
                  <input
                    type="number"
                    value={holding.average_price}
                    onChange={(e) => updateHoldingInForm(index, 'average_price', parseFloat(e.target.value))}
                    step="0.01"
                    className="holding-input"
                  />
                  <input
                    type="number"
                    value={holding.current_price}
                    onChange={(e) => updateHoldingInForm(index, 'current_price', parseFloat(e.target.value))}
                    step="0.01"
                    className="holding-input"
                  />
                  <input
                    type="number"
                    value={holding.allocation_percentage || 0}
                    onChange={(e) => updateHoldingInForm(index, 'allocation_percentage', parseFloat(e.target.value))}
                    step="0.01"
                    className="holding-input"
                  />
                  <button
                    type="button"
                    onClick={() => removeHolding(index)}
                    className="remove-holding-btn"
                  >
                    Remove
                  </button>
                </div>
              ))}
              
              <div className="allocation-summary">
                <strong>Total Allocation: {calculateTotalAllocation().toFixed(2)}%</strong>
              </div>
            </div>
          )}
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading} className="save-btn">
            {loading ? 'Saving...' : (portfolio ? 'Update Portfolio' : 'Create Portfolio')}
          </button>
          <button type="button" onClick={onCancel} className="cancel-btn">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default PortfolioForm;
