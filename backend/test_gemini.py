#!/usr/bin/env python3
"""
Test script for Google Gemini API setup
Run this script to verify your Gemini API key is working correctly.
"""

import os
import sys
import django

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'finwise_backend.settings')
django.setup()

from django.conf import settings
import google.generativeai as genai

def test_gemini_connection():
    """Test if Gemini API is properly configured"""
    try:
        # Check if API key is set
        if not hasattr(settings, 'GEMINI_API_KEY') or settings.GEMINI_API_KEY == 'YOUR_GEMINI_API_KEY':
            print("❌ ERROR: GEMINI_API_KEY not configured in settings.py")
            print("Please set your actual Gemini API key in finwise_backend/settings.py")
            return False
        
        # Configure Gemini
        genai.configure(api_key=settings.GEMINI_API_KEY)
        
        # Test with a simple prompt
        model = genai.GenerativeModel('gemini-1.5-flash-latest')
        response = model.generate_content("Hello! Please respond with 'Gemini API is working!' if you can see this message.")
        
        if "Gemini API is working!" in response.text:
            print("✅ SUCCESS: Gemini API is working correctly!")
            print(f"Response: {response.text}")
            return True
        else:
            print("⚠️  WARNING: Gemini API responded but not as expected")
            print(f"Response: {response.text}")
            return True
            
    except Exception as e:
        print(f"❌ ERROR: Failed to connect to Gemini API: {str(e)}")
        # for m in genai.list_models():
            # print(m)
        return False

def test_stock_analysis():
    """Test stock analysis functionality"""
    try:
        from explorer.gemini_utils import analyze_stock_data
        
        # Sample stock data
        sample_data = {
            'name': 'Apple Inc.',
            'ticker': 'AAPL',
            'currentPrice': 150.0,
            'change': 2.5,
            'changePercent': 1.67,
            'marketCap': 2500000000000,
            'pe': 25.5,
            'pb': 15.2,
            'roe': 18.5,
            'roa': 12.3,
            'eps': 5.88,
            'netProfitMargin': 25.8,
            'debtToEquity': 1.2,
            'dividendYield': 0.5,
            'rsi': 65.2,
            'macd': 0.85,
            'ema20': 148.5,
            'industry': 'Technology'
        }
        
        print("\n🧪 Testing stock analysis...")
        analysis = analyze_stock_data(sample_data)
        
        if 'error' in analysis:
            print(f"❌ ERROR in stock analysis: {analysis['error']}")
            return False
        else:
            print("✅ SUCCESS: Stock analysis working!")
            print(f"Analysis keys: {list(analysis.keys())}")
            
            # Test with portfolio context
            print("\n🧪 Testing portfolio-aware stock analysis...")
            portfolio_data = {
                'stocks': [
                    {'ticker': 'GOOGL', 'weight': 40},
                    {'ticker': 'MSFT', 'weight': 35},
                    {'ticker': 'TSLA', 'weight': 25}
                ],
                'total_value': 50000,
                'risk_level': 'Moderate'
            }
            
            portfolio_analysis = analyze_stock_data(sample_data, portfolio_data)
            
            if 'error' in portfolio_analysis:
                print(f"❌ ERROR in portfolio-aware analysis: {portfolio_analysis['error']}")
                return False
            else:
                print("✅ SUCCESS: Portfolio-aware analysis working!")
                print(f"Portfolio analysis keys: {list(portfolio_analysis.keys())}")
                return True
            
    except Exception as e:
        print(f"❌ ERROR: Failed to test stock analysis: {str(e)}")
        return False

def main():
    """Main test function"""
    print("🚀 Testing Google Gemini API Setup")
    print("=" * 50)
    
    # Test basic connection
    connection_ok = test_gemini_connection()
    
    if connection_ok:
        # Test stock analysis
        analysis_ok = test_stock_analysis()
        
        if analysis_ok:
            print("\n🎉 All tests passed! Gemini API is ready to use.")
            print("\nNext steps:")
            print("1. Install dependencies: pip install -r requirements.txt")
            print("2. Run your Django server: python manage.py runserver")
            print("3. Test the API endpoints:")
            print("   - GET /explorer/overview/?ticker=AAPL")
            print("   - GET /explorer/portfolio-analysis/?stocks=AAPL:30,GOOGL:40,MSFT:30&total_value=10000")
        else:
            print("\n⚠️  Basic connection works but analysis failed.")
    else:
        print("\n❌ Setup incomplete. Please check your configuration.")

if __name__ == "__main__":
    main() 