import axios from 'axios';
import { mockPortfolios, mockWatchlists } from './mockData';

const API_URL = 'http://localhost:8000/api/portfolio/';

// Get auth token from localStorage
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
    };
};

// Helper function to simulate API delay
const simulateApiCall = (data, delay = 500) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ data });
        }, delay);
    });
};

// Portfolio Management
export const getPortfolios = () => {
    // Use mock data for testing
    return simulateApiCall(mockPortfolios);
    
    // Uncomment when backend is ready:
    // return axios.get(API_URL + 'portfolios/', { headers: getAuthHeaders() });
};

export const getPortfolio = (portfolioId) => {
    // Use mock data for testing
    const portfolio = mockPortfolios.find(p => p.id === parseInt(portfolioId));
    if (!portfolio) {
        return Promise.reject(new Error('Portfolio not found'));
    }
    return simulateApiCall(portfolio);
    
    // Uncomment when backend is ready:
    // return axios.get(API_URL + `portfolios/${portfolioId}/`, { headers: getAuthHeaders() });
};

export const createPortfolio = (portfolioData) => {
    // Use mock data for testing
    const newPortfolio = {
        id: Date.now(),
        ...portfolioData,
        total_value: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true,
        holdings: []
    };
    mockPortfolios.push(newPortfolio);
    return simulateApiCall(newPortfolio);
    
    // Uncomment when backend is ready:
    // return axios.post(API_URL + 'portfolios/', portfolioData, { headers: getAuthHeaders() });
};

export const updatePortfolio = (portfolioId, portfolioData) => {
    // Use mock data for testing
    const portfolioIndex = mockPortfolios.findIndex(p => p.id === parseInt(portfolioId));
    if (portfolioIndex === -1) {
        return Promise.reject(new Error('Portfolio not found'));
    }
    
    mockPortfolios[portfolioIndex] = {
        ...mockPortfolios[portfolioIndex],
        ...portfolioData,
        updated_at: new Date().toISOString()
    };
    
    return simulateApiCall(mockPortfolios[portfolioIndex]);
    
    // Uncomment when backend is ready:
    // return axios.put(API_URL + `portfolios/${portfolioId}/`, portfolioData, { headers: getAuthHeaders() });
};

export const deletePortfolio = (portfolioId) => {
    // Use mock data for testing
    const portfolioIndex = mockPortfolios.findIndex(p => p.id === parseInt(portfolioId));
    if (portfolioIndex === -1) {
        return Promise.reject(new Error('Portfolio not found'));
    }
    
    mockPortfolios[portfolioIndex].is_active = false;
    return simulateApiCall({ success: true });
    
    // Uncomment when backend is ready:
    // return axios.delete(API_URL + `portfolios/${portfolioId}/`, { headers: getAuthHeaders() });
};

// Portfolio Holdings Management
export const getPortfolioHoldings = (portfolioId) => {
    // Use mock data for testing
    const portfolio = mockPortfolios.find(p => p.id === parseInt(portfolioId));
    if (!portfolio) {
        return Promise.reject(new Error('Portfolio not found'));
    }
    return simulateApiCall(portfolio.holdings || []);
    
    // Uncomment when backend is ready:
    // return axios.get(API_URL + `portfolios/${portfolioId}/holdings/`, { headers: getAuthHeaders() });
};

export const addHolding = (portfolioId, holdingData) => {
    // Use mock data for testing
    const portfolio = mockPortfolios.find(p => p.id === parseInt(portfolioId));
    if (!portfolio) {
        return Promise.reject(new Error('Portfolio not found'));
    }
    
    const newHolding = {
        id: Date.now(),
        ...holdingData,
        added_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };
    
    if (!portfolio.holdings) {
        portfolio.holdings = [];
    }
    portfolio.holdings.push(newHolding);
    
    return simulateApiCall(newHolding);
    
    // Uncomment when backend is ready:
    // return axios.post(API_URL + `portfolios/${portfolioId}/holdings/`, holdingData, { headers: getAuthHeaders() });
};

export const updateHolding = (portfolioId, holdingId, holdingData) => {
    // Use mock data for testing
    const portfolio = mockPortfolios.find(p => p.id === parseInt(portfolioId));
    if (!portfolio || !portfolio.holdings) {
        return Promise.reject(new Error('Portfolio or holding not found'));
    }
    
    const holdingIndex = portfolio.holdings.findIndex(h => h.id === parseInt(holdingId));
    if (holdingIndex === -1) {
        return Promise.reject(new Error('Holding not found'));
    }
    
    portfolio.holdings[holdingIndex] = {
        ...portfolio.holdings[holdingIndex],
        ...holdingData,
        updated_at: new Date().toISOString()
    };
    
    return simulateApiCall(portfolio.holdings[holdingIndex]);
    
    // Uncomment when backend is ready:
    // return axios.put(API_URL + `portfolios/${portfolioId}/holdings/${holdingId}/`, holdingData, { headers: getAuthHeaders() });
};

export const deleteHolding = (portfolioId, holdingId) => {
    // Use mock data for testing
    const portfolio = mockPortfolios.find(p => p.id === parseInt(portfolioId));
    if (!portfolio || !portfolio.holdings) {
        return Promise.reject(new Error('Portfolio or holding not found'));
    }
    
    const holdingIndex = portfolio.holdings.findIndex(h => h.id === parseInt(holdingId));
    if (holdingIndex === -1) {
        return Promise.reject(new Error('Holding not found'));
    }
    
    portfolio.holdings.splice(holdingIndex, 1);
    return simulateApiCall({ success: true });
    
    // Uncomment when backend is ready:
    // return axios.delete(API_URL + `portfolios/${portfolioId}/holdings/${holdingId}/`, { headers: getAuthHeaders() });
};

// Watchlist Management
export const getWatchlists = () => {
    // Use mock data for testing
    return simulateApiCall(mockWatchlists);
    
    // Uncomment when backend is ready:
    // return axios.get(API_URL + 'watchlists/', { headers: getAuthHeaders() });
};

export const createWatchlist = (watchlistData) => {
    // Use mock data for testing
    const newWatchlist = {
        id: Date.now(),
        ...watchlistData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        items: []
    };
    mockWatchlists.push(newWatchlist);
    return simulateApiCall(newWatchlist);
    
    // Uncomment when backend is ready:
    // return axios.post(API_URL + 'watchlists/', watchlistData, { headers: getAuthHeaders() });
};

export const getWatchlistItems = (watchlistId) => {
    // Use mock data for testing
    const watchlist = mockWatchlists.find(w => w.id === parseInt(watchlistId));
    if (!watchlist) {
        return Promise.reject(new Error('Watchlist not found'));
    }
    return simulateApiCall(watchlist.items || []);
    
    // Uncomment when backend is ready:
    // return axios.get(API_URL + `watchlists/${watchlistId}/items/`, { headers: getAuthHeaders() });
};

export const addWatchlistItem = (watchlistId, itemData) => {
    // Use mock data for testing
    const watchlist = mockWatchlists.find(w => w.id === parseInt(watchlistId));
    if (!watchlist) {
        return Promise.reject(new Error('Watchlist not found'));
    }
    
    const newItem = {
        id: Date.now(),
        ...itemData,
        added_at: new Date().toISOString()
    };
    
    if (!watchlist.items) {
        watchlist.items = [];
    }
    watchlist.items.push(newItem);
    
    return simulateApiCall(newItem);
    
    // Uncomment when backend is ready:
    // return axios.post(API_URL + `watchlists/${watchlistId}/items/`, itemData, { headers: getAuthHeaders() });
};
