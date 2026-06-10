import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { useState } from 'react';
import './App.css';
import { logout, isAuthenticated } from './services/authService';

import Login from './pages/Login';
import Home from './pages/Home';
import ClassStreams from './pages/ClassStreams';
import Students from './pages/Students';
import Subjects from './pages/Subjects';
import Scores from './pages/Scores';
import Results from './pages/Results';
// import ProtectedRoute from './components/ProtectedRoute';

function NavBar() {
  const [navOpen, setNavOpen] = useState(false);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const toggleNav = () => setNavOpen(!navOpen);

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="navbar-brand">
          <span className="material-symbols-outlined brand-icon">school</span>
          <h1>Student Management System</h1>
        </div>
        {/* Toggle button visible on small screens */}
        <button className="nav-toggle" aria-label="Menu" onClick={toggleNav}>
          <span className="material-symbols-outlined">more_vert</span>
        </button>
        {/* Desktop links */}
        <ul className="navbar-links desktop">
          <li><NavLink to="/" end>Home</NavLink></li>
          <li><NavLink to="/class-streams">Class Streams</NavLink></li>
          <li><NavLink to="/students">Students</NavLink></li>
          <li><NavLink to="/subjects">Subjects</NavLink></li>
          <li><NavLink to="/scores">Scores</NavLink></li>
          <li><NavLink to="/results">Results</NavLink></li>
        </ul>
        {/* Mobile drawer */}
        <div className={`nav-drawer ${navOpen ? 'open' : ''}`}>
          <ul className="navbar-links mobile">
            <li><NavLink to="/" end onClick={toggleNav}>Home</NavLink></li>
            <li><NavLink to="/class-streams" onClick={toggleNav}>Class Streams</NavLink></li>
            <li><NavLink to="/students" onClick={toggleNav}>Students</NavLink></li>
            <li><NavLink to="/subjects" onClick={toggleNav}>Subjects</NavLink></li>
            <li><NavLink to="/scores" onClick={toggleNav}>Scores</NavLink></li>
            <li><NavLink to="/results" onClick={toggleNav}>Results</NavLink></li>
          </ul>
        </div>
        <div className="navbar-user">
          {/* <span className="navbar-user-name">{user?.name}</span> */}
          <button onClick={handleLogout} className="btn btn-secondary">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              isAuthenticated() ? (
                <>
                  <NavBar />
                  <div className="content">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/class-streams" element={<ClassStreams />} />
                      <Route path="/students" element={<Students />} />
                      <Route path="/subjects" element={<Subjects />} />
                      <Route path="/scores" element={<Scores />} />
                      <Route path="/results" element={<Results />} />
                    </Routes>
                  </div>
                </>
              ) : (
                <Login />
              )
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
