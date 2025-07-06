import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import WishlistDetail from './components/WishlistDetail';
import Templates from './components/Templates';
import Navbar from './components/Navbar';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Initialize socket connection
    if (token) {
      const newSocket = io('http://localhost:5000');
      setSocket(newSocket);

      return () => newSocket.close();
    }
  }, [token]);

  useEffect(() => {
    // Check if user is authenticated
    if (token) {
      fetch('http://localhost:5000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
        } else {
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      })
      .catch(err => {
        console.error('Auth check error:', err);
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      });
    }
  }, [token]);

  const handleLogin = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('token', userToken);
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    if (socket) {
      socket.close();
      setSocket(null);
    }
  };

  return (
    <Router>
      <div className="App">
        {user && <Navbar user={user} onLogout={handleLogout} />}
        <div className="container">
          <Routes>
            <Route 
              path="/login" 
              element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} 
            />
            <Route 
              path="/signup" 
              element={!user ? <Signup onLogin={handleLogin} /> : <Navigate to="/" />} 
            />
            <Route 
              path="/" 
              element={user ? <Dashboard user={user} token={token} socket={socket} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/wishlist/:id" 
              element={user ? <WishlistDetail user={user} token={token} socket={socket} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/templates" 
              element={user ? <Templates user={user} token={token} /> : <Navigate to="/login" />} 
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
