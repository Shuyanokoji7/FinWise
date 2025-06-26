// Mock data for frontend testing
export const mockPortfolios = [
  {
    id: 1,
    name: "Tech Growth Portfolio",
    description: "A diversified portfolio focused on technology growth stocks with high potential returns.",
    risk_level: "Aggressive",
    total_value: 125000.00,
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-03-20T14:45:00Z",
    is_active: true,
    holdings: [
      {
        id: 1,
        ticker: "AAPL",
        company_name: "Apple Inc.",
        sector: "Technology",
        shares: 50.0000,
        average_price: 150.00,
        current_price: 175.50,
        allocation_percentage: 25.00,
        market_value: 8775.00,
        unrealized_gain_loss: 1275.00,
        unrealized_gain_loss_percentage: 17.00,
        added_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-03-20T14:45:00Z"
      },
      {
        id: 2,
        ticker: "MSFT",
        company_name: "Microsoft Corporation",
        sector: "Technology",
        shares: 40.0000,
        average_price: 280.00,
        current_price: 320.75,
        allocation_percentage: 20.00,
        market_value: 12830.00,
        unrealized_gain_loss: 1630.00,
        unrealized_gain_loss_percentage: 14.55,
        added_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-03-20T14:45:00Z"
      },
      {
        id: 3,
        ticker: "GOOGL",
        company_name: "Alphabet Inc.",
        sector: "Technology",
        shares: 30.0000,
        average_price: 120.00,
        current_price: 145.25,
        allocation_percentage: 15.00,
        market_value: 4357.50,
        unrealized_gain_loss: 757.50,
        unrealized_gain_loss_percentage: 21.04,
        added_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-03-20T14:45:00Z"
      },
      {
        id: 4,
        ticker: "TSLA",
        company_name: "Tesla, Inc.",
        sector: "Automotive",
        shares: 25.0000,
        average_price: 200.00,
        current_price: 180.00,
        allocation_percentage: 12.50,
        market_value: 4500.00,
        unrealized_gain_loss: -500.00,
        unrealized_gain_loss_percentage: -10.00,
        added_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-03-20T14:45:00Z"
      },
      {
        id: 5,
        ticker: "NVDA",
        company_name: "NVIDIA Corporation",
        sector: "Technology",
        shares: 20.0000,
        average_price: 400.00,
        current_price: 550.00,
        allocation_percentage: 10.00,
        market_value: 11000.00,
        unrealized_gain_loss: 3000.00,
        unrealized_gain_loss_percentage: 37.50,
        added_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-03-20T14:45:00Z"
      }
    ]
  },
  {
    id: 2,
    name: "Conservative Income",
    description: "A conservative portfolio focused on dividend-paying stocks and stable growth.",
    risk_level: "Conservative",
    total_value: 75000.00,
    created_at: "2024-02-10T09:15:00Z",
    updated_at: "2024-03-18T16:20:00Z",
    is_active: true,
    holdings: [
      {
        id: 6,
        ticker: "JNJ",
        company_name: "Johnson & Johnson",
        sector: "Healthcare",
        shares: 100.0000,
        average_price: 160.00,
        current_price: 165.25,
        allocation_percentage: 30.00,
        market_value: 16525.00,
        unrealized_gain_loss: 525.00,
        unrealized_gain_loss_percentage: 3.28,
        added_at: "2024-02-10T09:15:00Z",
        updated_at: "2024-03-18T16:20:00Z"
      },
      {
        id: 7,
        ticker: "PG",
        company_name: "Procter & Gamble Co.",
        sector: "Consumer Defensive",
        shares: 80.0000,
        average_price: 140.00,
        current_price: 142.50,
        allocation_percentage: 25.00,
        market_value: 11400.00,
        unrealized_gain_loss: 200.00,
        unrealized_gain_loss_percentage: 1.79,
        added_at: "2024-02-10T09:15:00Z",
        updated_at: "2024-03-18T16:20:00Z"
      },
      {
        id: 8,
        ticker: "KO",
        company_name: "The Coca-Cola Company",
        sector: "Consumer Defensive",
        shares: 120.0000,
        average_price: 55.00,
        current_price: 58.75,
        allocation_percentage: 20.00,
        market_value: 7050.00,
        unrealized_gain_loss: 450.00,
        unrealized_gain_loss_percentage: 6.82,
        added_at: "2024-02-10T09:15:00Z",
        updated_at: "2024-03-18T16:20:00Z"
      },
      {
        id: 9,
        ticker: "VZ",
        company_name: "Verizon Communications",
        sector: "Communication Services",
        shares: 150.0000,
        average_price: 45.00,
        current_price: 42.25,
        allocation_percentage: 15.00,
        market_value: 6337.50,
        unrealized_gain_loss: -412.50,
        unrealized_gain_loss_percentage: -6.11,
        added_at: "2024-02-10T09:15:00Z",
        updated_at: "2024-03-18T16:20:00Z"
      },
      {
        id: 10,
        ticker: "XOM",
        company_name: "Exxon Mobil Corporation",
        sector: "Energy",
        shares: 60.0000,
        average_price: 85.00,
        current_price: 88.50,
        allocation_percentage: 10.00,
        market_value: 5310.00,
        unrealized_gain_loss: 210.00,
        unrealized_gain_loss_percentage: 4.12,
        added_at: "2024-02-10T09:15:00Z",
        updated_at: "2024-03-18T16:20:00Z"
      }
    ]
  },
  {
    id: 3,
    name: "Balanced Growth",
    description: "A balanced portfolio with a mix of growth and value stocks across different sectors.",
    risk_level: "Moderate",
    total_value: 95000.00,
    created_at: "2024-03-01T11:45:00Z",
    updated_at: "2024-03-19T13:30:00Z",
    is_active: true,
    holdings: [
      {
        id: 11,
        ticker: "AMZN",
        company_name: "Amazon.com, Inc.",
        sector: "Consumer Cyclical",
        shares: 35.0000,
        average_price: 130.00,
        current_price: 145.75,
        allocation_percentage: 20.00,
        market_value: 5101.25,
        unrealized_gain_loss: 551.25,
        unrealized_gain_loss_percentage: 12.12,
        added_at: "2024-03-01T11:45:00Z",
        updated_at: "2024-03-19T13:30:00Z"
      },
      {
        id: 12,
        ticker: "BRK.B",
        company_name: "Berkshire Hathaway Inc.",
        sector: "Financial Services",
        shares: 45.0000,
        average_price: 320.00,
        current_price: 335.25,
        allocation_percentage: 18.00,
        market_value: 15086.25,
        unrealized_gain_loss: 686.25,
        unrealized_gain_loss_percentage: 4.76,
        added_at: "2024-03-01T11:45:00Z",
        updated_at: "2024-03-19T13:30:00Z"
      },
      {
        id: 13,
        ticker: "UNH",
        company_name: "UnitedHealth Group Inc.",
        sector: "Healthcare",
        shares: 25.0000,
        average_price: 450.00,
        current_price: 475.50,
        allocation_percentage: 15.00,
        market_value: 11887.50,
        unrealized_gain_loss: 637.50,
        unrealized_gain_loss_percentage: 5.67,
        added_at: "2024-03-01T11:45:00Z",
        updated_at: "2024-03-19T13:30:00Z"
      },
      {
        id: 14,
        ticker: "HD",
        company_name: "The Home Depot, Inc.",
        sector: "Consumer Cyclical",
        shares: 40.0000,
        average_price: 280.00,
        current_price: 295.75,
        allocation_percentage: 14.00,
        market_value: 11830.00,
        unrealized_gain_loss: 630.00,
        unrealized_gain_loss_percentage: 5.63,
        added_at: "2024-03-01T11:45:00Z",
        updated_at: "2024-03-19T13:30:00Z"
      },
      {
        id: 15,
        ticker: "JPM",
        company_name: "JPMorgan Chase & Co.",
        sector: "Financial Services",
        shares: 50.0000,
        average_price: 140.00,
        current_price: 145.25,
        allocation_percentage: 12.00,
        market_value: 7262.50,
        unrealized_gain_loss: 262.50,
        unrealized_gain_loss_percentage: 3.75,
        added_at: "2024-03-01T11:45:00Z",
        updated_at: "2024-03-19T13:30:00Z"
      },
      {
        id: 16,
        ticker: "PFE",
        company_name: "Pfizer Inc.",
        sector: "Healthcare",
        shares: 80.0000,
        average_price: 35.00,
        current_price: 32.50,
        allocation_percentage: 10.00,
        market_value: 2600.00,
        unrealized_gain_loss: -200.00,
        unrealized_gain_loss_percentage: -7.14,
        added_at: "2024-03-01T11:45:00Z",
        updated_at: "2024-03-19T13:30:00Z"
      },
      {
        id: 17,
        ticker: "DIS",
        company_name: "The Walt Disney Company",
        sector: "Communication Services",
        shares: 60.0000,
        average_price: 85.00,
        current_price: 88.75,
        allocation_percentage: 8.00,
        market_value: 5325.00,
        unrealized_gain_loss: 225.00,
        unrealized_gain_loss_percentage: 4.41,
        added_at: "2024-03-01T11:45:00Z",
        updated_at: "2024-03-19T13:30:00Z"
      },
      {
        id: 18,
        ticker: "NKE",
        company_name: "NIKE, Inc.",
        sector: "Consumer Cyclical",
        shares: 45.0000,
        average_price: 95.00,
        current_price: 92.25,
        allocation_percentage: 6.00,
        market_value: 4151.25,
        unrealized_gain_loss: -123.75,
        unrealized_gain_loss_percentage: -2.89,
        added_at: "2024-03-01T11:45:00Z",
        updated_at: "2024-03-19T13:30:00Z"
      }
    ]
  }
];

