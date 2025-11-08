"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Crown, Flame, Trophy } from "lucide-react";
import Image from "next/image";

export default function LeaderboardPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch("/api/users");
        if (!res.ok) throw new Error("Failed to fetch users");
        const data = await res.json();

        // ✅ Sort by XP (then tasksCompleted, then streak)
        const sorted = data.sort(
          (a: any, b: any) =>
            b.xp - a.xp ||
            (b.tasksCompleted || 0) - (a.tasksCompleted || 0) ||
            b.currentStreak - a.currentStreak
        );

        setUsers(sorted);
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  if (loading)
    return <p className="text-center text-white mt-10">Loading Leaderboard...</p>;

  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-black text-white px-6 py-10">
      <div className="text-center mb-10">
        <div className="flex justify-center items-center gap-2 mb-2">
          <Trophy className="w-8 h-8 text-yellow-400 animate-bounce" />
          <h1 className="text-3xl font-bold">Leaderboard</h1>
        </div>
        <p className="text-zinc-400 text-sm">
          See who’s leading in XP, tasks, and streaks 💪
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        {users.length === 0 ? (
          <p className="text-center text-zinc-500">No users found.</p>
        ) : (
          <div className="space-y-3">
            {users.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex items-center justify-between p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 shadow-lg ${
                  index === 0
                    ? "border-yellow-500/50 shadow-yellow-500/20"
                    : index === 1
                    ? "border-gray-400/40 shadow-gray-400/10"
                    : index === 2
                    ? "border-orange-400/40 shadow-orange-400/10"
                    : ""
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* 🥇 Rank Icon */}
                  <div className="w-6 text-center text-zinc-400 font-bold">
                    {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}
                  </div>

                  {/* Profile */}
                  <div className="flex items-center gap-3">
                    <Image
                      src={user.image || "/default-avatar.png"}
                      alt={user.name}
                      width={40}
                      height={40}
                      className="rounded-full border border-zinc-700"
                    />
                    <div>
                      <h2 className="text-lg font-semibold">{user.name}</h2>
                      <p className="text-sm text-zinc-400">@{user.username}</p>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="text-sm flex gap-6 text-zinc-300">
                  <p className="flex items-center gap-1">
                    ⭐ <span className="font-medium">{user.xp}</span>
                  </p>
                  <p className="flex items-center gap-1">
                    📋 {user.tasksCompleted || 0}
                  </p>
                  <p className="flex items-center gap-1">
                    <Flame className="w-4 h-4 text-orange-500" />
                    {user.currentStreak}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
