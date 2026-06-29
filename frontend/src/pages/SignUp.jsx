import React, { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  Eye, EyeOff, Mail, Lock, User, Hash,
  AlertCircle, CheckCircle, ArrowRight,
  Shield, Leaf, Binoculars,
} from "lucide-react";
import heroImage from "../assets/image.png";
import logo from "../assets/logo.png";
import api from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";

/* ─────────────────────────────────────────────
   Reusable field component
───────────────────────────────────────────── */
const Field = ({ label, htmlFor, icon: Icon, error, children }) => (
  <div>
    <label
      htmlFor={htmlFor}
      className="mb-2 block text-[10px] font-bold uppercase tracking-[0.28em] text-white/40"
    >
      {label}
    </label>
    <div className="relative">
      <Icon
        size={14}
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lime-300/50"
      />
      {children}
    </div>
    {error && (
      <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-red-400">
        <AlertCircle size={10} className="shrink-0" />
        {error}
      </p>
    )}
  </div>
);

/* ─────────────────────────────────────────────
   Left panel — hero + branding content
───────────────────────────────────────────── */
const LeftPanel = () => {
  const perks = [
    { icon: Leaf, text: "Book guided jungle & night safaris" },
    { icon: Shield, text: "Secure member-only reservations" },
    { icon: Binoculars, text: "Exclusive wildlife sighting reports" },
  ];

  return (
    <div
      className="relative hidden lg:flex lg:flex-col lg:w-[52%] xl:w-[55%] min-h-screen overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(9,12,10,0.82) 0%, rgba(9,12,10,0.55) 60%, rgba(9,12,10,0.82) 100%), url(${heroImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Radial lime glows */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 20% 30%, rgba(122,160,40,0.32), transparent 40%), radial-gradient(circle at 80% 70%, rgba(147,210,82,0.14), transparent 38%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full px-10 xl:px-14 py-10">
        {/* Logo */}
        <Link to="/" className="inline-block mb-auto">
          <img
            src={logo}
            alt="Abhayrnya Wildlife Sanctuary"
            className="h-14 w-auto object-contain drop-shadow-[0_0_16px_rgba(163,230,53,0.4)]"
          />
        </Link>

        {/* Centre content */}
        <div className="my-auto py-12">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.38em] text-lime-300/80">
            Wildlife Sanctuary · Member Portal
          </p>

          <h1 className="text-5xl xl:text-6xl font-black uppercase leading-[0.88] tracking-tighter text-white">
            Join the<br />
            <span className="text-lime-300">Sanctuary</span><br />
            Community
          </h1>

          <p className="mt-6 max-w-sm text-sm leading-7 text-white/60">
            Create your account and unlock exclusive access to curated safaris,
            conservation programs, and expert-led wildlife experiences across
            Abhayrnya's protected reserves.
          </p>

          {/* Perks list */}
          <ul className="mt-8 space-y-4">
            {perks.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-lime-400/30 bg-lime-400/10">
                  <Icon size={14} className="text-lime-300" />
                </span>
                <span className="text-sm text-white/65">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom note */}
        <p className="text-xs text-white/25">
          © {new Date().getFullYear()} Abhayrnya Wildlife Sanctuary
        </p>
      </div>

      {/* Vertical lime accent line */}
      <div className="absolute right-0 top-0 h-full w-px bg-linear-to-b from-transparent via-lime-400/30 to-transparent" />
    </div>
  );
};

