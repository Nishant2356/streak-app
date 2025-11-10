"use client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Flame, Trophy, Clock, Target } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // ✅ Check if user logged in, else redirect
  const handleStart = () => {
    if (status === "loading") return;
    if (session?.user) router.push("/dashboard");
    else router.push("/auth/register");
  };

  return (
<div
  className="min-h-screen text-white flex flex-col items-center relative overflow-hidden"
  style={{
    backgroundImage: "url('/bg-shape.svg')",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    backgroundPosition: "center",
  }}
>
  {/* <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/80 via-zinc-900/70 to-black/90" /> */}
  
      {/* ========== HERO SECTION ========== */}
      <section className="flex flex-col items-center justify-center text-center py-20 max-w-2xl">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl font-extrabold tracking-tight mb-4"
        >
          Fight for Today,{" "}
          <span className="text-orange-500">Keep Your Streak Alive</span>
        </motion.h2>

        <p className="text-zinc-400 text-lg mb-8">
          Build unstoppable consistency with daily challenges. Compete with
          friends, complete your goals before midnight, and stay on fire 🔥.
        </p>

        <motion.div whileHover={{ scale: 1.05 }}>
          <Button
            onClick={handleStart}
            className="bg-orange-500 hover:bg-orange-600 text-lg px-8 py-6 rounded-xl"
          >
            Get Started
          </Button>
        </motion.div>
      </section>

      {/* ========== FEATURES SECTION ========== */}
      <section id="features" className="py-16 px-8 max-w-5xl w-full">
        <h3 className="text-3xl font-semibold text-center mb-12">
          🔥 Why You’ll Love It
        </h3>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <Clock className="text-orange-500" />,
              title: "Daily Timer",
              desc: "Beat the clock. Complete all tasks before midnight to keep your streak.",
            },
            {
              icon: <Trophy className="text-yellow-400" />,
              title: "Achievements",
              desc: "Earn badges and track your total completions over time.",
            },
            {
              icon: <Target className="text-green-400" />,
              title: "Team Battle Mode",
              desc: "Challenge your friends — who will stay consistent the longest?",
            },
          ].map((f, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              className="bg-zinc-900/70 p-6 rounded-2xl border border-zinc-800 hover:border-orange-500 transition-all"
            >
              <div className="mb-3 text-3xl">{f.icon}</div>
              <h4 className="text-xl font-semibold mb-2">{f.title}</h4>
              <p className="text-zinc-400 text-sm">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ========== PREVIEW SECTION (placeholder) ========== */}
      <section id="preview" className="py-20 px-8 w-full flex flex-col items-center">
        <h3 className="text-3xl font-semibold mb-8">⚡ App Preview</h3>
        <div className="relative w-[90%] max-w-4xl rounded-2xl overflow-hidden border border-zinc-800 shadow-lg shadow-orange-500/10 bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 h-[400px] flex items-center justify-center">
          <p className="text-zinc-400 text-lg">Preview coming soon...</p>
        </div>
      </section>

      {/* ========== JOIN SECTION ========== */}
      <section id="join" className="py-20 text-center">
        <h3 className="text-3xl font-semibold mb-4">
          Ready to Build Your Streak?
        </h3>
        <p className="text-zinc-400 mb-8">
          Start now — create your daily tasks, challenge your friends, and grow
          stronger every day.
        </p>
        <Button
          onClick={handleStart}
          className="bg-orange-500 hover:bg-orange-600 text-lg px-10 py-6 rounded-xl"
        >
          Join the Battle 💪
        </Button>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="border-t border-zinc-800 py-8 text-zinc-500 text-sm w-full text-center">
        Made by <span className="text-orange-400">Nishant</span> &{" "}
        <span className="text-orange-400">Ankit</span> — Keep the streak
        alive 🔥
      </footer>
    </div>
  );
}
