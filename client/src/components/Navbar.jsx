import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ user, onLogout }) => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <h1>🛍️ FlockShop</h1>
        </Link>
        
        <div className="navbar-user">
          <span className="user-info">
            Welcome, {user.username}!
          </span>
          <button onClick={onLogout} className="logout-button">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 