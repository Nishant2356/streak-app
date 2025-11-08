"use client";
import { Flame, LogOut } from "lucide-react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  // Hide navbar on auth pages
  if (pathname?.startsWith("/auth")) return null;

  // ✅ Dynamic logo link
  const logoLink = session?.user ? "/home" : "/";

  return (
    <header className="w-full flex justify-between items-center px-4 sm:px-6 lg:px-10 py-4 sm:py-6 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md fixed top-0 z-50">
      {/* Logo */}
      <Link
        href={logoLink}
        className="text-2xl font-bold flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        <Flame className="text-orange-500" />
        <span>
          Daily <span className="text-orange-400">Streak</span>
        </span>
      </Link>

      {/* Navigation Links */}
      <nav className="flex items-center space-x-4 sm:space-x-6 text-sm">
        <Link
          href="/home"
          className={`hover:text-orange-400 transition-colors ${
            pathname === "/home" ? "text-orange-400" : ""
          }`}
        >
          Home
        </Link>

        {pathname === "/" && (
          <>
            <Link
              href="#features"
              className="hover:text-orange-400 transition-colors hidden md:inline"
            >
              Features
            </Link>
            <Link
              href="#preview"
              className="hover:text-orange-400 transition-colors hidden md:inline"
            >
              Preview
            </Link>
            <Link
              href="#join"
              className="hover:text-orange-400 transition-colors hidden md:inline"
            >
              Join
            </Link>
          </>
        )}

        {status === "loading" ? (
          <div className="w-20 h-8 bg-zinc-800 rounded animate-pulse ml-4" />
        ) : session?.user ? (
          <>
            <Link
              href="/dashboard"
              className={`hover:text-orange-400 transition-colors ${
                pathname === "/dashboard" ? "text-orange-400" : ""
              }`}
            >
              Dashboard
            </Link>

            <Link
              href="/leaderboard"
              className={`hover:text-orange-400 transition-colors ${
                pathname === "/leaderboard" ? "text-orange-400" : ""
              }`}
            >
              Leaderboard
            </Link>

            <Button
              onClick={handleSignOut}
              variant="destructive"
              className="flex items-center gap-2 px-4 py-2 rounded-xl shadow-md hover:shadow-lg transition-all bg-red-500 hover:bg-red-600 text-white font-medium"
            >
              <LogOut size={18} />
              Sign Out
            </Button>
          </>
        ) : (
          <>
            <Link
              href="/auth/login"
              className="hover:text-orange-400 transition-colors"
            >
              Login
            </Link>
            <Link href="/auth/register">
              <Button className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 bg-orange-500 hover:bg-orange-600 ml-2">
                Sign Up
              </Button>
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
