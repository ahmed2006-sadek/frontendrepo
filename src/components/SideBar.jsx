import { LayoutDashboard, Users, Boxes, FolderKanban, UserPlus, LogOut, Menu, X, Sun, Moon } from "lucide-react";
import { NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

// ThemeToggle Component (can be in its own file or here)
function ThemeToggle() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle theme">
      <div className="theme-toggle-slider">
        {theme === 'light' ? <Sun size={14} /> : <Moon size={14} />}
      </div>
    </button>
  );
}


export default function Sidebar({ setIsLoggedIn }) {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(window.innerWidth <= 1024);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (window.innerWidth > 768) {
        setIsMobileOpen(false); // Close mobile menu on desktop
      }
      // Collapse sidebar on medium screens
      if (window.innerWidth <= 1024 && window.innerWidth > 768) {
        setIsCollapsed(true);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileOpen(!isMobileOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    navigate("/");
  };

  return (
    <>
      {isMobile && (
        <button className="sidebar-toggle mobile-button" onClick={toggleSidebar}>
          {isMobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      )}

      {isMobile && isMobileOpen && (
        <div className="sidebar-overlay" onClick={() => setIsMobileOpen(false)} />
      )}

      <nav className={`sidebar ${isCollapsed ? "collapsed" : ""} ${isMobileOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          {!isCollapsed && <span className="logo-text">Rocket CRM</span>}
          {!isMobile && (
            <button className="sidebar-toggle" onClick={toggleSidebar}>
              {isCollapsed ? <Menu size={18} /> : <X size={18} />}
            </button>
          )}
        </div>

        <ul className="sidebar-links" style={{ overflowX: "hidden" }}>
          <li><NavLink to="/dashboard" className="sidebar-link"><LayoutDashboard size={20} /> <span className="link-text">Dashboard</span></NavLink></li>
          <li><NavLink to="/users" className="sidebar-link"><Users size={20} /> <span className="link-text">Users</span></NavLink></li>
          <li><NavLink to="/inventory" className="sidebar-link"><Boxes size={20} /> <span className="link-text">Inventory</span></NavLink></li>
          <li><NavLink to="/projects" className="sidebar-link"><FolderKanban size={20} /> <span className="link-text">Projects</span></NavLink></li>
          <li><NavLink to="/leads" className="sidebar-link"><UserPlus size={20} /> <span className="link-text">Leads</span></NavLink></li>
        </ul>

        <div className="sidebar-theme-section">
          <span  className="theme-toggle-label">dark & light</span>
          <ThemeToggle />
        </div>

        <div className="sidebar-footer">
          <button className="logout-link" onClick={handleLogout}>
            <LogOut size={20} /> <span>Log Out</span>
          </button>
        </div>
      </nav>
    </>
  );
}
