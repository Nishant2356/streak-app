"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Flame, ClipboardList, Star } from "lucide-react";
import React from "react";

// ✅ Reusable Card
export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 shadow-lg shadow-orange-500/10 ${className}`}
    >
      {children}
    </div>
  );
}

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect if unauthenticated
  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
  }, [status, router]);

  // Fetch users from API
  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch("/api/users");
        if (res.ok) {
          const data = await res.json();
          setUsers(data);
        } else {
          console.error("Failed to fetch users:", res.statusText);
        }
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  if (status === "loading" || loading)
    return <p className="text-center mt-10 text-white">Loading...</p>;

  return (
<main className="px-4 sm:px-6 py-10">
{/* Header */}
      <div className="text-center mb-10">
        <div className="flex justify-center items-center gap-2 mb-2">
          <Flame className="w-8 h-8 text-orange-500 animate-pulse" />
          <h1 className="text-3xl font-bold">Activity Dashboard</h1>
        </div>
        <p className="text-zinc-400 text-sm">
          Track everyone’s progress, XP, and assigned tasks 🔥
        </p>
      </div>

      {/* User Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {users.length === 0 ? (
          <p className="text-zinc-400 text-center col-span-full">
            No users found.
          </p>
        ) : (
          users.map((user) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                {/* Profile Header */}
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={user.image || "/default-avatar.png"}
                    alt={user.name}
                    className="w-12 h-12 rounded-full object-cover border border-orange-500/30"
                  />
                  <div>
                    <h2 className="text-lg font-semibold">{user.name}</h2>
                    <p className="text-sm text-zinc-400">@{user.username}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="text-sm space-y-1 text-zinc-300 mb-3">
                  <p>
                    <span className="text-orange-400 font-medium">🔥 Streak:</span>{" "}
                    {user.currentStreak} days
                  </p>
                  <p>
                    <span className="text-orange-400 font-medium">🏆 Level:</span>{" "}
                    {user.level}
                  </p>
                  <p>
                    <span className="text-orange-400 font-medium">⭐ XP:</span>{" "}
                    {user.xp}
                  </p>
                </div>

                {/* Tasks Section */}
                <div className="mt-3">
                  <div className="flex items-center gap-2 mb-2">
                    <ClipboardList className="w-4 h-4 text-orange-400" />
                    <p className="text-sm font-medium text-orange-400">
                      Assigned Tasks
                    </p>
                  </div>

                  {user.tasks && user.tasks.length > 0 ? (
                    <ul className="space-y-2 max-h-40 overflow-y-auto">
                      {user.tasks.map((task: any) => (
                        <li
                          key={task.id}
                          className="bg-zinc-800/60 rounded-lg p-3 text-sm border border-zinc-700/50"
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium">{task.title}</span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${
                                task.completed
                                  ? "bg-green-500/20 text-green-400"
                                  : "bg-yellow-500/20 text-yellow-400"
                              }`}
                            >
                              {task.completed ? "Done" : "Pending"}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs text-zinc-400">
                            <span>Difficulty: {task.difficulty}</span>
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-blue-400" /> {task.xpReward} XP
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-zinc-500">No tasks assigned yet.</p>
                  )}
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </main>
  );
}
