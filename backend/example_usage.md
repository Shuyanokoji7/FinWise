# FinWise API Usage Examples

## Enhanced Stock Analysis with Portfolio Context

The stock analysis API now supports portfolio-aware recommendations by including your current portfolio data.

### Basic Stock Analysis (No Portfolio Context)

```bash
GET /explorer/overview/?ticker=AAPL
```

### Stock Analysis with Portfolio Context

```bash
GET /explorer/overview/?ticker=AAPL&portfolio_stocks=GOOGL:40,MSFT:35,TSLA:25&portfolio_value=50000&portfolio_risk=Moderate
```

### Portfolio Analysis

```bash
GET /explorer/portfolio-analysis/?stocks=AAPL:30,GOOGL:40,MSFT:30&total_value=10000&risk_level=Moderate
```

## Parameter Format

### Portfolio Stocks Format
- **Format:** `ticker1:weight1,ticker2:weight2,ticker3:weight3`
- **Example:** `AAPL:30,GOOGL:40,MSFT:30`
- **Note:** Weights should add up to 100%

### Portfolio Value
- **Format:** Number (in dollars)
- **Example:** `50000`

### Risk Level
- **Options:** `Conservative`, `Moderate`, `Aggressive`
- **Default:** `Moderate`

## Enhanced AI Analysis Response

The AI analysis now includes portfolio-specific insights:

```json
{
  "ai_analysis": {
    "overview": "Apple Inc. is a technology company...",
    "financial_health": "Strong financial position...",
    "technical_analysis": "RSI indicates...",
    "risk_factors": ["Market volatility", "Competition"],
    "portfolio_fit": "AAPL would complement your current tech-heavy portfolio...",
    "recommendation": "Buy",
    "confidence_level": 8,
    "suggested_allocation": "15%",
    "diversification_benefits": "Adds stability and dividend income...",
    "reasoning": "Strong fundamentals with good portfolio fit..."
  },
  "portfolio_context": {
    "stocks": [
      {"ticker": "GOOGL", "weight": 40},
      {"ticker": "MSFT", "weight": 35},
      {"ticker": "TSLA", "weight": 25}
    ],
    "total_value": "50000",
    "risk_level": "Moderate"
  }
}
```

## Use Cases

### 1. New Investor (No Portfolio)
```bash
GET /explorer/overview/?ticker=AAPL
```
- Gets general analysis and recommendations
- No portfolio context needed

### 2. Existing Investor (With Portfolio)
```bash
GET /explorer/overview/?ticker=AAPL&portfolio_stocks=GOOGL:40,MSFT:35,TSLA:25&portfolio_value=50000&portfolio_risk=Moderate
```
- Gets personalized recommendations
- Considers current holdings
- Suggests optimal allocation

### 3. Portfolio Review
```bash
GET /explorer/portfolio-analysis/?stocks=AAPL:30,GOOGL:40,MSFT:30&total_value=10000&risk_level=Moderate
```
- Analyzes entire portfolio
- Provides diversification insights
- Suggests rebalancing

## Benefits of Portfolio-Aware Analysis

1. **Personalized Recommendations**: AI considers your current holdings
2. **Diversification Insights**: Identifies gaps and overlaps
3. **Optimal Allocation**: Suggests appropriate position sizes
4. **Risk Management**: Considers portfolio-level risk
5. **Sector Analysis**: Evaluates sector concentration

## Testing

Run the test script to verify everything works:

```bash
cd FinWise/backend
python test_gemini.py
```

This will test both basic and portfolio-aware analysis functionality. 