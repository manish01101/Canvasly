"use client";

import { motion } from "framer-motion";
import { Pencil, Users, MessageSquare, Zap } from "lucide-react";
import Button from "./components/Button";
import Link from "next/link";
import NavBar from "./components/NavBar";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 text-gray-900">
      <NavBar />
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-24 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            Real‑time Collaborative Whiteboard
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Canvasly lets teams brainstorm, draw, and chat together in real‑time
            — inspired by Excalidraw, built for speed.
          </p>
          <div className="flex gap-4">
            <Button
              className="px-6 py-5 text-base"
              // onclick={() => router.push("/signup")}
            >
              <Link href={"/signup"}>Get Started</Link>
            </Button>
            <Button className="px-6 py-5 text-base">
              <Link href={"/canvas"}>View Demo</Link>
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl h-80 flex items-center justify-center"
        >
          <span className="text-gray-400">Whiteboard Preview</span>
        </motion.div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-semibold text-center mb-12">
          Why Canvasly?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              icon: Pencil,
              title: "Freehand Drawing",
              desc: "Sketch, draw shapes, and visualize ideas instantly.",
            },
            {
              icon: Users,
              title: "Live Collaboration",
              desc: "Multiple users editing the same canvas in real‑time.",
            },
            {
              icon: MessageSquare,
              title: "Room Chat",
              desc: "Built‑in chat synced with your whiteboard room.",
            },
            {
              icon: Zap,
              title: "Low‑Latency",
              desc: "WebSocket‑powered updates for instant sync.",
            },
          ].map((f, i) => (
            <div key={i} className="rounded-2xl shadow-sm">
              <div className="p-6">
                <f.icon className="h-8 w-8 mb-4 text-gray-800" />
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-gray-600 text-sm">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* call to action */}
      <section className="bg-gray-900 text-white py-20">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-3xl font-semibold mb-4">
            Start collaborating instantly
          </h2>
          <p className="text-gray-300 mb-8">
            Create a room, invite your team, and draw together in seconds.
          </p>
          <Button className="px-8 py-5 text-base">Launch Canvasly</Button>
        </div>
      </section>

      {/* Footer section */}
      <footer className="py-8 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Canvasly. Built for collaborative
        creativity.
      </footer>
    </div>
  );
}
