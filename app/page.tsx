"use client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Flame, Trophy, Clock, Target, ClipboardList, Star } from "lucide-react";
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
      {/* ========== APP SHOWCASE SECTION ========== */}
      <section
        id="preview"
        className="py-28 px-8 w-full flex flex-col items-center relative"
      >
        <h3 className="text-4xl font-bold mb-10 text-center">
          ⚡ See What Awaits You
        </h3>

        {/* Background glow for cinematic depth */}
        <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-orange-500/10 blur-[200px] rounded-full -z-10" />

        {/* App frame */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="relative w-[90%] max-w-5xl rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl shadow-orange-500/20 bg-gradient-to-br from-zinc-900/80 via-zinc-800/70 to-zinc-900/60 backdrop-blur-xl"
        >
          {/* Mock app header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/40">
            <h4 className="font-semibold text-lg text-orange-400">Your Dashboard</h4>
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-green-500/70" />
            </div>
          </div>

          {/* Inner content — all features merged here */}
          <div className="grid md:grid-cols-3 gap-8 p-10">
            {[
              {
                icon: <ClipboardList className="text-pink-400 w-8 h-8" />,
                title: "Assign Tasks ✅",
                text: "Plan your day with clarity — set, track, and crush your goals.",
              },
              {
                icon: <Clock className="text-blue-400 w-8 h-8" />,
                title: "Daily Timer ⏳",
                text: "Beat the clock and complete all your goals before midnight.",
              },
              {
                icon: <Flame className="text-orange-500 w-8 h-8" />,
                title: "Keep the Streak 🔥",
                text: "Every day counts. Build your habit muscle and never miss a day.",
              },
              {
                icon: <Trophy className="text-yellow-400 w-8 h-8" />,
                title: "Achievements 🏆",
                text: "Earn XP, unlock badges, and showcase your consistency.",
              },
              {
                icon: <Target className="text-green-400 w-8 h-8" />,
                title: "Leaderboard 🥇",
                text: "Climb ranks as you maintain your streak and compete globally.",
              },
              {
                icon: <Star className="text-purple-400 w-8 h-8" />,
                title: "Performance Insights 📊",
                text: "Track your XP, streak length, and performance trends easily.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="bg-zinc-900/60 p-6 rounded-2xl border border-zinc-800 hover:border-orange-500/60 hover:shadow-lg hover:shadow-orange-500/10 transition-all"
              >
                <div className="mb-3">{item.icon}</div>
                <h5 className="font-semibold text-xl mb-2">{item.title}</h5>
                <p className="text-zinc-400 text-sm leading-relaxed">{item.text}</p>
              </motion.div>
            ))}
          </div>

          {/* Mock bottom bar (progress indicator) */}
          <div className="h-2 bg-zinc-800">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: "85%" }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              viewport={{ once: true }}
              className="h-full bg-gradient-to-r from-orange-500 via-yellow-500 to-red-500"
            />
          </div>
        </motion.div>

        <p className="text-zinc-500 text-sm mt-8 mb-10">
          Your streak journey, simplified and gamified 💪
        </p>
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
