import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Brain,
  Mail,
  ArrowRight,
  Loader2,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import ThemeToggle from '../components/ThemeToggle';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState(false);

  const emailError =
    touched && !email.trim()
      ? 'Email address is required'
      : touched &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
      ? 'Please enter a valid email address'
      : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setTouched(true);

    if (
      !email.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      // TODO: Connect this to your forgot-password API
      //
      // Example:
      // await axios.post('/api/auth/forgot-password', {
      //   email: email.trim(),
      // });

      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success('Password reset link sent to your email');
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
        'Unable to send password reset link';

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
          Forgot your password?
        </h2>

        <p className="mt-2 text-center text-sm text-[var(--text-muted)]">
          Enter your email address and we'll send you a link to
          reset your password.
        </p>
      </motion.div>

      {/* Forgot Password Card */}
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
            {/* Email */}
            <div>
              <label
                htmlFor="forgot-password-email"
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
                  id="forgot-password-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onBlur={() => setTouched(true)}
                  onChange={(e) => setEmail(e.target.value)}
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
                    Sending link…
                  </>
                ) : (
                  <>
                    Send reset link
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

export default ForgotPassword;
