import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Mail, Lock, AlertCircle, ArrowRight } from "lucide-react";
import heroImage from "../assets/image.png";
import logo from "../assets/logo.png";
import api from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";

const SignIn = () => {
  const navigate = useNavigate();
  const { loginUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setServerError("");
    setIsLoading(true);
    try {
      const res = await api.post("/auth/login", data);
      loginUser(res.data.user);
      navigate("/dashboard");
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed. Please try again.";
      setServerError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    /* ── Full-page hero background (same as Home) ── */
    <div
      className="min-h-screen w-full flex flex-col"
      style={{
        backgroundImage: `linear-gradient(90deg, rgba(9,12,10,0.92) 0%, rgba(9,12,10,0.70) 48%, rgba(9,12,10,0.92) 100%), url(${heroImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Radial lime glows (matches HeroBackground) */}
      <div className="flex flex-1 flex-col"
        style={{
          background:
            "radial-gradient(circle at top left, rgba(122,160,40,0.28), transparent 28%), radial-gradient(circle at center, rgba(147,210,82,0.12), transparent 35%)",
        }}
      >
        {/* ── Navbar strip ── */}
        <header className="px-6 py-4 md:px-10 xl:px-16">
          <Link to="/">
            <img
              src={logo}
              alt="Abhayrnya Wildlife Sanctuary"
              className="h-14 w-auto object-contain drop-shadow-[0_0_14px_rgba(163,230,53,0.35)]"
            />
          </Link>
        </header>

        {/* ── Centred form area ── */}
        <div className="flex flex-1 items-center justify-center px-4 pb-12">
          <div className="w-full max-w-md">

            {/* Eyebrow label */}
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-lime-300/80">
              Wildlife Sanctuary · Member Portal
            </p>

            {/* Heading */}
            <h1 className="mb-8 text-4xl font-black uppercase leading-tight tracking-tighter text-white md:text-5xl">
              Sign
              <span className="text-lime-300"> In</span>
            </h1>

            {/* ── Card ── */}
            <div
              className="overflow-hidden border border-white/10"
              style={{
                background: "rgba(9,12,10,0.72)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
              }}
            >
              {/* Lime accent top bar */}
              <div className="h-0.75 w-full bg-linear-to-r from-lime-400 via-lime-300/70 to-transparent" />

              <div className="p-8">
                {/* Server error */}
                {serverError && (
                  <div className="mb-6 flex items-start gap-3 border border-red-500/25 bg-red-500/10 px-4 py-3">
                    <AlertCircle size={15} className="mt-0.5 shrink-0 text-red-400" />
                    <p className="text-sm text-red-300">{serverError}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-[10px] font-bold uppercase tracking-[0.28em] text-white/40"
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail
                        size={15}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lime-300/50"
                      />
                      <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        className={`w-full border bg-white/4 py-3.5 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:bg-white/[0.07] ${
                          errors.email
                            ? "border-red-500/40 focus:border-red-500/60"
                            : "border-white/10 focus:border-lime-400/50"
                        }`}
                        {...register("email", {
                          required: "Email is required.",
                          pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: "Enter a valid email address.",
                          },
                        })}
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1.5 text-[11px] text-red-400">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label
                      htmlFor="password"
                      className="mb-2 block text-[10px] font-bold uppercase tracking-[0.28em] text-white/40"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <Lock
                        size={15}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lime-300/50"
                      />
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="••••••••"
                        className={`w-full border bg-white/4 py-3.5 pl-11 pr-12 text-sm text-white outline-none transition placeholder:text-white/20 focus:bg-white/[0.07] ${
                          errors.password
                            ? "border-red-500/40 focus:border-red-500/60"
                            : "border-white/10 focus:border-lime-400/50"
                        }`}
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
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1.5 text-[11px] text-red-400">
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    id="signin-submit-btn"
                    disabled={isLoading}
                    className="group mt-1 flex w-full items-center justify-center gap-3 border border-lime-400/80 px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.28em] text-white transition-all duration-200 hover:bg-lime-400 hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Signing in…
                      </>
                    ) : (
                      <>
                        Sign In
                        <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="my-7 flex items-center gap-4">
                  <div className="h-px flex-1 bg-white/8" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/25">
                    New here?
                  </span>
                  <div className="h-px flex-1 bg-white/8" />
                </div>

                {/* Register link */}
                <Link
                  to="/signup"
                  id="goto-signup-btn"
                  className="flex w-full items-center justify-center gap-3 bg-lime-400 px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.28em] text-black transition-all duration-200 hover:bg-lime-300"
                >
                  Create an Account
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>

            {/* Back link */}
            <p className="mt-6 text-center text-xs text-white/25">
              <Link to="/" className="transition hover:text-white/50">
                ← Back to home
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
