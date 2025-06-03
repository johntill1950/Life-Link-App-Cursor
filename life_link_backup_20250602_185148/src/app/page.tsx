"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { signIn } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { loginUser } from '@/lib/userService';
import { getSupabaseClient } from '@/lib/supabase';

const keyFeatures = [
  "24/7 vital sign monitoring with custom alerts",
  "Emergency response system for critical situations",
  "GPS location tracking during emergencies",
  "Secure on-device-only storage of medical history and medication information",
  "Comprehensive health dashboard with historical data",
  "Immediate and detailed automatic communication via your phone to your emergency contacts you nominate when a potential medical emergency is detected.",
  <>
    See more info at:{" "}
    <a href="https://life-link.app/info/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
      https://life-link.app/info/
    </a>
  </>,
];

export default function LandingPage() {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [agree, setAgree] = useState(false);
  const [email, setEmail] = useState('');
  const [reEmail, setReEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rePassword, setRePassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await loginUser(email, password);
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Login failed:', error);
      setError(error.message || 'Invalid login credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (email !== reEmail) {
      setError('Email addresses do not match.');
      setLoading(false);
      return;
    }
    if (password !== rePassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const supabase = getSupabaseClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (signUpError) throw signUpError;

      if (!data.user) {
        throw new Error('Registration failed - no user data returned');
      }

      // Create profile
      const { error: profileError } = await supabase
        .from('profile')
        .insert({
          id: data.user.id,
          full_name: fullName,
          created_at: new Date().toISOString(),
        });

      if (profileError) throw profileError;

      router.push('/dashboard');
    } catch (error: any) {
      console.error('Registration failed:', error);
      setError(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col items-center py-6 px-2">
      <div className="max-w-md w-full">
        {/* Top Image */}
        <div className="rounded-xl overflow-hidden mb-4">
          <Image
            src="/Life-Link.jpg"
            alt="Life Link Logo"
            width={600}
            height={200}
            className="w-full h-auto"
            priority
          />
        </div>

        {/* Health Guardian Section */}
        <div className="bg-blue-100 rounded-xl p-4 mb-4">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Your Personal Health Guardian</h2>
          <p className="text-gray-700 mb-2">
            The Life-Link.app and Omni-Ring partnership is a revolutionary health monitoring system designed to keep track of vital health metrics in real-time.
          </p>
          <p className="text-gray-700">
            Our app continuously monitors your heart rate, blood oxygen levels, and movement patterns, providing you with real-time feedback and alerts.
          </p>
        </div>

        {/* Key Features Section */}
        <div className="bg-blue-100 rounded-xl p-4 mb-4">
          <button
            className="flex items-center justify-between w-full text-left font-semibold text-blue-700"
            onClick={() => setFeaturesOpen((open) => !open)}
            aria-expanded={featuresOpen}
          >
            <span>Key Features</span>
            <span>{featuresOpen ? "▲" : "▼"}</span>
          </button>
          {featuresOpen && (
            <ul className="mt-2 list-disc list-inside text-gray-700 space-y-1">
              {keyFeatures.map((feature, i) => (
                <li key={i}>{feature}</li>
              ))}
            </ul>
          )}
        </div>

        {/* Login/Register Card */}
        <div className="bg-white rounded-xl p-4 shadow mb-4">
          <h3 className="text-lg font-bold text-gray-900 mb-1">Welcome to Life-Link.app</h3>
          <p className="text-gray-600 mb-4 text-sm">
            Monitor your heart health with our cutting-edge Life-Link.app in partnership with Omni-Ring technology
          </p>
          {/* Tabs */}
          <div className="flex mb-4">
            <button
              className={`flex-1 py-2 rounded-l-lg font-semibold ${tab === "login" ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-700"}`}
              onClick={() => setTab("login")}
            >
              Login
            </button>
            <button
              className={`flex-1 py-2 rounded-r-lg font-semibold ${tab === "register" ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-700"}`}
              onClick={() => setTab("register")}
            >
              Register
            </button>
          </div>

          {/* Forms */}
          {tab === "login" ? (
            <form onSubmit={handleLogin}>
              {error && (
                <div className="bg-red-50 dark:bg-red-900/50 text-red-500 dark:text-red-400 p-3 rounded-lg text-sm mb-4">
                  {error}
                </div>
              )}
              <label className="block text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mb-3 px-3 py-2 border rounded bg-blue-50"
                required
              />
              <div className="flex justify-between items-center mb-1">
                <label className="block text-gray-700">Password</label>
                <Link href="/forgot-password" className="text-blue-600 text-sm underline">Forgot password?</Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mb-4 px-3 py-2 border rounded bg-blue-50"
                required
              />
              <button
                type="submit"
                className="w-full py-2 rounded font-semibold bg-blue-600 text-white"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              {error && (
                <div className="bg-red-50 dark:bg-red-900/50 text-red-500 dark:text-red-400 p-3 rounded-lg text-sm mb-4">
                  {error}
                </div>
              )}
              <label className="block text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full mb-3 px-3 py-2 border rounded bg-blue-50"
                required
              />
              <label className="block text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mb-3 px-3 py-2 border rounded bg-blue-50"
                required
              />
              <label className="block text-gray-700 mb-1">Reenter Email</label>
              <input
                type="email"
                value={reEmail}
                onChange={(e) => setReEmail(e.target.value)}
                className="w-full mb-3 px-3 py-2 border rounded bg-blue-50"
                required
              />
              <label className="block text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mb-3 px-3 py-2 border rounded bg-blue-50"
                required
              />
              <label className="block text-gray-700 mb-1">Reenter Password</label>
              <input
                type="password"
                value={rePassword}
                onChange={(e) => setRePassword(e.target.value)}
                className="w-full mb-4 px-3 py-2 border rounded bg-blue-50"
                required
              />
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="agree"
                  checked={agree}
                  onChange={e => setAgree(e.target.checked)}
                  className="mr-2"
                  required
                />
                <label htmlFor="agree" className="text-gray-700 text-sm">
                  I agree to the{" "}
                  <Link href="/terms" className="text-blue-600 underline" target="_blank">Terms of Service</Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-blue-600 underline" target="_blank">Privacy Policy</Link>
                </label>
              </div>
              <button
                type="submit"
                className={`w-full py-2 rounded font-semibold ${agree ? "bg-blue-600 text-white" : "bg-blue-300 text-white cursor-not-allowed"}`}
                disabled={!agree || loading}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>
          )}
        </div>

        {/* Terms/Privacy Note */}
        <div className="text-xs text-gray-600 text-center px-2">
          By signing up, you agree to our{" "}
          <Link href="/terms" className="text-blue-600 underline" target="_blank">Terms of Service</Link> and{" "}
          <Link href="/privacy" className="text-blue-600 underline" target="_blank">Privacy Policy</Link>. Your health data is encrypted and securely stored.
        </div>
      </div>
    </div>
  );
}
