import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { navLinks } from "../data/cinemaData";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="home-header">
      <div className="home-header-inner">
        <div className="home-logo" onClick={() => navigate("/")}>
          <span className="home-logo-icon"><img src="/src/img/gemini-svg.svg" alt="" /></span>
          <span className="home-logo-text">KHMER <b>CINEMA</b></span>
        </div>

        <nav className="home-nav">
          {navLinks.map((link) => (
            <Link key={link.label} className="home-nav-link" to={link.to}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="home-header-actions">
          {isAuthenticated && user ? (
            <>
              <div className="home-user-chip">
                <span className="home-user-avatar">{(user.name || "U").charAt(0).toUpperCase()}</span>
                <span className="home-user-name">{user.name || user.email}</span>
              </div>
              <button
                className="home-signin-btn"
                onClick={() => { logout(); navigate("/"); }}
              >
                Log Out
              </button>
            </>
          ) : (
            <button
              className="home-signin-btn"
              onClick={() => navigate("/login")}
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
