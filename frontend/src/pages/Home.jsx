import React, { useState, useEffect } from 'react';
import './Home.css';

// Mock data for demonstration
const mockPortfolios = [
  {
    id: 1,
    name: 'Growth Portfolio',
    gainLoss: 12.5,
    holdings: [
      { ticker: 'AAPL', allocation_percentage: 30, sector: 'Technology' },
      { ticker: 'TSLA', allocation_percentage: 20, sector: 'Automotive' },
      { ticker: 'AMZN', allocation_percentage: 50, sector: 'Consumer Cyclical' },
    ],
    totalValue: 15000,
  },
  {
    id: 2,
    name: 'Dividend Portfolio',
    gainLoss: 3.2,
    holdings: [
      { ticker: 'JNJ', allocation_percentage: 40, sector: 'Healthcare' },
      { ticker: 'PG', allocation_percentage: 60, sector: 'Consumer Defensive' },
    ],
    totalValue: 8000,
  },
  {
    id: 3,
    name: 'Speculative Portfolio',
    gainLoss: -7.8,
    holdings: [
      { ticker: 'NVDA', allocation_percentage: 60, sector: 'Technology' },
      { ticker: 'PLTR', allocation_percentage: 40, sector: 'Technology' },
    ],
    totalValue: 4000,
  },
  {
    id: 4,
    name: 'Balanced Portfolio',
    gainLoss: -2.1,
    holdings: [
      { ticker: 'KO', allocation_percentage: 50, sector: 'Consumer Defensive' },
      { ticker: 'MSFT', allocation_percentage: 50, sector: 'Technology' },
    ],
    totalValue: 6000,
  },
];

const mockNews = [
  { title: 'Apple Unveils New Product Line', url: '#', tickers: ['AAPL'] },
  { title: 'Tesla Reports Record Deliveries', url: '#', tickers: ['TSLA'] },
  { title: 'Amazon Expands Grocery Business', url: '#', tickers: ['AMZN'] },
  { title: 'NVIDIA Powers Next-Gen AI', url: '#', tickers: ['NVDA'] },
  { title: 'Palantir Secures Government Contract', url: '#', tickers: ['PLTR'] },
  { title: 'Microsoft Cloud Growth Continues', url: '#', tickers: ['MSFT'] },
  { title: 'Coca-Cola Launches New Beverage', url: '#', tickers: ['KO'] },
  { title: 'Johnson & Johnson Vaccine Update', url: '#', tickers: ['JNJ'] },
  { title: 'Procter & Gamble Q2 Earnings Beat', url: '#', tickers: ['PG'] },
];

const Home = () => {
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [showSuggestion, setShowSuggestion] = useState(false);

  // Sort portfolios by gain/loss
  const sorted = [...mockPortfolios].sort((a, b) => b.gainLoss - a.gainLoss);
  const topPortfolios = sorted.slice(0, 2);
  const bottomPortfolios = sorted.slice(-2).reverse();

  // Get all tickers from top and bottom portfolios
  const allTickers = [
    ...new Set([
      ...topPortfolios.flatMap(p => p.holdings.map(h => h.ticker)),
      ...bottomPortfolios.flatMap(p => p.holdings.map(h => h.ticker)),
    ]),
  ];

  // Filter news for relevant tickers
  const relevantNews = mockNews.filter(article =>
    article.tickers.some(ticker => allTickers.includes(ticker))
  );

  // Calculate total value and sector allocation
  const totalValue = mockPortfolios.reduce((sum, p) => sum + p.totalValue, 0);
  const sectorAlloc = {};
  mockPortfolios.forEach(p => {
    p.holdings.forEach(h => {
      sectorAlloc[h.sector] = (sectorAlloc[h.sector] || 0) + h.allocation_percentage * (p.totalValue / 100);
    });
  });

  // AI suggestion logic (mocked)
  const handleAISuggestion = () => {
    setAiSuggestion(
      'AI Suggestion: Consider rebalancing your Speculative Portfolio to reduce risk, and increase allocation to Consumer Defensive stocks for more stability.'
    );
    setShowSuggestion(true);
  };

  return (
    <div className="dashboard-container">
      <h1>Welcome Back!</h1>
      <div className="dashboard-summary">
        <div className="summary-card">
          <h3>Total Portfolio Value</h3>
          <div className="summary-value">${totalValue.toLocaleString()}</div>
        </div>
        <div className="summary-card">
          <h3>Sector Allocation</h3>
          <ul className="sector-list">
            {Object.entries(sectorAlloc).map(([sector, value]) => (
              <li key={sector}><strong>{sector}:</strong> {value.toFixed(2)}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="dashboard-portfolios">
        <div className="portfolio-section">
          <h2>Top Performing Portfolios</h2>
          {topPortfolios.map(p => (
            <div className="portfolio-card top" key={p.id}>
              <h4>{p.name}</h4>
              <div className="gain positive">{p.gainLoss}%</div>
              <div className="value">Value: ${p.totalValue.toLocaleString()}</div>
            </div>
          ))}
        </div>
        <div className="portfolio-section">
          <h2>Poorest Performing Portfolios</h2>
          {bottomPortfolios.map(p => (
            <div className="portfolio-card bottom" key={p.id}>
              <h4>{p.name}</h4>
              <div className="gain negative">{p.gainLoss}%</div>
              <div className="value">Value: ${p.totalValue.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="dashboard-news">
        <h2>Related News</h2>
        <ul>
          {relevantNews.map((article, idx) => (
            <li key={idx}><a href={article.url} target="_blank" rel="noopener noreferrer">{article.title}</a></li>
          ))}
        </ul>
      </div>
      <div className="dashboard-ai-suggestion">
        <button className="ai-suggestion-btn" onClick={handleAISuggestion}>Get AI Suggestion</button>
        {showSuggestion && <div className="ai-suggestion-box">{aiSuggestion}</div>}
      </div>
      <div className="dashboard-extra">
        <h2>Other Insights</h2>
        <ul>
          <li>Recent activity: Portfolio "Growth Portfolio" gained 2% this week.</li>
          <li>Tip: Diversify across sectors to reduce risk.</li>
          <li>Market snapshot: S&P 500 up 0.8% today.</li>
        </ul>
      </div>
    </div>
  );
};

export default Home;
