# Portfolio Builder Testing Guide

## 🚀 Quick Start

The portfolio builder is now configured with **mock data** for frontend testing. You can test all functionality without needing the backend running.

## 🆕 New Features

### 🤖 AI Portfolio Builder
- **Smart Allocation**: Provide tickers and total amount, get AI-powered allocation suggestions
- **Risk-Based Optimization**: Different allocation strategies based on risk level (Conservative, Moderate, Aggressive)
- **Intelligent Reasoning**: Each allocation comes with detailed reasoning
- **One-Click Creation**: Accept suggestions to instantly create a portfolio

## 📊 Available Mock Data

### Sample Portfolios

1. **Tech Growth Portfolio** (Aggressive)
   - 5 holdings: AAPL, MSFT, GOOGL, TSLA, NVDA
   - Total Value: $125,000
   - Mixed performance (some gains, some losses)

2. **Conservative Income** (Conservative)
   - 5 holdings: JNJ, PG, KO, VZ, XOM
   - Total Value: $75,000
   - Stable dividend-paying stocks

3. **Balanced Growth** (Moderate)
   - 8 holdings: AMZN, BRK.B, UNH, HD, JPM, PFE, DIS, NKE
   - Total Value: $95,000
   - Diversified across sectors

## 🧪 Testing Features

### 1. View Portfolios
- Navigate to `/portfolio` in your app
- You'll see 3 sample portfolios with real data
- Each portfolio shows total value, gain/loss, and holdings count

### 2. View Portfolio Details
- Click "View" on any portfolio card
- See detailed analysis including:
  - Portfolio summary metrics
  - Top holdings breakdown
  - Sector allocation visualization
  - Complete holdings table (expandable)

### 3. Edit Portfolios
- Click "Edit" on any portfolio
- Modify portfolio name, description, risk level
- Add/remove/edit individual holdings
- Test form validation and error handling

### 4. Create Manual Portfolio
- Click "Create Manual Portfolio"
- Fill out the form with test data
- Add multiple holdings manually
- Test the allocation percentage calculation

### 5. 🤖 AI Portfolio Builder (NEW!)
- Click "🤖 AI Portfolio Builder"
- Enter portfolio details (name, description, risk level)
- Provide total investment amount
- Enter stock tickers (comma-separated)
- Click "Generate AI Suggestions"
- Review AI-generated allocations with reasoning
- Accept suggestions to create portfolio instantly

### 6. Delete Portfolios
- Click "Delete" on any portfolio
- Confirm the deletion
- Portfolio will be marked as inactive

## 🤖 AI Builder Testing Scenarios

### Test Case 1: Conservative Portfolio
```
Risk Level: Conservative
Total Amount: $50,000
Tickers: JNJ, PG, KO, VZ, XOM
Expected: Higher allocations to stable, dividend-paying stocks
```

### Test Case 2: Aggressive Portfolio
```
Risk Level: Aggressive
Total Amount: $100,000
Tickers: AAPL, MSFT, GOOGL, TSLA, NVDA
Expected: Balanced allocations with slight preference for tech giants
```

### Test Case 3: Mixed Portfolio
```
Risk Level: Moderate
Total Amount: $75,000
Tickers: AAPL, JNJ, AMZN, BRK.B, DIS
Expected: Balanced approach across different sectors
```

## 📝 Sample Test Data

### Portfolio Creation
```
Name: "My Test Portfolio"
Description: "A test portfolio for frontend testing"
Risk Level: "Moderate"
```

### Sample Holdings
```
Ticker: "META"
Company: "Meta Platforms, Inc."
Sector: "Technology"
Shares: 25
Average Price: 250.00
Current Price: 275.50
Allocation: 15.00
```

### AI Builder Test Data
```
Portfolio Name: "AI Test Portfolio"
Description: "AI-generated portfolio for testing"
Risk Level: "Moderate"
Total Amount: 50000
Tickers: "AAPL, MSFT, GOOGL, TSLA, NVDA"
```

## 🔧 Switching to Real API

When you're ready to connect to the backend:

1. Open `src/api/portfolio.js`
2. Comment out the mock data sections
3. Uncomment the real API calls
4. Ensure your Django backend is running on `localhost:8000`

## 🎨 UI Features to Test

- **Responsive Design**: Test on different screen sizes
- **Loading States**: Observe loading spinners during API calls
- **Error Handling**: Try invalid operations to see error messages
- **Form Validation**: Test required fields and data validation
- **Navigation**: Test back buttons and view transitions
- **Real-time Calculations**: Watch allocation percentages update
- **AI Suggestions**: Test the AI allocation algorithm with different inputs

## 🤖 AI Features to Test

- **Risk Level Impact**: Test how different risk levels affect allocations
- **Ticker Recognition**: Test with known tickers vs unknown ones
- **Allocation Logic**: Verify allocations add up to 100%
- **Reasoning Generation**: Check that each allocation has meaningful reasoning
- **Suggestion Acceptance**: Test the flow from suggestions to portfolio creation

## 📱 Mobile Testing

The interface is fully responsive. Test on:
- Desktop browsers
- Tablet devices
- Mobile phones
- Different browser sizes

## 🐛 Known Mock Data Limitations

- Data persists only during the session (refreshes reset to original state)
- No real-time price updates
- Limited to the sample portfolios provided
- No authentication required for testing
- AI suggestions are simulated (not real AI)

## 🎯 Next Steps

1. Test all CRUD operations
2. Verify calculations are correct
3. Test edge cases and error scenarios
4. Check responsive design on different devices
5. Test AI portfolio builder with various inputs
6. When ready, switch to real API integration

## 🚀 AI Integration Notes

The current AI portfolio builder uses simulated AI logic. For production:
- Replace `generateSuggestions()` with real AI API calls
- Integrate with market data APIs for real-time prices
- Add more sophisticated allocation algorithms
- Include risk assessment and correlation analysis

Happy testing! 🎉 