import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import Navbar from "@/components/ui/Navbar";

export const metadata: Metadata = {
  title: "Streak App",
  description: "Build unstoppable consistency with daily challenges",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        <Providers>
          <Navbar />
          <main className="pt-20"> {/* Adds space below fixed navbar */}
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}

