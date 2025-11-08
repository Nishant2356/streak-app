"use client";
import { Flame } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="w-full flex justify-between items-center px-10 py-6 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md fixed top-0 z-50">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Flame className="text-orange-500" />
        <span>
          Daily <span className="text-orange-400">Streak</span>
        </span>
      </h1>

      <nav className="space-x-6 text-sm">
        <Link href="#features" className="hover:text-orange-400 transition-colors">
          Features
        </Link>
        <Link href="#preview" className="hover:text-orange-400 transition-colors">
          Preview
        </Link>
        <Link href="#join" className="hover:text-orange-400 transition-colors">
          Join
        </Link>
      </nav>
    </header>
  );
}
