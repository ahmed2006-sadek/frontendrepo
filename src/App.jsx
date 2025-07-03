import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import "./styles/theme.css"
import "./App.css";
import Dashboard from "./pages/Dashboard";
import UsersList from "./pages/Users/UsersList";
import Inventory from "./pages/Inventory/Inventory";
import Leads from "./pages/Leads/LeadsList";
import Navbar from "./components/SideBar";
import LogIn from "./pages/Login";
import Projects from "./pages/Projects/Projects";

function AppContent() {
  // Check if user session is valid (not expired)
  const checkSessionValidity = () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      if (!userData) return false;
      
      // Check if session has expiration time and if it's expired
      if (userData.expirationTime && new Date().getTime() > userData.expirationTime) {
        // Session expired, clear storage
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        return false;
      }
      
      return true;
    } catch {
      return false;
    }
  };

  // 1. جلب بيانات المستخدم من localStorage عند أول تحميل
  const [isLoggedIn, setIsLoggedIn] = useState(() => checkSessionValidity());
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      if (userData && checkSessionValidity()) {
        return userData;
      }
      return null;
    } catch {
      return null;
    }
  });
  const location = useLocation();

  const role = currentUser?.role ? currentUser.role.toLowerCase() : "";
  const canAccess = {
    dashboard: true,
    users: role === "admin",
    inventory: ["admin", "sales_admin", "team_leader", "sales_rep"].includes(role), // admin included
    leads: ["admin", "sales_admin", "team_leader", "sales_rep"].includes(role),
    projects: ["admin", "sales_admin"].includes(role),
  };

  const getDefaultRoute = () => "/dashboard";

  useEffect(() => {
    if (currentUser && checkSessionValidity()) {
      localStorage.setItem('user', JSON.stringify(currentUser));
      setIsLoggedIn(true);
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setIsLoggedIn(false);
      setCurrentUser(null);
    }
  }, [currentUser]);

  // Check session validity periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (!checkSessionValidity() && isLoggedIn) {
        setIsLoggedIn(false);
        setCurrentUser(null);
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [isLoggedIn]);

  return (
    <>
      <AnimatePresence mode="wait">
      {isLoggedIn && location.pathname !== "/" && (
      <Navbar setIsLoggedIn={setIsLoggedIn} currentUser={currentUser} />
      )}
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={
              isLoggedIn
              ? <Navigate to={getDefaultRoute()} replace />
              : <LogIn setIsLoggedIn={setIsLoggedIn} setCurrentUser={setCurrentUser} />
            }
          />

          <Route path="/dashboard" 
          element={
            isLoggedIn && canAccess.dashboard
              ? <Dashboard currentUser={currentUser} />
              : <Navigate to="/" replace />
          } 
          />

          <Route path="/users" 
          element={
            isLoggedIn && canAccess.users
              ? <UsersList currentUser={currentUser} />
              : <Navigate to="/dashboard" replace />
          } 
          />
              

          <Route path="/inventory" 
          element={
            isLoggedIn && canAccess.inventory
              ? <Inventory currentUser={currentUser} />
              : <Navigate to="/dashboard" replace />
          } 
          />

          <Route path="/leads" 
          element={
            isLoggedIn && canAccess.leads
              ? <Leads currentUser={currentUser} />
              : <Navigate to="/dashboard" replace />
          } 
          />

          <Route path="/projects" 
          element={
            isLoggedIn && canAccess.projects
              ? <Projects />
              : <Navigate to="/dashboard" replace />
          }
          />
        </Routes>
      </AnimatePresence>
    </>
  );
}

export default function App() {
  return (<div mode="wait"><AppContent /></div>);
}