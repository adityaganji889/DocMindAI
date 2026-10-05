import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle: React.FC = () => {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return true;

    return (
      document.documentElement.classList.contains('dark') ||
      !document.documentElement.classList.contains('light')
    );
  });

  useEffect(() => {
    const root = document.documentElement;

    if (isDark) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }

    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  return (
    <button
      type="button"
      onClick={() => setIsDark((prev) => !prev)}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="
        relative
        flex
        h-9
        w-9
        flex-shrink-0
        items-center
        justify-center
        rounded-xl
        border
        border-[var(--border-primary)]
        bg-[var(--bg-input)]
        text-[var(--text-secondary)]
        transition-all
        duration-200
        hover:bg-[var(--border-primary)]
        hover:text-[var(--text-primary)]
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-red-500
        cursor-pointer
      "
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-yellow-400" />
      ) : (
        <Moon className="h-4 w-4 text-indigo-500" />
      )}
    </button>
  );
};

export default ThemeToggle;
