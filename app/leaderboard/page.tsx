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
    <main className="px-4 sm:px-6 py-10">
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
                className={`flex items-center justify-between p-3 sm:p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 shadow-lg gap-2 sm:gap-4 ${index === 0
                    ? "border-yellow-500/50 shadow-yellow-500/20"
                    : index === 1
                      ? "border-gray-400/40 shadow-gray-400/10"
                      : index === 2
                        ? "border-orange-400/40 shadow-orange-400/10"
                        : ""
                  }`}
              >
                <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                  {/* 🥇 Rank Icon */}
                  <div className="w-5 sm:w-6 text-center text-zinc-400 font-bold flex-shrink-0 text-sm sm:text-base">
                    {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}
                  </div>

                  {/* Profile */}
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <div className="relative flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10">
                      {/* Avatar */}
            {(() => {
              const avatar = user.equipped?.find((e: any) => e.type === "AVATAR");

              return (
                <img
                src={avatar? avatar.item.image : user.image}
                alt={user.name}
                className="absolute inset-0 w-full h-full object-cover rounded-full border border-orange-500/30 bg-zinc-800"
                style={{ zIndex: 15 }}
                onError={() => setImageError(true)}
              />
              );
            })()}

                      {/* HEADGEAR OVERLAY */}
                      {(() => {
                        const headgear = user.equipped?.find((e: any) => e.type === "HEADGEAR");
                        if (!headgear) return null;

                        const item = headgear.item;
                        console.log("Headgear item for", user.username, ":", item);

                        return (
                          <img
                            src={item.image}
                            alt="headgear"
                            className="absolute pointer-events-none"
                            style={{
                              zIndex: 12,
                              width: (item.style.smallWidth ?? 50) * 1,   // shrink for leaderboard
                              top: item.style.smallOffsetY  ?? -25,
                              left: item.style.smallOffsetX ?? -2,
                            }}
                          />
                        );
                      })()}
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-sm sm:text-lg font-semibold truncate">{user.name}</h2>
                      <p className="text-xs sm:text-sm text-zinc-400 truncate">@{user.username}</p>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="text-xs sm:text-sm flex gap-2 sm:gap-4 md:gap-6 text-zinc-300 flex-shrink-0">
                  <p className="flex items-center gap-0.5 sm:gap-1 whitespace-nowrap">
                    ⭐ <span className="font-medium">{user.xp}</span>
                  </p>
                  <p className="flex items-center gap-0.5 sm:gap-1 whitespace-nowrap">
                    📋 <span>{user.tasksCompleted || 0}</span>
                  </p>
                  <p className="flex items-center gap-0.5 sm:gap-1 whitespace-nowrap">
                    <Flame className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500" />
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
