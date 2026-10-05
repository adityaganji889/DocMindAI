import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Brain,
  Lock,
  User,
  ArrowRight,
  Loader2,
  Sparkles,
  Eye,
  EyeOff,
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import ThemeToggle from '../components/ThemeToggle';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [touched, setTouched] = useState({
    username: false,
    password: false,
  });

  const navigate = useNavigate();
  const { login, token } = useAuthStore();

  useEffect(() => {
    if (token) {
      navigate('/', { replace: true });
    }
  }, [token, navigate]);

  const usernameError =
    touched.username && !username.trim()
      ? 'Username is required'
      : '';

  const passwordError =
    touched.password && !password.trim()
      ? 'Password is required'
      : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setTouched({
      username: true,
      password: true,
    });

    if (!username.trim() || !password.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      await login(username.trim(), password);

      toast.success('Welcome back!');
      navigate('/', { replace: true });
    } catch (err: unknown) {
      const errorMsg =
        (err as {
          response?: {
            data?: {
              message?: string;
            };
          };
        })?.response?.data?.message ||
        (err as Error).message ||
        'Invalid username or password';

      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="
        min-h-screen
        flex
        flex-col
        justify-center
        py-12
        px-4
        sm:px-6
        lg:px-8
        relative
        overflow-hidden
        bg-[var(--bg-primary)]
        text-[var(--text-primary)]
        transition-colors
        duration-300
      "
    >
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>


      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="
            absolute
            top-[18%]
            left-1/2
            -translate-x-1/2
            w-[500px]
            h-[500px]
            rounded-full
            bg-[#c7211b]/10
            blur-[140px]
          "
        />

        <div
          className="
            absolute
            bottom-[-150px]
            left-[-100px]
            w-[350px]
            h-[350px]
            rounded-full
            bg-[#991b1b]/5
            blur-[120px]
          "
        />
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="sm:mx-auto sm:w-full sm:max-w-md relative z-10"
      >
        <div className="flex justify-center items-center gap-3 mb-5">

          {/* Logo */}
          <div
            className="
              w-12
              h-12
              rounded-2xl
              flex
              items-center
              justify-center
              bg-gradient-to-br
              from-[#ef4444]
              via-[#c7211b]
              to-[#991b1b]
              shadow-lg
              shadow-[#c7211b]/25
              ring-1
              ring-black/10
            "
          >
            <Brain className="w-7 h-7 text-white" />
          </div>

          {/* Brand */}
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-2xl font-bold tracking-tight">
                DocMind
              </span>

              <span
                className="
                  text-xs
                  font-semibold
                  text-red-500
                  bg-red-500/10
                  border
                  border-red-500/20
                  px-2
                  py-0.5
                  rounded-full
                "
              >
                AI
              </span>
            </div>

            <p className="text-xs text-[var(--text-muted)]">
              Intelligent Document Assistant
            </p>
          </div>
        </div>

        {/* Heading */}
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight">
          Sign in to your account
        </h2>

        <p className="mt-2 text-center text-sm text-[var(--text-muted)]">
          Or{' '}
          <Link
            to="/register"
            className="
              font-medium
              text-red-500
              hover:text-red-400
              transition-colors
              underline
              underline-offset-4
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-red-500
              rounded
            "
          >
            create a new account
          </Link>
        </p>
      </motion.div>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.25,
          delay: 0.05,
        }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10"
      >
        <div
          className="
            bg-[var(--bg-secondary)]
            py-8
            px-6
            sm:px-10
            border
            border-[var(--border-primary)]
            sm:rounded-2xl
            backdrop-blur-xl
            shadow-2xl
            shadow-black/10
            transition-colors
            duration-300
          "
        >
          <form
            className="space-y-5"
            onSubmit={handleSubmit}
            noValidate
          >

            {/* Username */}
            <div>
              <label
                htmlFor="login-username"
                className="
                  block
                  text-xs
                  font-medium
                  text-[var(--text-secondary)]
                  mb-1.5
                "
              >
                Username
              </label>

              <div className="relative rounded-xl shadow-sm">

                <div
                  className="
                    absolute
                    inset-y-0
                    left-0
                    pl-3.5
                    flex
                    items-center
                    pointer-events-none
                    text-[var(--text-muted)]
                  "
                >
                  <User className="h-4 w-4" />
                </div>

                <input
                  id="login-username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onBlur={() =>
                    setTouched((prev) => ({
                      ...prev,
                      username: true,
                    }))
                  }
                  onChange={(e) =>
                    setUsername(e.target.value)
                  }
                  placeholder="Enter your username"
                  className="
                    block
                    w-full
                    pl-10
                    pr-3
                    py-2.5
                    bg-[var(--bg-input)]
                    border
                    border-[var(--border-primary)]
                    rounded-xl
                    text-[var(--text-primary)]
                    placeholder:text-[var(--text-muted)]
                    focus:outline-none
                    focus:border-red-500
                    focus:ring-1
                    focus:ring-red-500
                    text-sm
                    transition-all
                  "
                />
              </div>

              {usernameError && (
                <p className="text-xs text-red-400 mt-1.5 pl-1">
                  {usernameError}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="login-password"
                className="
                  block
                  text-xs
                  font-medium
                  text-[var(--text-secondary)]
                  mb-1.5
                "
              >
                Password
              </label>

              <div className="relative rounded-xl shadow-sm">

                <div
                  className="
                    absolute
                    inset-y-0
                    left-0
                    pl-3.5
                    flex
                    items-center
                    pointer-events-none
                    text-[var(--text-muted)]
                  "
                >
                  <Lock className="h-4 w-4" />
                </div>

                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onBlur={() =>
                    setTouched((prev) => ({
                      ...prev,
                      password: true,
                    }))
                  }
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="••••••••"
                  className="
                    block
                    w-full
                    pl-10
                    pr-10
                    py-2.5
                    bg-[var(--bg-input)]
                    border
                    border-[var(--border-primary)]
                    rounded-xl
                    text-[var(--text-primary)]
                    placeholder:text-[var(--text-muted)]
                    focus:outline-none
                    focus:border-red-500
                    focus:ring-1
                    focus:ring-red-500
                    text-sm
                    transition-all
                  "
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  className="
                    absolute
                    inset-y-0
                    right-0
                    pr-3.5
                    flex
                    items-center
                    text-[var(--text-muted)]
                    hover:text-[var(--text-secondary)]
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-red-500
                    rounded
                    transition-colors
                  "
                  aria-label={
                    showPassword
                      ? 'Hide password'
                      : 'Show password'
                  }
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {passwordError && (
                <p className="text-xs text-red-400 mt-1.5 pl-1">
                  {passwordError}
                </p>
              )}
            </div>

            {/* Submit */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="
                  w-full
                  flex
                  justify-center
                  items-center
                  gap-2
                  py-2.5
                  px-4
                  rounded-xl
                  text-sm
                  font-semibold
                  text-white
                  bg-[#c7211b]
                  hover:bg-[#ef4444]
                  active:scale-[0.98]
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-red-500
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                  shadow-lg
                  shadow-[#c7211b]/20
                  transition-all
                  cursor-pointer
                "
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div
            className="
              mt-6
              pt-5
              border-t
              border-[var(--border-primary)]
            "
          >
            <div
              className="
                flex
                items-center
                justify-center
                gap-2
                text-xs
                text-[var(--text-muted)]
              "
            >
              <Sparkles className="w-3.5 h-3.5 text-red-400" />

              <span>
                RAG Q&A with Semantic Search & Vector Memory
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;