"use client";

import { motion } from "framer-motion";

export default function GlobalBackground() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2 }}
      className="fixed inset-0 -z-10 overflow-hidden"
    >
      {/* SVG Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/bg-shape.svg')", // your haikei SVG file
        }}
      />

      {/* Optional gradient overlay for cinematic depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-zinc-900/60 to-black/90" />

      {/* Optional glowing blur effect */}
      <div className="absolute top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-500/20 blur-3xl rounded-full" />
    </motion.div>
  );
}
