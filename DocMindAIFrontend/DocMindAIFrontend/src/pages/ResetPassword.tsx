import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Brain,
  Mail,
  Lock,
  KeyRound,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Sparkles,
  Eye,
  EyeOff,
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import ThemeToggle from '../components/ThemeToggle';
import { useAuthStore } from '../store/authStore';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);

  const [touched, setTouched] = useState({
    email: false,
    otp: false,
    password: false,
    confirmPassword: false,
  });

  const { resetPassword } = useAuthStore();

  const emailError =
    touched.email && !email.trim()
      ? 'Email address is required'
      : touched.email &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
      ? 'Please enter a valid email address'
      : '';

  const otpError =
    touched.otp && !otp
      ? 'OTP is required'
      : touched.otp && !/^\d{6}$/.test(otp)
      ? 'OTP must be exactly 6 digits'
      : '';

  const passwordError =
    touched.password && !password
      ? 'Password is required'
      : touched.password && password.length < 8
      ? 'Password must be at least 8 characters'
      : '';

  const confirmPasswordError =
    touched.confirmPassword && !confirmPassword
      ? 'Please confirm your password'
      : touched.confirmPassword &&
        confirmPassword !== password
      ? 'Passwords do not match'
      : '';

  const handleOtpChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value.replace(/\D/g, '');

    if (value.length <= 6) {
      setOtp(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setTouched({
      email: true,
      otp: true,
      password: true,
      confirmPassword: true,
    });

    const isValidEmail =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

    const isValidOtp = /^\d{6}$/.test(otp);

    const isValidPassword = password.length >= 8;

    const isValidConfirmPassword =
      confirmPassword === password;

    if (
      !email.trim() ||
      !isValidEmail ||
      !isValidOtp ||
      !isValidPassword ||
      !isValidConfirmPassword
    ) {
      toast.error('Please fix the errors and try again');
      return;
    }

    setLoading(true);

    try {
      // TODO: Connect this to your backend API.
      //
      // Example:
      //
      // await axios.post('/api/auth/reset-password', {
      //   email: email.trim(),
      //   otp,
      //   password,
      // });

      await resetPassword(Number(otp), email, password, confirmPassword); 

      // await new Promise((resolve) =>
      //   setTimeout(resolve, 1000)
      // );

      toast.success('Password reset successfully');

      navigate('/login', { replace: true });
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
        'Unable to reset password';

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
        className="
          sm:mx-auto
          sm:w-full
          sm:max-w-md
          relative
          z-10
        "
      >
        {/* Logo */}
        <div className="flex justify-center items-center gap-3 mb-5">
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
          Reset your password
        </h2>

        <p className="mt-2 text-center text-sm text-[var(--text-muted)]">
          Enter the OTP sent to your email and create a new
          password.
        </p>
      </motion.div>

      {/* Reset Password Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.25,
          delay: 0.05,
        }}
        className="
          mt-8
          sm:mx-auto
          sm:w-full
          sm:max-w-md
          relative
          z-10
        "
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
            {/* Email */}
            <div>
              <label
                htmlFor="reset-email"
                className="
                  block
                  text-xs
                  font-medium
                  text-[var(--text-secondary)]
                  mb-1.5
                "
              >
                Email address
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
                  id="reset-email"
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
                  placeholder="Enter your email address"
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

            {/* OTP */}
            <div>
              <label
                htmlFor="reset-otp"
                className="
                  block
                  text-xs
                  font-medium
                  text-[var(--text-secondary)]
                  mb-1.5
                "
              >
                6-digit OTP
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
                  <KeyRound className="h-4 w-4" />
                </div>

                <input
                  id="reset-otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={otp}
                  onBlur={() =>
                    setTouched((prev) => ({
                      ...prev,
                      otp: true,
                    }))
                  }
                  onChange={handleOtpChange}
                  placeholder="Enter 6-digit OTP"
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
                    tracking-[0.35em]
                    transition-all
                  "
                />
              </div>

              {otpError && (
                <p className="text-xs text-red-400 mt-1.5 pl-1">
                  {otpError}
                </p>
              )}
            </div>

            {/* New Password */}
            <div>
              <label
                htmlFor="reset-password"
                className="
                  block
                  text-xs
                  font-medium
                  text-[var(--text-secondary)]
                  mb-1.5
                "
              >
                New password
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
                  id="reset-password"
                  type={
                    showPassword ? 'text' : 'password'
                  }
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
                  placeholder="Enter new password"
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

              {!passwordError && password.length > 0 && (
                <p className="text-[11px] text-[var(--text-muted)] mt-1.5 pl-1">
                  Password must contain at least 8 characters.
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="reset-confirm-password"
                className="
                  block
                  text-xs
                  font-medium
                  text-[var(--text-secondary)]
                  mb-1.5
                "
              >
                Confirm password
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
                  id="reset-confirm-password"
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
                  placeholder="Confirm new password"
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
                    transition-colors
                  "
                  aria-label={
                    showConfirmPassword
                      ? 'Hide confirm password'
                      : 'Show confirm password'
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
            <div className="pt-1">
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
                    Resetting password…
                  </>
                ) : (
                  <>
                    Reset password
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Back to Login */}
          <div
            className="
              mt-6
              pt-5
              border-t
              border-[var(--border-primary)]
            "
          >
            <Link
              to="/login"
              className="
                flex
                items-center
                justify-center
                gap-2
                text-sm
                font-medium
                text-[var(--text-secondary)]
                hover:text-red-500
                transition-colors
              "
            >
              <ArrowLeft className="w-4 h-4" />
              Back to sign in
            </Link>
          </div>

          {/* Footer */}
          <div className="mt-5">
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

export default ResetPassword;