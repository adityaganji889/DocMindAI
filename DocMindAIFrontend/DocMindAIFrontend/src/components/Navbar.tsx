import React, { useState, useRef, useEffect } from 'react';
import {
  Brain,
  MessageSquare,
  Search,
  Layers,
  Upload,
  PanelLeft,
  FileText,
  ChevronRight,
  LogOut,
  Shield,
  ChevronDown,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDocumentStore } from '../store/documentStore';
import { useAuthStore } from '../store/authStore';
import { clsx } from 'clsx';
import ThemeToggle from './ThemeToggle';

interface NavbarProps {
  onUploadClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onUploadClick }) => {
  const {
    activeTab,
    setActiveTab,
    isSidebarOpen,
    setIsSidebarOpen,
    documents,
    selectedDocumentId,
  } = useDocumentStore();

  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const tabs: {
    id: 'chat' | 'search' | 'chunks';
    label: string;
    icon: React.FC<{ className?: string }>;
  }[] = [
    {
      id: 'chat',
      label: 'Chat',
      icon: MessageSquare,
    },
    {
      id: 'search',
      label: 'Search',
      icon: Search,
    },
    {
      id: 'chunks',
      label: 'Chunks',
      icon: Layers,
    },
  ];

  const selectedDoc = documents.find(
    (d) => d.id === selectedDocumentId
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener(
        'mousedown',
        handleClickOutside
      );
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header
      className="
        flex
        items-center
        h-14
        w-full
        min-w-0
        px-2
        sm:px-3
        lg:px-4
        gap-1
        sm:gap-2
        bg-[var(--bg-secondary)]
        border-b
        border-[var(--border-primary)]
        flex-shrink-0
        z-20
        text-[var(--text-primary)]
        transition-colors
        duration-300
      "
    >
      {/* =====================================================
          LEFT: SIDEBAR + LOGO
          ===================================================== */}
      <div
        className="
          flex
          items-center
          gap-1.5
          sm:gap-2.5
          flex-shrink-0
          min-w-0
          lg:w-64
        "
      >
        {/* Sidebar Toggle */}
        <button
          type="button"
          onClick={() =>
            setIsSidebarOpen(!isSidebarOpen)
          }
          className="
            p-1.5
            hover:bg-[var(--bg-input)]
            rounded-lg
            transition-colors
            group
            cursor-pointer
            flex-shrink-0
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-red-500
          "
          title="Toggle sidebar"
          aria-label="Toggle sidebar"
        >
          <PanelLeft
            className={clsx(
              'w-4 h-4 transition-colors',
              isSidebarOpen
                ? 'text-[var(--text-muted)]'
                : 'text-red-400'
            )}
          />
        </button>

        {/* Logo + Brand */}
        <div
          className="
            flex
            items-center
            gap-1.5
            sm:gap-2
            min-w-0
          "
        >
          {/* Logo */}
          <div
            className="
              w-7
              h-7
              bg-gradient-to-br
              from-red-400
              via-[var(--primary)]
              to-red-900
              rounded-lg
              flex
              items-center
              justify-center
              shadow-sm
              shadow-red-500/30
              flex-shrink-0
            "
          >
            <Brain className="w-4 h-4 text-white" />
          </div>

          {/* Brand */}
          <span
            className="
              hidden
              sm:block
              text-sm
              font-bold
              text-[var(--text-primary)]
              tracking-tight
              truncate
            "
          >
            DocMind
          </span>

          {/* AI Badge */}
          <span
            className="
              hidden
              md:block
              text-[10px]
              font-semibold
              text-red-500
              bg-red-500/10
              border
              border-red-500/20
              px-1.5
              py-0.5
              rounded-full
              flex-shrink-0
            "
          >
            AI
          </span>
        </div>
      </div>

      {/* =====================================================
          CENTER: TAB NAVIGATION
          ===================================================== */}
      <nav
        className="
          flex-1
          min-w-0
          flex
          items-center
          justify-center
          overflow-hidden
          mx-1
          sm:mx-2
        "
      >
        <div
          className="
            flex
            items-center
            gap-0.5
            sm:gap-1
            max-w-full
            overflow-x-auto
            scrollbar-none
            bg-[var(--bg-input)]
            border
            border-[var(--border-primary)]
            rounded-xl
            p-1
            transition-colors
            duration-300
          "
        >
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              type="button"
              key={id}
              onClick={() => setActiveTab(id)}
              className={clsx(
                `
                  flex
                  items-center
                  justify-center
                  gap-1
                  sm:gap-1.5
                  px-2.5
                  sm:px-3
                  md:px-4
                  py-1.5
                  rounded-lg
                  text-xs
                  sm:text-sm
                  font-medium
                  whitespace-nowrap
                  transition-all
                  duration-150
                  cursor-pointer
                  flex-shrink-0
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-red-500
                `,
                activeTab === id
                  ? `
                    bg-[var(--primary)]
                    hover:bg-[var(--primary-hover)]
                    text-white
                    shadow-sm
                    shadow-red-500/30
                  `
                  : `
                    text-[var(--text-muted)]
                    hover:text-[var(--text-primary)]
                    hover:bg-red-500/5
                  `
              )}
            >
              <Icon className="w-3.5 h-3.5 flex-shrink-0" />

              <span className="hidden xs:inline sm:inline">
                {label}
              </span>
            </button>
          ))}
        </div>
      </nav>

      {/* =====================================================
          RIGHT: DOCUMENT + UPLOAD + THEME + USER
          ===================================================== */}
      <div
        className="
          flex
          items-center
          justify-end
          gap-1
          sm:gap-2
          flex-shrink-0
          min-w-0
        "
      >
        {/* Selected Document */}
        {selectedDoc && (
          <div
            className="
              hidden
              xl:flex
              items-center
              gap-1.5
              bg-[var(--bg-input)]
              border
              border-[var(--border-primary)]
              px-2.5
              py-1.5
              rounded-lg
              max-w-[150px]
              transition-colors
              duration-300
            "
          >
            <FileText
              className="
                w-3
                h-3
                text-red-400
                flex-shrink-0
              "
            />

            <span
              className="
                text-xs
                text-[var(--text-secondary)]
                truncate
              "
            >
              {selectedDoc.filename}
            </span>

            <ChevronRight
              className="
                w-3
                h-3
                text-[var(--text-muted)]
                flex-shrink-0
              "
            />
          </div>
        )}

        {/* =================================================
            UPLOAD BUTTON
            ================================================= */}
        <button
          type="button"
          onClick={onUploadClick}
          className="
            flex
            items-center
            justify-center
            gap-1.5
            w-8
            h-8
            sm:w-auto
            sm:h-auto
            sm:px-3
            sm:py-1.5
            bg-[var(--primary)]
            hover:bg-[var(--primary-hover)]
            text-white
            text-xs
            sm:text-sm
            font-medium
            rounded-xl
            transition-all
            shadow-sm
            shadow-red-500/25
            hover:shadow-red-500/40
            cursor-pointer
            flex-shrink-0
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-red-500
          "
          title="Upload documents"
          aria-label="Upload documents"
        >
          <Upload className="w-3.5 h-3.5" />

          <span className="hidden sm:block">
            Upload
          </span>
        </button>

        {/* =================================================
            THEME TOGGLE
            ================================================= */}
        <div
          className="
            flex-shrink-0
            flex
            items-center
            justify-center
          "
        >
          <ThemeToggle />
        </div>

        {/* =================================================
            USER DROPDOWN
            ================================================= */}
        <div
          className="
            relative
            flex-shrink-0
          "
          ref={menuRef}
        >
          <button
            type="button"
            onClick={() =>
              setIsMenuOpen(!isMenuOpen)
            }
            className="
              flex
              items-center
              gap-1.5
              p-1
              sm:pl-1.5
              sm:pr-2
              bg-[var(--bg-input)]
              hover:bg-[var(--border-primary)]
              border
              border-[var(--border-primary)]
              rounded-xl
              transition-all
              cursor-pointer
              group
              flex-shrink-0
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-red-500
            "
            aria-expanded={isMenuOpen}
            aria-haspopup="menu"
            title={user?.username || 'User'}
          >
            {/* Avatar */}
            <div
              className="
                w-6
                h-6
                rounded-lg
                bg-gradient-to-br
                from-red-400
                via-[var(--primary)]
                to-red-900
                flex
                items-center
                justify-center
                text-[10px]
                font-bold
                text-white
                shadow-sm
                flex-shrink-0
              "
            >
              {getInitials(user?.username)}
            </div>

            {/* Username */}
            <span
              className="
                text-xs
                text-[var(--text-secondary)]
                font-medium
                max-w-[90px]
                truncate
                hidden
                lg:block
              "
            >
              {user?.username || 'User'}
            </span>

            <ChevronDown
              className={clsx(
                `
                  w-3
                  h-3
                  text-[var(--text-muted)]
                  transition-transform
                  duration-150
                  hidden
                  sm:block
                `,
                isMenuOpen && 'rotate-180'
              )}
            />
          </button>

          {/* =================================================
              USER DROPDOWN
              ================================================= */}
          {isMenuOpen && (
            <div
              className="
                absolute
                right-0
                top-full
                mt-2
                w-56
                max-w-[calc(100vw-1rem)]
                bg-[var(--bg-secondary)]
                border
                border-[var(--border-primary)]
                rounded-2xl
                shadow-xl
                shadow-black/20
                py-2
                z-50
                animate-fade-in
              "
              role="menu"
            >
              {/* User Info */}
              <div
                className="
                  px-4
                  py-2.5
                  border-b
                  border-[var(--border-primary)]
                "
              >
                <div
                  className="
                    flex
                    items-center
                    justify-between
                    mb-1
                    gap-2
                  "
                >
                  <p
                    className="
                      text-xs
                      font-bold
                      text-[var(--text-primary)]
                      truncate
                    "
                  >
                    {user?.username || 'User'}
                  </p>

                  {user?.role && (
                    <span
                      className="
                        text-[9px]
                        uppercase
                        font-bold
                        tracking-wider
                        px-1.5
                        py-0.5
                        rounded
                        bg-red-500/10
                        text-red-500
                        border
                        border-red-500/20
                        flex
                        items-center
                        gap-1
                        flex-shrink-0
                      "
                    >
                      <Shield className="w-2.5 h-2.5" />
                      {user.role}
                    </span>
                  )}
                </div>

                <p
                  className="
                    text-[11px]
                    text-[var(--text-muted)]
                    truncate
                  "
                >
                  {user?.email}
                </p>
              </div>

              {/* Logout */}
              <div className="px-2 pt-1.5">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="
                    w-full
                    flex
                    items-center
                    gap-2
                    px-3
                    py-2
                    text-xs
                    font-medium
                    text-red-500
                    hover:text-red-400
                    hover:bg-red-500/10
                    rounded-xl
                    transition-colors
                    cursor-pointer
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-red-500
                  "
                  role="menuitem"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
