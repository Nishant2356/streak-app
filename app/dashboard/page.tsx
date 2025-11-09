"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Flame,
  Star,
  Trophy,
  PlusCircle,
  ClipboardList,
  CheckCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export default function UserDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    difficulty: "EASY",
    priority: "MEDIUM",
    dueDate: "", // Empty by default - API will set to tomorrow midnight
  });


  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
  }, [status, router]);

  useEffect(() => {
    async function fetchData() {
      if (!session?.user?.email) return;

      setLoading(true);
      try {
        const encodedEmail = encodeURIComponent(session.user.email);
        const [userRes, taskRes] = await Promise.all([
          fetch(`/api/users/${encodedEmail}`),
          // 🧹 Fetch tasks — expired ones auto-delete in backend
          fetch(`/api/tasks/user`),
        ]);
        if (userRes.ok) setUser(await userRes.json());
        if (taskRes.ok) setTasks(await taskRes.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [session]);

  async function handleCompleteTask(taskId: number) {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
      if (res.ok) {
        setTasks(tasks.filter((t) => t.id !== taskId));
        alert("✅ Task completed!");
        const encodedEmail = encodeURIComponent(session?.user?.email || "");
        const userRes = await fetch(`/api/users/${encodedEmail}`);
        if (userRes.ok) setUser(await userRes.json());
      } else {
        const err = await res.json();
        alert("❌ Failed to complete task: " + err.error);
      }
    } catch (error) {
      console.error(error);
      alert("Network error while completing task.");
    }
  }

  async function handleDeleteTask(taskId: number) {
    if (!confirm("🗑 Are you sure you want to delete this task?")) return;
  
    try {
      const res = await fetch(`/api/tasks/delete-only/${taskId}`, { method: "DELETE" });
      if (res.ok) {
        setTasks(tasks.filter((t) => t.id !== taskId));
        alert("🗑 Task deleted successfully!");
      } else {
        const err = await res.json();
        alert("❌ Failed to delete task: " + err.error);
      }
    } catch (error) {
      console.error(error);
      alert("Network error while deleting task.");
    }
  }
  

  async function handleCreateTask() {
    try {
      // Only include dueDate if it's actually provided and not empty
      const payload: any = {
        title: formData.title,
        description: formData.description,
        difficulty: formData.difficulty,
        priority: formData.priority,
      };

      // Only add dueDate if it's a non-empty string
      if (formData.dueDate && formData.dueDate.trim() !== '') {
        payload.dueDate = formData.dueDate;
      }

      console.log('Sending payload:', payload);
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("✅ Task assigned successfully!");
        setShowModal(false);
        setFormData({
          title: "",
          description: "",
          difficulty: "EASY",
          priority: "MEDIUM",
          dueDate: "",
        });
        const updated = await fetch("/api/tasks/user");
        setTasks(await updated.json());
      } else {
        const err = await res.json();
        alert("❌ Error: " + (err.error || "Failed to create task"));
      }
    } catch (error) {
      alert("Network error while creating task.");
      console.error(error);
    }
  }

  if (loading)
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>Loading your dashboard...</p>
      </main>
    );

  if (!user)
    return (
      <main className="min-h-screen flex justify-center items-center text-white">
        <p>User data not found. Please login again.</p>
      </main>
    );

  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-black text-white px-6 py-10">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="flex justify-center items-center gap-2 mb-2">
          <Flame className="w-8 h-8 text-orange-500 animate-pulse" />
          <h1 className="text-3xl font-bold">Your Dashboard</h1>
        </div>
        <p className="text-zinc-400 text-sm">
          Track your tasks, XP, and progress 🔥
        </p>
      </div>

      {/* User Info */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 shadow-lg shadow-orange-500/10"
      >
        {/* Avatar and Info */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full border border-orange-500/30 bg-zinc-800 flex items-center justify-center overflow-hidden">
            {user.image && !imageError ? (
              <img
                src={user.image}
                alt={user.name}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="text-orange-500 text-2xl font-bold">
                {(user.name || "U")[0].toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-semibold">{user.name}</h2>
            <p className="text-zinc-400 text-sm">{user.email}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
          <div className="bg-zinc-800/60 rounded-xl p-4">
            <Flame className="w-6 h-6 text-orange-400 mx-auto mb-1" />
            <p className="text-orange-400 font-medium">Streak</p>
            <p className="text-xl font-bold">{user.currentStreak || 0}</p>
          </div>
          <div className="bg-zinc-800/60 rounded-xl p-4">
            <Trophy className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
            <p className="text-yellow-400 font-medium">Level</p>
            <p className="text-xl font-bold">{user.level || 1}</p>
          </div>
          <div className="bg-zinc-800/60 rounded-xl p-4">
            <Star className="w-6 h-6 text-blue-400 mx-auto mb-1" />
            <p className="text-blue-400 font-medium">XP</p>
            <p className="text-xl font-bold">{user.xp || 0}</p>
          </div>
        </div>

        {/* Assign Task */}
        <div className="mt-6 text-center">
          <Button
            onClick={() => setShowModal(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-md flex items-center gap-2 mx-auto"
          >
            <PlusCircle className="w-5 h-5" /> Assign Task
          </Button>
        </div>
      </motion.div>

      {/* User Tasks */}
      <section className="max-w-3xl mx-auto mt-10">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-orange-400" /> Your Tasks
        </h2>

        {tasks.length === 0 ? (
          <p className="text-zinc-500">No tasks assigned yet.</p>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl shadow-sm flex justify-between items-center"
              >
                <div>
                  <h3 className="text-lg font-semibold">{task.title}</h3>
                  {task.description && (
                    <p className="text-sm text-zinc-400">{task.description}</p>
                  )}
                  <div className="flex flex-wrap gap-3 text-sm mt-2 text-zinc-300">
                    <span>🎯 {task.difficulty}</span>
                    <span>⚡ {task.xpReward} XP</span>
                    <span>📅 {task.priority}</span>
                    {task.dueDate && (
                      <span>🕒 {new Date(task.dueDate).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 min-w-[100px]">
                  <Button
                    onClick={() => handleCompleteTask(task.id)}
                    className="bg-green-500 hover:bg-green-600 text-white flex items-center justify-center gap-2 w-full"
                  >
                    <CheckCircle className="w-4 h-4" /> Done
                  </Button>

                  <Button
                    onClick={() => handleDeleteTask(task.id)}
                    className="bg-red-500 hover:bg-red-600 text-white flex items-center justify-center gap-2 w-full"
                  >
                    🗑 Delete
                  </Button>
                </div>
              </div>
            ))}

          </div>
        )}
      </section>

      {/* Task Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="bg-zinc-900 text-white border-zinc-800 max-w-md w-full">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-center">
              📝 Assign New Task
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm text-zinc-400">Title</label>
              <Input
                placeholder="Enter task title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="bg-zinc-800 border-zinc-700"
              />
            </div>

            <div>
              <label className="text-sm text-zinc-400">Description</label>
              <Textarea
                placeholder="Describe your task..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="bg-zinc-800 border-zinc-700"
              />
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-sm text-zinc-400">Difficulty</label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(val) =>
                    setFormData({ ...formData, difficulty: val })
                  }
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EASY">Easy (10 XP)</SelectItem>
                    <SelectItem value="MEDIUM">Medium (25 XP)</SelectItem>
                    <SelectItem value="HARD">Hard (50 XP)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <label className="text-sm text-zinc-400">Priority</label>
                <Select
                  value={formData.priority}
                  onValueChange={(val) =>
                    setFormData({ ...formData, priority: val })
                  }
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm text-zinc-400">Due Date (optional - defaults to tomorrow)</label>
              <Input
                type="date"
                value={formData.dueDate || ""}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value || "" })
                }
                className="bg-zinc-800 border-zinc-700"
                placeholder="Leave empty for tomorrow"
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              onClick={handleCreateTask}
              className="bg-orange-500 hover:bg-orange-600 w-full"
            >
              Create Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
