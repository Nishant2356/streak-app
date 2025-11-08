"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { Flame } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid email or password");
        setLoading(false);
        return;
      }

      // ✅ If login successful, redirect to homepage
      router.push("/home");
    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-zinc-950 via-zinc-900 to-black text-white px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="w-full max-w-md bg-zinc-900/80 p-8 rounded-2xl border border-zinc-800 shadow-xl shadow-orange-500/10"
      >
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <Flame className="text-orange-500 w-10 h-10 mb-2" />
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="text-zinc-400 text-sm mt-1">Keep your streak alive 🔥</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-800 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-800 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="••••••••"
            />
          </div>

          {/* Error message */}
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 text-sm text-center"
            >
              {error}
            </motion.p>
          )}

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-md transition-all ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-sm text-center text-zinc-400 mt-5">
          Don&apos;t have an account?{" "}
          <Link href="/auth/register" className="text-orange-400 hover:underline">
            Sign up
          </Link>
        </p>
      </motion.div>
    </main>
  );
}
