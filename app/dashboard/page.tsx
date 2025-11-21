"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Pencil, Upload } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";

export default function UserDashboard() {

  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [user, setUser] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    action: "complete" | "delete" | null;
    taskId: number | null;
  }>({
    open: false,
    action: null,
    taskId: null,
  });

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [schedulePrompt, setSchedulePrompt] = useState("");
  const [generatedSchedule, setGeneratedSchedule] = useState("");
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [showScheduleDropdown, setShowScheduleDropdown] = useState(false);
  const [timeUntilMidnight, setTimeUntilMidnight] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    difficulty: "EASY",
    priority: "MEDIUM",
    dueDate: "",
  });

  const [showEditProfile, setShowEditProfile] = useState(false);

  const [editData, setEditData] = useState({
    name: "",
    username: "",
    email: "",
    image: "",
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    function updateCountdown() {
      const nowUTC = new Date();
      const istOffset = 5.5 * 60 * 60 * 1000;
      const nowIST = new Date(nowUTC.getTime() + istOffset);

      const midnightTonight = new Date(nowIST);
      midnightTonight.setUTCHours(23, 59, 59, 999);

      const diff = midnightTonight.getTime() - nowIST.getTime();

      if (diff < 0) {
        setTimeUntilMidnight("0h 0m 0s");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeUntilMidnight(`${hours}h ${minutes}m ${seconds}s`);
    }

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  const todayTasks = tasks.filter(t => {
    if (!t.dueDate) return false;

    const taskDateStr = new Date(t.dueDate).toISOString().split('T')[0];

    const nowUTC = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const todayIST = new Date(nowUTC.getTime() + istOffset);
    const todayDateStr = todayIST.toISOString().split('T')[0];

    return taskDateStr === todayDateStr;
  });

  async function generateSchedule() {
    console.log(todayTasks);
    setLoadingSchedule(true);

    try {
      const currentTime = new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      });

      const res = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tasks: todayTasks,
          currentTime,
          prompt: schedulePrompt,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setGeneratedSchedule(data.schedule);
        toast({
          title: "Schedule Ready!",
          description: "Here is your perfect plan for today.",
          className: "bg-blue-600 text-white border-none"
        });
        setShowScheduleModal(false);
      } else {
        toast({
          title: "Failed to generate",
          description: data.error || "Something went wrong.",
          className: "bg-red-600 text-white border-none"
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSchedule(false);
    }
  }

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

  useEffect(() => {
    async function fetchTodaySchedule() {
      if (!session?.user?.email) return;

      try {
        const res = await fetch('/api/schedule');
        if (res.ok) {
          const data = await res.json();
          if (data.schedules && data.schedules.length > 0) {
            setGeneratedSchedule(data.schedules[0].content);
          }
        }
      } catch (err) {
        console.error('Failed to fetch schedule:', err);
      }
    }

    fetchTodaySchedule();
  }, [session]);

  async function handleCompleteTask(taskId: number) {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        setTasks(prevTasks =>
          prevTasks.map(t => (t.id === taskId ? { ...t, completed: true } : t))
        );
        const encodedEmail = encodeURIComponent(session?.user?.email || "");
        const userRes = await fetch(`/api/users/${encodedEmail}`);
        if (userRes.ok) setUser(await userRes.json());

        toast({
          title: "Task Completed 🎉",
          description: "You've earned XP and boosted your streak!",
          className: "bg-green-600 text-white border-none",
        });
      } else {
        const err = await res.json();
        toast({
          title: "❌ Failed to Complete Task",
          description: err.error || "Something went wrong.",
          className: "bg-red-600 text-white border-none",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Network Error",
        description: "Couldn't mark task as completed.",
        className: "bg-red-600 text-white border-none",
      });
    }
  }

  async function handleDeleteTask(taskId: number) {
    try {
      const res = await fetch(`/api/tasks/delete-only/${taskId}`, { method: "DELETE" });
      if (res.ok) {
        setTasks(tasks.filter((t) => t.id !== taskId));
        toast({
          title: "Task Deleted 🗑️",
          description: "The task has been removed successfully.",
          className: "bg-red-600 text-white border-none",
        });
      } else {
        const err = await res.json();
        toast({
          title: "❌ Failed to Delete Task",
          description: err.error || "Something went wrong.",
          className: "bg-red-600 text-white border-none",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Network Error",
        description: "Couldn't delete task.",
        className: "bg-red-600 text-white border-none",
      });
    }
  }

  function requestComplete(taskId: number) {
    setConfirmState({ open: true, action: "complete", taskId });
  }

  function requestDelete(taskId: number) {
    setConfirmState({ open: true, action: "delete", taskId });
  }

  async function handleConfirmAction() {
    if (!confirmState.taskId || !confirmState.action) {
      setConfirmState({ open: false, action: null, taskId: null });
      return;
    }
    const id = confirmState.taskId;
    const action = confirmState.action;
    setConfirmState({ open: false, action: null, taskId: null });
    if (action === "complete") {
      await handleCompleteTask(id);
    } else if (action === "delete") {
      await handleDeleteTask(id);
    }
  }

  function openEditProfile() {
    setEditData({
      name: user.name || "",
      username: user.username || "",
      email: user.email || "",
      image: user.image || "",
    });
    setImagePreview(user.image || "");
    setShowEditProfile(true);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File",
        description: "Please select an image file.",
        className: "bg-red-600 text-white border-none",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image under 5MB.",
        className: "bg-red-600 text-white border-none",
      });
      return;
    }

    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "frontend_signup"); // Replace with your Cloudinary upload preset

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/dujwwjdkq/image/upload`, // Replace with your cloud name
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (res.ok) {
        setEditData({ ...editData, image: data.secure_url });
        setImagePreview(data.secure_url);
        toast({
          title: "Image Uploaded ✅",
          description: "Profile picture uploaded successfully.",
          className: "bg-green-600 text-white border-none",
        });
      } else {
        toast({
          title: "Upload Failed",
          description: "Could not upload image.",
          className: "bg-red-600 text-white border-none",
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Upload Error",
        description: "An error occurred during upload.",
        className: "bg-red-600 text-white border-none",
      });
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleUpdateProfile() {
    try {
      const res = await fetch("/api/users/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: "Update Failed ❌",
          description: data.error || "Something went wrong.",
          className: "bg-red-600 text-white border-none",
        });
        return;
      }

      toast({
        title: "Profile Updated 🎉",
        description: "Your information has been saved.",
        className: "bg-green-600 text-white border-none",
      });

      // Refresh user data
      const encodedEmail = encodeURIComponent(session?.user?.email || "");
      const userRes = await fetch(`/api/users/${encodedEmail}`);
      if (userRes.ok) setUser(await userRes.json());

      setShowEditProfile(false);

    } catch (err) {
      console.error(err);
    }
  }

  async function handleCreateTask() {
    try {
      const payload: any = {
        title: formData.title,
        description: formData.description,
        difficulty: formData.difficulty,
        priority: formData.priority,
      };

      if (formData.dueDate && formData.dueDate.trim() !== "") {
        payload.dueDate = formData.dueDate;
      }

      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      console.log(data)

      if (data?.error) {
        toast({
          title: "❌ Task Validation Failed",
          description: data.error,
          className: "bg-red-600 text-white border-none",
        });
        return;
      }

      if (res.ok) {
        toast({
          title: "✅ Task Created",
          description: "New task assigned successfully!",
          className: "bg-orange-600 text-white border-none",
        });
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
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Network Error",
        description: "Couldn't create task.",
        className: "bg-red-600 text-white border-none",
      });
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
    <main className="px-4 sm:px-6 py-10">
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
        <div className="flex items-center gap-4 mb-6 relative">
          <div className="relative w-16 h-16">
            {/* Avatar (highest layer) */}
            <img
              src={user.image}
              alt={user.name}
              className="absolute inset-0 w-full h-full object-cover rounded-full border border-orange-500/30 bg-zinc-800"
              style={{ zIndex: 15 }}
              onError={() => setImageError(true)}
            />

            {/* HEADGEAR */}
            {(() => {
              const headgear = user.equipped?.find((e: any) => e.type === "HEADGEAR");
              if (!headgear) return null;

              return (
                <img
                  src={headgear.item.image}
                  alt="Headgear"
                  className="absolute pointer-events-none"
                  style={{
                    width: headgear.item.style.width || 60,
                    top: headgear.item.style.offsetY ?? -25,
                    left: headgear.item.style.offsetX ?? -5,
                    zIndex: 20,
                  }}
                />
              );
            })()}
          </div>

          <div>
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              {user.name}
              <button
                onClick={() => openEditProfile()}
                className="text-zinc-400 hover:text-orange-400"
              >
                <Pencil className="w-5 h-5" />
              </button>
            </h2>
            <p className="text-zinc-400 text-sm">{user.email}</p>
          </div>
        </div>

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

        <div className="mt-4 bg-gradient-to-r from-orange-900/20 to-red-900/20 border border-orange-700/50 rounded-xl p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm text-zinc-400">Until Midnight:</span>
            </div>
            <span className="text-lg font-bold text-orange-400 font-mono">
              {timeUntilMidnight || "..."}
            </span>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Button
            onClick={() => setShowModal(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-md flex items-center gap-2 mx-auto"
          >
            <PlusCircle className="w-5 h-5" /> Assign Task
          </Button>
          <Button
            onClick={() => setShowScheduleModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md flex items-center gap-2 mx-auto mt-4"
          >
            📅 Generate Schedule
          </Button>
        </div>
      </motion.div>

      {/* Generated Schedule Display */}
      {generatedSchedule && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-3xl mx-auto mt-8 bg-blue-900/20 border border-blue-700/50 rounded-2xl overflow-hidden"
        >
          <button
            onClick={() => setShowScheduleDropdown(!showScheduleDropdown)}
            className="w-full p-6 flex items-center justify-between hover:bg-blue-900/30 transition-colors"
          >
            <h2 className="text-2xl font-semibold flex items-center gap-2 text-blue-400">
              📅 Today's Schedule
            </h2>
            <motion.div
              animate={{ rotate: showScheduleDropdown ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <svg
                className="w-6 h-6 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </motion.div>
          </button>

          {showScheduleDropdown && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="px-6 pb-6"
            >
              <div className="prose prose-invert max-w-none">
                <pre className="whitespace-pre-wrap text-sm text-zinc-200 bg-zinc-800/50 p-4 rounded-lg">
                  {generatedSchedule}
                </pre>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

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
                className={`p-4 border rounded-xl flex justify-between items-center ${task.completed
                  ? "bg-green-900 border-green-600 opacity-80"
                  : "bg-zinc-900/60 border-zinc-800"
                  }`}
              >
                <div>
                  <h3
                    className={`text-lg font-semibold ${task.completed ? "line-through text-green-400" : ""
                      }`}
                  >
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="text-sm text-zinc-400">{task.description}</p>
                  )}
                  <div className="flex flex-wrap gap-3 text-sm mt-2 text-zinc-300">
                    <span>🎯 {task.difficulty}</span>
                    <span>⚡ {task.xpReward} XP</span>
                    <span>📅 {task.priority}</span>
                    {task.dueDate && (
                      <span>🕒 {new Date(task.dueDate).toISOString().split('T')[0]}</span>
                    )}
                    {task.completed && (
                      <span className="text-green-400 font-semibold">✅ Completed</span>
                    )}
                  </div>
                </div>

                {!task.completed && (
                  <div className="flex flex-col gap-2 min-w-[100px]">
                    <Button
                      onClick={() => requestComplete(task.id)}
                      className="bg-green-500 hover:bg-green-600 text-white flex items-center justify-center gap-2 w-full"
                    >
                      <CheckCircle className="w-4 h-4" /> Done
                    </Button>
                    <Button
                      onClick={() => requestDelete(task.id)}
                      className="bg-red-500 hover:bg-red-600 text-white flex items-center justify-center gap-2 w-full"
                    >
                      🗑 Delete
                    </Button>
                  </div>
                )}
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
              <label className="text-sm text-zinc-400">
                Due Date (optional - defaults to tomorrow)
              </label>
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

      {/* Schedule Modal */}
      <Dialog open={showScheduleModal} onOpenChange={setShowScheduleModal}>
        <DialogContent className="bg-zinc-900 text-white border-zinc-800 max-w-md w-full">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-center">
              📅 Create Today's Schedule
            </DialogTitle>
          </DialogHeader>

          {todayTasks.length === 0 ? (
            <p className="text-center text-zinc-400">
              No tasks are due today.
            </p>
          ) : (
            <>
              <p className="text-sm text-zinc-400 mb-3">
                Optional instructions (e.g., "Give more time to coding tasks")
              </p>

              <Textarea
                className="bg-zinc-800 border-zinc-700"
                placeholder="Write extra instructions (optional)"
                value={schedulePrompt}
                onChange={e => setSchedulePrompt(e.target.value)}
              />

              <DialogFooter className="mt-4">
                <Button
                  onClick={generateSchedule}
                  className="bg-blue-600 hover:bg-blue-700 w-full"
                  disabled={loadingSchedule}
                >
                  {loadingSchedule ? "Generating..." : "Generate Schedule"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm Action Dialog */}
      <Dialog open={confirmState.open} onOpenChange={(open) => setConfirmState((s) => ({ ...s, open }))}>
        <DialogContent className="bg-zinc-900 text-white border-zinc-800 max-w-sm w-full">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-center">
              {confirmState.action === "delete" ? "🗑 Delete Task?" : "✅ Mark Task as Done?"}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-2 text-center text-sm text-zinc-300">
            {confirmState.action === "delete"
              ? "This will permanently remove the task."
              : "This will mark the task as completed and award XP."}
          </div>
          <DialogFooter className="mt-6 flex gap-2 sm:gap-3">
            <Button
              onClick={handleConfirmAction}
              className={`${confirmState.action === "delete" ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"} w-full`}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Profile Dialog */}
      <Dialog open={showEditProfile} onOpenChange={setShowEditProfile}>
        <DialogContent className="bg-zinc-900 border border-zinc-700 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Edit Profile</DialogTitle>
          </DialogHeader>

          <div className="space-y-5 mt-4">
            {/* Profile Image Upload */}
            <div>
              <label className="text-sm text-zinc-400 mb-2 block">Profile Picture</label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full border-2 border-orange-500/30 bg-zinc-800 flex items-center justify-center overflow-hidden">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-orange-500 text-2xl font-bold">
                      {(editData.name || "U")[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer inline-flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg border border-zinc-700 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    {uploadingImage ? "Uploading..." : "Upload Photo"}
                  </label>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploadingImage}
                  />
                  <p className="text-xs text-zinc-500 mt-2">
                    JPG, PNG or GIF (max 5MB)
                  </p>
                </div>
              </div>
            </div>

            {/* Or manual URL input */}
            <div>
              <label className="text-sm text-zinc-400">Or paste image URL</label>
              <Input
                value={editData.image}
                onChange={(e) => {
                  setEditData({ ...editData, image: e.target.value });
                  setImagePreview(e.target.value);
                }}
                placeholder="https://example.com/image.jpg"
                className="bg-zinc-800 border-zinc-700 mt-1"
              />
            </div>

            {/* Full Name */}
            <div>
              <label className="text-sm text-zinc-400">Full Name</label>
              <Input
                value={editData.name}
                onChange={(e) =>
                  setEditData({ ...editData, name: e.target.value })
                }
                className="bg-zinc-800 border-zinc-700 mt-1"
              />
            </div>

            {/* Username */}
            <div>
              <label className="text-sm text-zinc-400">Username</label>
              <Input
                value={editData.username}
                onChange={(e) =>
                  setEditData({ ...editData, username: e.target.value })
                }
                className="bg-zinc-800 border-zinc-700 mt-1"
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-sm text-zinc-400">Email</label>
              <Input
                type="email"
                value={editData.email}
                onChange={(e) =>
                  setEditData({ ...editData, email: e.target.value })
                }
                className="bg-zinc-800 border-zinc-700 mt-1"
              />
            </div>

            <p className="text-xs text-zinc-500">
              Password cannot be changed from here.
            </p>
          </div>

          <DialogFooter className="mt-6">
            <Button
              onClick={handleUpdateProfile}
              className="bg-orange-500 hover:bg-orange-600 text-white w-full"
              disabled={uploadingImage}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}