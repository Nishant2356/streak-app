"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Flame, Upload } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation
    if (!name.trim()) {
      setError("Name is required");
      setLoading(false);
      return;
    }

    if (!username.trim()) {
      setError("Username is required");
      setLoading(false);
      return;
    }

    if (username.length < 3) {
      setError("Username must be at least 3 characters long");
      setLoading(false);
      return;
    }

    if (!email.trim()) {
      setError("Email is required");
      setLoading(false);
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      let imageUrl: string | null = null;

      // Upload image to Cloudinary if selected
      if (image) {
        try {
          const base64 = await convertToBase64(image);
          
          const uploadRes = await fetch("/api/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: base64 }),
          });

          if (uploadRes.ok) {
            const uploadData = await uploadRes.json();
            imageUrl = uploadData.url;
          } else {
            // If Cloudinary upload fails, continue without image
            console.warn("Image upload failed, continuing without image");
          }
        } catch (uploadErr) {
          // If Cloudinary is not configured or fails, continue without image
          console.warn("Image upload error:", uploadErr);
        }
      }

      // Call your Next.js API route
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: name.trim(), 
          username: username.trim(), 
          email: email.trim().toLowerCase(), 
          password, 
          image: imageUrl 
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || data.details || "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      // Success → redirect to login with success message
      router.push("/auth/login?registered=true");
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message || "Network error. Please check your connection and try again.");
      setLoading(false);
    }
  }

  const convertToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
    });

  return (
    // <main className="px-4 sm:px-6 py-10">

    <main className="flex min-h-screen items-center justify-center px-4 sm:px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="w-full max-w-md bg-zinc-900/80 p-8 rounded-2xl border border-zinc-800 shadow-xl shadow-orange-500/10"
      >
        <div className="flex flex-col items-center mb-6">
          <Flame className="text-orange-500 w-10 h-10 mb-2" />
          <h1 className="text-3xl font-bold">Create Account</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Start your journey with Arise today 💪
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-zinc-800 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Ankit Pandey"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1">Username</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-zinc-800 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="ankit_123"
            />
          </div>

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

          <div>
            <label className="block text-sm text-zinc-400 mb-1">Profile Photo (optional)</label>
            <label className="flex items-center justify-center gap-2 w-full bg-zinc-800 px-4 py-2 rounded-md cursor-pointer hover:bg-zinc-700 transition">
              <Upload className="w-4 h-4 text-orange-500" />
              <span className="text-zinc-300">{image ? image.name : "Choose image"}</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)}
                className="hidden"
              />
            </label>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-md transition-all"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="text-sm text-center text-zinc-400 mt-5">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-orange-400 hover:underline">
            Login
          </Link>
        </p>
      </motion.div>
    </main>
  );
}