// Mock watchlists
export const mockWatchlists = [
  {
    id: 1,
    name: "Tech Watchlist",
    created_at: "2024-01-20T10:00:00Z",
    updated_at: "2024-03-20T14:00:00Z",
    items: [
      {
        id: 1,
        ticker: "META",
        company_name: "Meta Platforms, Inc.",
        target_price: 350.00,
        notes: "Strong social media presence, potential for AR/VR growth",
        added_at: "2024-01-20T10:00:00Z"
      },
      {
        id: 2,
        ticker: "NFLX",
        company_name: "Netflix, Inc.",
        target_price: 450.00,
        notes: "Streaming leader, international expansion potential",
        added_at: "2024-01-20T10:00:00Z"
      }
    ]
  },
  {
    id: 2,
    name: "Dividend Stocks",
    created_at: "2024-02-15T09:30:00Z",
    updated_at: "2024-03-18T16:00:00Z",
    items: [
      {
        id: 3,
        ticker: "T",
        company_name: "AT&T Inc.",
        target_price: 25.00,
        notes: "High dividend yield, telecom restructuring",
        added_at: "2024-02-15T09:30:00Z"
      },
      {
        id: 4,
        ticker: "IBM",
        company_name: "International Business Machines",
        target_price: 180.00,
        notes: "Cloud and AI focus, dividend aristocrat",
        added_at: "2024-02-15T09:30:00Z"
      }
    ]
  }
]; 