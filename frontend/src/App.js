import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Profile from './pages/Profile';
import PortfolioBuilder from './pages/PortfolioBuilder';
import Explorer from './pages/Explorer';
import History from './pages/History';
import Navbar from './components/Navbar';
import HorizontalNavbar from './components/HorizontalNavbar';
import './App.css';

function AppContent() {
  const location = useLocation();
  const showNavbar = !['/', '/login', '/register'].includes(location.pathname);

  return (
    <div className="App">
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/portfolio" element={<PortfolioBuilder />} />
        <Route path="/explorer" element={<Explorer />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <HorizontalNavbar />
      <AppContent />
    </Router>
  );
}

export default App;
