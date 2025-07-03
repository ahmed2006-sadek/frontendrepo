import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = () => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <div className={`theme-toggle-slider ${isDark ? 'slide-right' : 'slide-left'}`}>
        {isDark ? <Moon size={12} /> : <Sun size={12} />}
      </div>
    </button>
  );
};

export default ThemeToggle;

