import React, { useState, useEffect } from 'react';
import PortfolioForm from '../components/PortfolioForm';
import PortfolioResult from '../components/PortfolioResult';
import SavedPortfolios from '../components/SavedPortfolios';
import AIPortfolioBuilder from '../components/AIPortfolioBuilder';
import { getPortfolio, createPortfolio, addHolding } from '../api/portfolio';
import './PortfolioBuilder.css';

const PortfolioBuilder = () => {
  const [view, setView] = useState('portfolios'); // 'portfolios', 'form', 'ai-form', 'result'
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);
  const [editingPortfolio, setEditingPortfolio] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCreateNew = () => {
    setEditingPortfolio(null);
    setView('form');
  };

  const handleCreateAI = () => {
    setEditingPortfolio(null);
    setView('ai-form');
  };

  const handleSelectPortfolio = async (portfolio) => {
    try {
      // Fetch full portfolio details including holdings
      const response = await getPortfolio(portfolio.id);
      setSelectedPortfolio(response.data);
      setView('result');
    } catch (error) {
      console.error('Error fetching portfolio details:', error);
      // Fallback to basic portfolio data
      setSelectedPortfolio(portfolio);
      setView('result');
    }
  };

  const handleEditPortfolio = async (portfolio) => {
    try {
      // Fetch full portfolio details including holdings
      const response = await getPortfolio(portfolio.id);
      setEditingPortfolio(response.data);
      setView('form');
    } catch (error) {
      console.error('Error fetching portfolio details:', error);
      // Fallback to basic portfolio data
      setEditingPortfolio(portfolio);
      setView('form');
    }
  };

  const handleSavePortfolio = async (portfolio) => {
    // If portfolio has no id, it's a draft and needs to be saved to backend
    if (!portfolio.id) {
      try {
        // Ensure total_amount is present and a number
        let totalAmount = Number(portfolio.total_amount);
        if (!totalAmount || isNaN(totalAmount)) {
          totalAmount = 10000; // fallback default
          alert('Total amount was missing or invalid. Using default value of $10,000.');
        }
        const payload = {
          name: portfolio.name,
          description: portfolio.description,
          risk_level: portfolio.risk_level,
          total_amount: totalAmount,
          holdings: (portfolio.holdings || []).map(holding => ({
            ticker: holding.ticker,
            company_name: holding.company_name,
            sector: holding.sector,
            allocation_percentage: Number(holding.allocation_percentage)
          }))
        };
        console.log('Payload to createPortfolio:', payload);
        // 1. Create the portfolio
        const response = await createPortfolio(payload);
        const savedPortfolio = response.data;
        // 2. No need to add holdings separately, backend handles it
        setSelectedPortfolio(savedPortfolio);
        setEditingPortfolio(null);
        setView('result');
        setRefreshTrigger(prev => prev + 1);
      } catch (error) {
        alert('Failed to save portfolio. Please try again.');
      }
    } else {
      // Already saved, just update state
      setSelectedPortfolio(portfolio);
      setEditingPortfolio(null);
      setView('result');
      setRefreshTrigger(prev => prev + 1);
    }
  };

  const handleCancelForm = () => {
    setEditingPortfolio(null);
    setView('portfolios');
  };

  const handleDeletePortfolio = () => {
    setSelectedPortfolio(null);
    setView('portfolios');
    setRefreshTrigger(prev => prev + 1);
  };

  const handleBackToPortfolios = () => {
    setSelectedPortfolio(null);
    setEditingPortfolio(null);
    setView('portfolios');
  };

  return (
    <div className="portfolio-builder-container">
      <div className="portfolio-builder-header">
        <h1>Portfolio Builder</h1>
        <p>Create, manage, and analyze your investment portfolios</p>
      </div>

      {/* Navigation */}
      <div className="portfolio-navigation">
        {view === 'portfolios' && (
          <div className="portfolio-actions">
            <button onClick={handleCreateNew} className="create-new-btn">
              Create Manual Portfolio
            </button>
            <button onClick={handleCreateAI} className="ai-create-btn">
              🤖 AI Portfolio Builder
            </button>
          </div>
        )}
        {view === 'form' && (
          <button onClick={handleBackToPortfolios} className="back-btn">
            ← Back to Portfolios
          </button>
        )}
        {view === 'ai-form' && (
          <button onClick={handleBackToPortfolios} className="back-btn">
            ← Back to Portfolios
          </button>
        )}
        {view === 'result' && (
          <div className="result-navigation">
            <button onClick={handleBackToPortfolios} className="back-btn">
              ← Back to Portfolios
            </button>
            <div className="result-actions">
              <button onClick={handleCreateNew} className="create-new-btn">
                Create Manual Portfolio
              </button>
              <button onClick={handleCreateAI} className="ai-create-btn">
                🤖 AI Portfolio Builder
              </button>
            </div>
            </div>
          )}
        </div>

      {/* Content */}
      <div className="portfolio-content">
        {view === 'portfolios' && (
          <SavedPortfolios
            onSelectPortfolio={handleSelectPortfolio}
            onEditPortfolio={handleEditPortfolio}
            onRefresh={() => setRefreshTrigger(prev => prev + 1)}
          />
        )}

        {view === 'form' && (
          <PortfolioForm
            portfolio={editingPortfolio}
            onSave={handleSavePortfolio}
            onCancel={handleCancelForm}
          />
        )}

        {view === 'ai-form' && (
          <AIPortfolioBuilder
            onSavePortfolio={handleSavePortfolio}
            onCancel={handleCancelForm}
          />
        )}

        {view === 'result' && (
          <PortfolioResult
            portfolio={selectedPortfolio}
            onEdit={handleEditPortfolio}
            onDelete={handleDeletePortfolio}
            onSave={handleSavePortfolio}
          />
        )}
      </div>
    </div>
  );
};

export default PortfolioBuilder;
