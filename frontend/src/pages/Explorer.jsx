import React, { useState } from 'react';
import { 
  FaChartLine, FaDollarSign, FaPercentage, FaArrowUp, 
  FaArrowDown, FaCalendar, FaIndustry, FaGlobe,
  FaChartBar, FaPieChart, FaTable, FaNewspaper, FaUsers,
  FaBuilding, FaChartArea, FaInfoCircle, FaStar
} from 'react-icons/fa';
import './Explorer.css';

const Explorer = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('1M');
  const [selectedStock, setSelectedStock] = useState('AAPL');

  // Mock stock data
  const stockData = {
    AAPL: {
      name: 'Apple Inc.',
      ticker: 'AAPL',
      currentPrice: 175.43,
      change: 2.34,
      changePercent: 1.35,
      marketCap: '2.8T',
      exchange: 'NASDAQ',
      industry: 'Technology',
      sector: 'Consumer Electronics',
      volume: '45.2M',
      avgVolume: '52.1M',
      pe: 28.5,
      peg: 1.8,
      pb: 12.3,
      evEbitda: 18.2,
      dividendYield: 0.5,
      beta: 1.2,
      week52High: 198.23,
      week52Low: 124.17,
      revenue: '394.3B',
      netIncome: '96.9B',
      eps: 6.16,
      operatingMargin: 30.8,
      profitMargin: 24.6,
      freeCashFlow: '111.4B',
      debtToEquity: 1.2,
      epsGrowth: 8.5,
      revenueGrowth: 6.2,
      roe: 147.2,
      roa: 18.9,
      dividendPayoutRatio: 15.8,
      analystRating: 'Buy',
      priceTarget: 185.50,
      movingAverage50: 172.30,
      movingAverage200: 165.80,
      rsi: 58.5,
      support: 170.00,
      resistance: 180.00
    }
  };

  const timeframes = ['1D', '1W', '1M', '6M', '1Y', '5Y', 'Max'];
  
  // Mock price data for charts
  const generatePriceData = (days) => {
    const data = [];
    let price = 170;
    for (let i = 0; i < days; i++) {
      price += (Math.random() - 0.5) * 4;
      data.push({
        date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
        price: Math.round(price * 100) / 100
      });
    }
    return data;
  };

  const priceData = generatePriceData(30);

  return (
    <div className="explorer-container">
      {/* Header Section */}
      <div className="explorer-header">
        <div className="stock-overview">
          <div className="stock-info">
            <h1>{stockData[selectedStock].name}</h1>
            <span className="ticker">{stockData[selectedStock].ticker}</span>
            <span className={`change ${stockData[selectedStock].change > 0 ? 'positive' : 'negative'}`}>
              {stockData[selectedStock].change > 0 ? '+' : ''}{stockData[selectedStock].change} 
              ({stockData[selectedStock].changePercent}%)
            </span>
          </div>
          <div className="current-price">
            <span className="price">${stockData[selectedStock].currentPrice}</span>
          </div>
        </div>
        
        <div className="stock-meta">
          <div className="meta-item">
            <FaIndustry />
            <span>{stockData[selectedStock].industry}</span>
          </div>
          <div className="meta-item">
            <FaGlobe />
            <span>{stockData[selectedStock].exchange}</span>
          </div>
          <div className="meta-item">
            <FaDollarSign />
            <span>Market Cap: {stockData[selectedStock].marketCap}</span>
          </div>
        </div>
      </div>

      {/* Timeframe Selector */}
      <div className="timeframe-selector">
        {timeframes.map(timeframe => (
          <button
            key={timeframe}
            className={`timeframe-btn ${selectedTimeframe === timeframe ? 'active' : ''}`}
            onClick={() => setSelectedTimeframe(timeframe)}
          >
            {timeframe}
          </button>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="explorer-grid">
        {/* Price Chart */}
        <div className="chart-card">
          <div className="card-header">
            <h3><FaChartLine /> Price Chart</h3>
          </div>
          <div className="price-chart">
            <div className="chart-container">
              {priceData.map((point, index) => (
                <div
                  key={index}
                  className="chart-bar"
                  style={{
                    height: `${((point.price - 160) / 20) * 100}%`,
                    backgroundColor: point.price > 175 ? '#4CAF50' : '#FF5722'
                  }}
                  title={`${point.date}: $${point.price}`}
                />
              ))}
            </div>
            <div className="chart-labels">
              <span>30 Days Ago</span>
              <span>Today</span>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="metrics-card">
          <div className="card-header">
            <h3><FaChartBar /> Key Metrics</h3>
          </div>
          <div className="metrics-grid">
            <div className="metric-item">
              <span className="metric-label">P/E Ratio</span>
              <span className="metric-value">{stockData[selectedStock].pe}</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">PEG Ratio</span>
              <span className="metric-value">{stockData[selectedStock].peg}</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">P/B Ratio</span>
              <span className="metric-value">{stockData[selectedStock].pb}</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">EV/EBITDA</span>
              <span className="metric-value">{stockData[selectedStock].evEbitda}</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Dividend Yield</span>
              <span className="metric-value">{stockData[selectedStock].dividendYield}%</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Beta</span>
              <span className="metric-value">{stockData[selectedStock].beta}</span>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="performance-card">
          <div className="card-header">
            <h3><FaArrowUp /> Performance</h3>
          </div>
          <div className="performance-metrics">
            <div className="performance-item">
              <div className="performance-label">52-Week High</div>
              <div className="performance-value high">${stockData[selectedStock].week52High}</div>
            </div>
            <div className="performance-item">
              <div className="performance-label">52-Week Low</div>
              <div className="performance-value low">${stockData[selectedStock].week52Low}</div>
            </div>
            <div className="performance-item">
              <div className="performance-label">Volume</div>
              <div className="performance-value">{stockData[selectedStock].volume}</div>
            </div>
            <div className="performance-item">
              <div className="performance-label">Avg Volume</div>
              <div className="performance-value">{stockData[selectedStock].avgVolume}</div>
            </div>
          </div>
        </div>

        {/* Financial Health */}
        <div className="financial-card">
          <div className="card-header">
            <h3><FaBuilding /> Financial Health</h3>
          </div>
          <div className="financial-metrics">
            <div className="financial-item">
              <span className="financial-label">Revenue</span>
              <span className="financial-value">{stockData[selectedStock].revenue}</span>
            </div>
            <div className="financial-item">
              <span className="financial-label">Net Income</span>
              <span className="financial-value">{stockData[selectedStock].netIncome}</span>
            </div>
            <div className="financial-item">
              <span className="financial-label">EPS</span>
              <span className="financial-value">${stockData[selectedStock].eps}</span>
            </div>
            <div className="financial-item">
              <span className="financial-label">Operating Margin</span>
              <span className="financial-value">{stockData[selectedStock].operatingMargin}%</span>
            </div>
            <div className="financial-item">
              <span className="financial-label">Profit Margin</span>
              <span className="financial-value">{stockData[selectedStock].profitMargin}%</span>
            </div>
            <div className="financial-item">
              <span className="financial-label">Free Cash Flow</span>
              <span className="financial-value">{stockData[selectedStock].freeCashFlow}</span>
            </div>
          </div>
        </div>

        {/* Growth Metrics */}
        <div className="growth-card">
          <div className="card-header">
            <h3><FaArrowUp /> Growth Metrics</h3>
          </div>
          <div className="growth-metrics">
            <div className="growth-item">
              <div className="growth-bar">
                <div 
                  className="growth-fill positive" 
                  style={{ width: `${Math.min(stockData[selectedStock].epsGrowth * 5, 100)}%` }}
                ></div>
              </div>
              <span className="growth-label">EPS Growth: {stockData[selectedStock].epsGrowth}%</span>
            </div>
            <div className="growth-item">
              <div className="growth-bar">
                <div 
                  className="growth-fill positive" 
                  style={{ width: `${Math.min(stockData[selectedStock].revenueGrowth * 8, 100)}%` }}
                ></div>
              </div>
              <span className="growth-label">Revenue Growth: {stockData[selectedStock].revenueGrowth}%</span>
            </div>
            <div className="growth-item">
              <div className="growth-label">ROE: {stockData[selectedStock].roe}%</div>
            </div>
            <div className="growth-item">
              <div className="growth-label">ROA: {stockData[selectedStock].roa}%</div>
            </div>
          </div>
        </div>

        {/* Analyst Ratings */}
        <div className="analyst-card">
          <div className="card-header">
            <h3><FaStar /> Analyst Ratings</h3>
          </div>
          <div className="analyst-content">
            <div className="rating-summary">
              <div className="rating-item">
                <span className="rating-label">Recommendation</span>
                <span className={`rating-value ${stockData[selectedStock].analystRating.toLowerCase()}`}>
                  {stockData[selectedStock].analystRating}
                </span>
              </div>
              <div className="rating-item">
                <span className="rating-label">Price Target</span>
                <span className="rating-value">${stockData[selectedStock].priceTarget}</span>
              </div>
            </div>
            <div className="rating-breakdown">
              <div className="breakdown-item">
                <span>Buy</span>
                <div className="breakdown-bar">
                  <div className="breakdown-fill buy" style={{ width: '65%' }}></div>
                </div>
                <span>65%</span>
              </div>
              <div className="breakdown-item">
                <span>Hold</span>
                <div className="breakdown-bar">
                  <div className="breakdown-fill hold" style={{ width: '25%' }}></div>
                </div>
                <span>25%</span>
              </div>
              <div className="breakdown-item">
                <span>Sell</span>
                <div className="breakdown-bar">
                  <div className="breakdown-fill sell" style={{ width: '10%' }}></div>
                </div>
                <span>10%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Indicators */}
        <div className="technical-card">
          <div className="card-header">
            <h3><FaChartArea /> Technical Indicators</h3>
          </div>
          <div className="technical-metrics">
            <div className="technical-item">
              <span className="technical-label">50-Day MA</span>
              <span className="technical-value">${stockData[selectedStock].movingAverage50}</span>
            </div>
            <div className="technical-item">
              <span className="technical-label">200-Day MA</span>
              <span className="technical-value">${stockData[selectedStock].movingAverage200}</span>
            </div>
            <div className="technical-item">
              <span className="technical-label">RSI</span>
              <span className="technical-value">{stockData[selectedStock].rsi}</span>
            </div>
            <div className="technical-item">
              <span className="technical-label">Support</span>
              <span className="technical-value">${stockData[selectedStock].support}</span>
            </div>
            <div className="technical-item">
              <span className="technical-label">Resistance</span>
              <span className="technical-value">${stockData[selectedStock].resistance}</span>
            </div>
          </div>
        </div>

        {/* Company Profile */}
        <div className="profile-card">
          <div className="card-header">
            <h3><FaInfoCircle /> Company Profile</h3>
          </div>
          <div className="profile-content">
            <p>
              Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, 
              wearables, and accessories worldwide. The company offers iPhone, Mac, iPad, and wearables, 
              home, and accessories.
            </p>
            <div className="profile-stats">
              <div className="stat-item">
                <span className="stat-label">Employees</span>
                <span className="stat-value">164,000</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Founded</span>
                <span className="stat-value">1976</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Headquarters</span>
                <span className="stat-value">Cupertino, CA</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Explorer;