/* ─────────────────────────────────────────────
   Main page component
───────────────────────────────────────────── */
const SignUp = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Already authenticated — send straight to dashboard
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setServerError("");
    setIsLoading(true);
    try {
      const payload = { ...data, age: Number(data.age) };
      await api.post("/auth/register", payload);
      setSuccess(true);
      setTimeout(() => navigate("/signin"), 2200);
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors && Array.isArray(data.errors)) {
        setServerError(data.errors.map((e) => e.message).join(" · "));
      } else {
        setServerError(data?.message || "Registration failed.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const inputCls = (hasError) =>
    `w-full border bg-white/[0.04] py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:bg-white/[0.07] ${
      hasError
        ? "border-red-500/40 focus:border-red-500/60"
        : "border-white/10 focus:border-lime-400/50"
    }`;

  return (
    <div className="flex min-h-screen w-full bg-[#050705]">

      {/* ── LEFT: Hero / branding panel ── */}
      <LeftPanel />

      {/* ── RIGHT: Form panel ── */}
      <div className="flex flex-1 flex-col min-h-screen overflow-y-auto">

        {/* Mobile logo (only shows on small screens) */}
        <header className="flex items-center justify-between px-6 py-5 lg:hidden border-b border-white/8">
          <Link to="/">
            <img
              src={logo}
              alt="Abhayrnya Wildlife Sanctuary"
              className="h-11 w-auto object-contain drop-shadow-[0_0_12px_rgba(163,230,53,0.35)]"
            />
          </Link>
          <Link
            to="/signin"
            className="text-xs font-semibold uppercase tracking-[0.22em] text-white/50 transition hover:text-white"
          >
            Sign In
          </Link>
        </header>

        {/* Form area — centred vertically */}
        <div className="flex flex-1 items-center justify-center px-6 py-10 sm:px-10">
          <div className="w-full max-w-105">

            {/* Heading */}
            <div className="mb-8">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.38em] text-lime-300/70">
                Member Portal
              </p>
              <h2 className="text-3xl font-black uppercase tracking-tighter text-white">
                Create Account
              </h2>
              <p className="mt-2 text-sm text-white/40">
                Already a member?{" "}
                <Link
                  to="/signin"
                  className="font-semibold text-lime-400 transition hover:text-lime-300"
                >
                  Sign in
                </Link>
              </p>
            </div>

            {/* Lime accent line */}
            <div className="mb-8 h-0.5 w-12 bg-linear-to-r from-lime-400 to-lime-300/30" />

            {/* Success banner */}
            {success && (
              <div className="mb-6 flex items-start gap-3 border border-lime-400/25 bg-lime-400/8 px-4 py-3">
                <CheckCircle size={14} className="mt-0.5 shrink-0 text-lime-400" />
                <p className="text-sm text-lime-300">
                  Account created! Redirecting to sign in…
                </p>
              </div>
            )}

            {/* Server error */}
            {serverError && (
              <div className="mb-6 flex items-start gap-3 border border-red-500/25 bg-red-500/8 px-4 py-3">
                <AlertCircle size={14} className="mt-0.5 shrink-0 text-red-400" />
                <p className="text-sm text-red-300">{serverError}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">

              {/* First + Last name row */}
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="First Name"
                  htmlFor="first_name"
                  icon={User}
                  error={errors.first_name?.message}
                >
                  <input
                    id="first_name"
                    type="text"
                    autoComplete="given-name"
                    placeholder="John"
                    className={inputCls(!!errors.first_name)}
                    {...register("first_name", { required: "Required." })}
                  />
                </Field>

                <Field
                  label="Last Name"
                  htmlFor="last_name"
                  icon={User}
                  error={errors.last_name?.message}
                >
                  <input
                    id="last_name"
                    type="text"
                    autoComplete="family-name"
                    placeholder="Doe"
                    className={inputCls(!!errors.last_name)}
                    {...register("last_name", { required: "Required." })}
                  />
                </Field>
              </div>

              {/* Email */}
              <Field
                label="Email Address"
                htmlFor="reg-email"
                icon={Mail}
                error={errors.email?.message}
              >
                <input
                  id="reg-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className={inputCls(!!errors.email)}
                  {...register("email", {
                    required: "Email is required.",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Enter a valid email address.",
                    },
                  })}
                />
              </Field>

              {/* Age */}
              <Field
                label="Age"
                htmlFor="age"
                icon={Hash}
                error={errors.age?.message}
              >
                <input
                  id="age"
                  type="number"
                  placeholder="25"
                  min={1}
                  max={120}
                  className={inputCls(!!errors.age)}
                  {...register("age", {
                    required: "Age is required.",
                    min: { value: 1, message: "Must be at least 1." },
                    max: { value: 120, message: "Must be 120 or below." },
                    validate: (v) =>
                      Number.isInteger(Number(v)) || "Must be a whole number.",
                  })}
                />
              </Field>

              {/* Password */}
              <Field
                label="Password"
                htmlFor="reg-password"
                icon={Lock}
                error={errors.password?.message}
              >
                <input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Min. 8 characters"
                  className={`${inputCls(!!errors.password)} pr-12`}
                  {...register("password", {
                    required: "Password is required.",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters.",
                    },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 transition hover:text-lime-300/70"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </Field>

              {/* Submit */}
              <button
                type="submit"
                id="signup-submit-btn"
                disabled={isLoading || success}
                className="group mt-2 flex w-full items-center justify-center gap-3 bg-lime-400 px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.28em] text-black transition-all duration-200 hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Creating account…
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <p className="mt-8 text-center text-xs text-white/20">
              <Link to="/" className="transition hover:text-white/45">
                ← Back to home
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
