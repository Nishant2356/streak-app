"use client";
import { Flame, LogOut, Menu, X } from "lucide-react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/");
    setIsMobileMenuOpen(false);
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Hide navbar on auth pages
  if (pathname?.startsWith("/auth")) return null;

  // ✅ Dynamic logo link
  const logoLink = session?.user ? "/home" : "/";

  // Navigation links component (reusable for desktop and mobile)
  const NavLinks = ({ isMobile = false }) => (
    <>
      <Link
        href="/home"
        className={`hover:text-orange-400 transition-colors ${pathname === "/home" ? "text-orange-400" : ""
          } ${isMobile ? "block py-3 text-base" : ""}`}
        onClick={() => isMobile && setIsMobileMenuOpen(false)}
      >
        Home
      </Link>

      {pathname === "/" && (
        <>
          <Link
            href="#features"
            className={`hover:text-orange-400 transition-colors ${isMobile ? "block py-3 text-base" : "hidden md:inline"
              }`}
            onClick={() => isMobile && setIsMobileMenuOpen(false)}
          >
            Features
          </Link>
          <Link
            href="#preview"
            className={`hover:text-orange-400 transition-colors ${isMobile ? "block py-3 text-base" : "hidden md:inline"
              }`}
            onClick={() => isMobile && setIsMobileMenuOpen(false)}
          >
            Preview
          </Link>
          <Link
            href="#join"
            className={`hover:text-orange-400 transition-colors ${isMobile ? "block py-3 text-base" : "hidden md:inline"
              }`}
            onClick={() => isMobile && setIsMobileMenuOpen(false)}
          >
            Join
          </Link>
        </>
      )}

      {status === "loading" ? (
        <div className={`w-20 h-8 bg-zinc-800 rounded animate-pulse ${isMobile ? "my-3" : "ml-4"}`} />
      ) : session?.user ? (
        <>
          <Link
            href="/dashboard"
            className={`hover:text-orange-400 transition-colors ${pathname === "/dashboard" ? "text-orange-400" : ""
              } ${isMobile ? "block py-3 text-base" : ""}`}
            onClick={() => isMobile && setIsMobileMenuOpen(false)}
          >
            Dashboard
          </Link>

          <Link
            href="/leaderboard"
            className={`hover:text-orange-400 transition-colors ${pathname === "/leaderboard" ? "text-orange-400" : ""
              } ${isMobile ? "block py-3 text-base" : ""}`}
            onClick={() => isMobile && setIsMobileMenuOpen(false)}
          >
            Leaderboard
          </Link>

          <Link
            href="/store"
            className={`hover:text-orange-400 transition-colors ${pathname === "/store" ? "text-orange-400" : ""
              } ${isMobile ? "block py-3 text-base" : ""}`}
            onClick={() => isMobile && setIsMobileMenuOpen(false)}
          >
            Store
          </Link>

          <Button
            onClick={handleSignOut}
            variant="destructive"
            className={`flex items-center gap-2 px-4 py-2 rounded-xl shadow-md hover:shadow-lg transition-all bg-red-500 hover:bg-red-600 text-white font-medium ${isMobile ? "w-full mt-2 justify-center" : ""
              }`}
          >
            <LogOut size={18} />
            Sign Out
          </Button>
        </>
      ) : (
        <>
          <Link
            href="/auth/login"
            className={`hover:text-orange-400 transition-colors ${isMobile ? "block py-3 text-base" : ""
              }`}
            onClick={() => isMobile && setIsMobileMenuOpen(false)}
          >
            Login
          </Link>
          <Link
            href="/auth/register"
            onClick={() => isMobile && setIsMobileMenuOpen(false)}
          >
            <Button className={`text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 bg-orange-500 hover:bg-orange-600 ${isMobile ? "w-full mt-2" : "ml-2"
              }`}>
              Sign Up
            </Button>
          </Link>
        </>
      )}
    </>
  );

  return (
    <>
      <header className="w-full flex justify-between items-center px-4 sm:px-6 lg:px-10 py-4 sm:py-6 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md fixed top-0 z-50">
        {/* Logo */}
        <Link
          href={logoLink}
          className="text-xl sm:text-2xl font-bold flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <Flame className="text-orange-500 w-5 h-5 sm:w-6 sm:h-6" />
          <span className="text-orange-400">Arise</span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-4 sm:space-x-6 text-sm">
          <NavLinks />
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 text-zinc-400 hover:text-orange-400 transition-colors"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 mt-[73px] bg-zinc-950/95 backdrop-blur-md">
          <nav className="flex flex-col px-6 py-4 space-y-1 text-sm">
            <NavLinks isMobile={true} />
          </nav>
        </div>
      )}
    </>
  );
}
