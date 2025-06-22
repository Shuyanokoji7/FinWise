# FinWise - Financial Portfolio Management Application

A comprehensive financial portfolio management application built with Django backend and React frontend.

## Features

- User authentication and profile management
- Portfolio building and optimization
- Stock exploration and analysis
- Historical portfolio tracking
- Modern, responsive UI

## Tech Stack

- **Backend**: Django 5.2.3, Django REST Framework, JWT Authentication
- **Frontend**: React 19.1.0, React Router, Axios
- **Database**: SQLite (development), PostgreSQL (production ready)
- **Additional**: CVXPY for portfolio optimization, yfinance for stock data

## Setup Instructions

### Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd FinWise/backend
   ```

2. **Create and activate a virtual environment:**
   ```bash
   # Windows
   python -m venv env
   env\Scripts\activate
   
   # macOS/Linux
   python3 -m venv env
   source env/bin/activate
   ```

3. **Install Python dependencies:**
   ```bash
   pip install -r ../requirements.txt
   ```

4. **Run database migrations:**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

5. **Create a superuser (optional):**
   ```bash
   python manage.py createsuperuser
   ```

6. **Start the Django development server:**
   ```bash
   python manage.py runserver
   ```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd FinWise/frontend
   ```

2. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

3. **Start the React development server:**
   ```bash
   npm run dev
   # or
   npm start
   ```

The frontend will be available at `http://localhost:3000`

## Development Workflow

1. Start the Django backend server first
2. Start the React frontend server
3. Both servers should be running simultaneously for full functionality

## API Endpoints

- **Authentication**: `/api/auth/`
- **Portfolio**: `/api/portfolio/`
- **Explorer**: `/api/explorer/`
- **User Profile**: `/api/profile/`

## Project Structure

```
FinWise/
├── backend/
│   ├── core/           # Core functionality
│   ├── portfolio/      # Portfolio management
│   ├── explorer/       # Stock exploration
│   ├── userauth/       # User authentication
│   └── finwise_backend/ # Django settings
├── frontend/
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── pages/      # Page components
│   │   └── api/        # API integration
│   └── public/         # Static files
└── requirements.txt    # Python dependencies
```

## Troubleshooting

- **npm run dev error**: The `dev` script has been added to package.json
- **CORS errors**: Ensure django-cors-headers is installed and configured
- **Database issues**: Run migrations after any model changes

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request