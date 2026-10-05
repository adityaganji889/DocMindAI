import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Brain,
  Lock,
  Mail,
  User,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import ThemeToggle from '../components/ThemeToggle';

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [touched, setTouched] = useState({
    username: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const navigate = useNavigate();
  const { register, login, token } = useAuthStore();

  useEffect(() => {
    if (token) {
      navigate('/', { replace: true });
    }
  }, [token, navigate]);

  const usernameError =
    touched.username && !username.trim()
      ? 'Username is required'
      : '';

  const emailError =
    touched.email && !email.trim()
      ? 'Email is required'
      : touched.email &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      ? 'Please enter a valid email address'
      : '';

  const passwordError =
    touched.password && !password.trim()
      ? 'Password is required'
      : touched.password && password.length < 6
      ? 'Password must be at least 6 characters'
      : '';

  const confirmPasswordError =
    touched.confirmPassword &&
    password !== confirmPassword
      ? 'Passwords do not match'
      : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setTouched({
      username: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    if (
      !username.trim() ||
      !email.trim() ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      await register(
        username.trim(),
        email.trim(),
        password
      );

      toast.success(
        'Account created successfully! Logging you in…'
      );

      await login(username.trim(), password);

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
        'Registration failed. Please try again.';

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
            top-[15%]
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
            right-[-100px]
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
              Create your account
            </p>
          </div>
        </div>

        {/* Heading */}
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight">
          Join DocMind
        </h2>

        <p className="mt-2 text-center text-sm text-[var(--text-muted)]">
          Already have an account?{' '}
          <Link
            to="/login"
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
            Sign in
          </Link>
        </p>
      </motion.div>

      {/* Register Card */}
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
            className="space-y-4"
            onSubmit={handleSubmit}
            noValidate
          >

            {/* Username */}
            <div>
              <label
                htmlFor="reg-username"
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
                  id="reg-username"
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
                  placeholder="Choose a username"
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

            {/* Email */}
            <div>
              <label
                htmlFor="reg-email"
                className="
                  block
                  text-xs
                  font-medium
                  text-[var(--text-secondary)]
                  mb-1.5
                "
              >
                Email Address
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
                  <Mail className="h-4 w-4" />
                </div>

                <input
                  id="reg-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onBlur={() =>
                    setTouched((prev) => ({
                      ...prev,
                      email: true,
                    }))
                  }
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="you@example.com"
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

              {emailError && (
                <p className="text-xs text-red-400 mt-1.5 pl-1">
                  {emailError}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="reg-password"
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
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
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
                  placeholder="At least 6 characters"
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

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="reg-confirm"
                className="
                  block
                  text-xs
                  font-medium
                  text-[var(--text-secondary)]
                  mb-1.5
                "
              >
                Confirm Password
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
                  <CheckCircle2 className="h-4 w-4" />
                </div>

                <input
                  id="reg-confirm"
                  type={
                    showConfirmPassword
                      ? 'text'
                      : 'password'
                  }
                  autoComplete="new-password"
                  value={confirmPassword}
                  onBlur={() =>
                    setTouched((prev) => ({
                      ...prev,
                      confirmPassword: true,
                    }))
                  }
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                  placeholder="Re-enter password"
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
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
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
                  "
                  aria-label={
                    showConfirmPassword
                      ? 'Hide password confirmation'
                      : 'Show password confirmation'
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {confirmPasswordError && (
                <p className="text-xs text-red-400 mt-1.5 pl-1">
                  {confirmPasswordError}
                </p>
              )}
            </div>

            {/* Submit */}
            <div className="pt-2">
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
                    Creating account…
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
