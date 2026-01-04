"use client";

import { motion } from "framer-motion";
import {
  Pencil,
  Users,
  MessageSquare,
  Zap,
  MousePointer2,
  Square,
  Circle,
  Undo,
  Redo,
} from "lucide-react";
import Button from "./components/Button";
import Link from "next/link";
import NavBar from "./components/NavBar";

// --- Components for the Mockup ---

const Cursor = ({
  color,
  name,
  x,
  y,
  delay,
}: {
  color: string;
  name: string;
  x: number;
  y: number;
  delay: number;
}) => (
  <motion.div
    className="absolute z-20 pointer-events-none"
    initial={{ x, y, opacity: 0 }}
    animate={{
      x: [x, x + 40, x - 20, x],
      y: [y, y + 20, y - 50, y],
      opacity: 1,
    }}
    transition={{
      duration: 4,
      delay: delay,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  >
    <MousePointer2
      className={`h-5 w-5 fill-current text-${color}-500`}
      style={{ color }}
    />
    <div
      className={`ml-4 px-2 py-1 rounded-md text-xs text-white font-bold whitespace-nowrap`}
      style={{ backgroundColor: color }}
    >
      {name}
    </div>
  </motion.div>
);

const FloatingToolbar = () => (
  <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white shadow-lg border border-gray-100 rounded-lg p-2 flex gap-4 z-10">
    <div className="p-2 hover:bg-gray-100 rounded cursor-pointer">
      <Pencil size={18} />
    </div>
    <div className="p-2 bg-[var(--color-secondary)]/20 text-[var(--color-primary)] rounded cursor-pointer">
      <Square size={18} />
    </div>
    <div className="p-2 hover:bg-gray-100 rounded cursor-pointer">
      <Circle size={18} />
    </div>
    <div className="w-px bg-gray-200 mx-1"></div>
    <div className="p-2 hover:bg-gray-100 rounded cursor-pointer">
      <Undo size={18} />
    </div>
    <div className="p-2 hover:bg-gray-100 rounded cursor-pointer">
      <Redo size={18} />
    </div>
  </div>
);

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-hidden">
      <NavBar />

      {/* Background decoration */}
      {/* <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div> */}

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 lg:py-28 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-block px-3 py-1 mb-4 text-sm font-semibold text-[var(--color-primary)] bg-[var(--color-secondary)]/10 rounded-full">
            v1.0 is now live!
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6 text-[var(--color-primary)]">
            Collaborate & Draw <br />
            <span className="text-[var(--color-secondary)]">in Real-Time.</span>
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-lg leading-relaxed">
            Canvasly lets teams brainstorm, wireframe, and chat together
            instantly. No sign-up required to try. Open source and built for
            speed.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button className="px-8 py-4 text-lg shadow-xl shadow-[var(--color-secondary)]/20 hover:scale-105 transition-transform duration-200">
              <Link href={"/signup"}>Get Started for Free</Link>
            </Button>
            <Link href={"/playground"}>
              <button className="px-8 py-4 text-lg font-semibold text-gray-700  transition-colors flex items-center gap-2 cursor-pointer transition duration-150 hover:scale-105 ease-in-out bg-gray-200 hover:bg-gray-300 rounded-xl">
                Try it <span aria-hidden="true">→</span>
              </button>
            </Link>
          </div>

          <div className="mt-8 flex items-center gap-4 text-sm text-gray-500">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-[10px] font-bold"
                >
                  U{i}
                </div>
              ))}
            </div>
            <p>Trusted by 100+ developers</p>
          </div>
        </motion.div>

        {/* --- ANIMATED PREVIEW SECTION --- */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, delay: 0.2, type: "spring" }}
          className="relative"
        >
          {/* blur around the preview section */}
          <div className="absolute -inset-1 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] rounded-2xl blur opacity-30"></div>

          {/* The Browser Window Interface */}
          <div className="relative bg-white rounded-xl shadow-2xl border border-gray-200 h-[400px] overflow-hidden flex flex-col">
            {/* Window Controls */}
            <div className="h-10 border-b border-gray-100 flex items-center px-4 gap-2 bg-gray-50/50">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>

            {/* Canvas Area */}
            <div className="relative flex-1 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px]">
              <FloatingToolbar />

              {/* Simulating Drawing a Rectangle */}
              <svg className="absolute top-20 left-20 w-64 h-48 drop-shadow-md">
                <motion.rect
                  x="10"
                  y="10"
                  width="200"
                  height="150"
                  fill="transparent"
                  stroke="var(--color-primary)"
                  strokeWidth="4"
                  rx="8"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                />
              </svg>

              {/* Simulating Drawing a Connection Line */}
              <svg className="absolute top-32 left-60 w-64 h-48">
                <motion.path
                  d="M 10 50 Q 50 10 150 50"
                  fill="transparent"
                  stroke="var(--color-secondary)"
                  strokeWidth="4"
                  strokeDasharray="8 8"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{
                    duration: 1.5,
                    delay: 1,
                    repeat: Infinity,
                    repeatDelay: 3.5,
                  }}
                />
              </svg>

              {/* Simulated User Cursors */}
              <Cursor color="#00B7B5" name="You" x={220} y={160} delay={0} />
              <Cursor color="#EC4899" name="Sarah" x={80} y={200} delay={1.5} />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[var(--color-primary)]">
              Everything you need to collaborate
            </h2>
            <p className="text-gray-600 mt-4">
              Powerful features wrapped in a simple interface.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Pencil,
                title: "Infinite Canvas",
                desc: "Sketch, draw shapes, and map out ideas on an infinite whiteboard.",
              },
              {
                icon: Users,
                title: "Real-time Sync",
                desc: "See your teammates' cursors and edits live, with under 50ms latency.",
              },
              {
                icon: MessageSquare,
                title: "Built-in Chat",
                desc: "Discuss ideas without leaving the app. Chat history is saved per room.",
              },
              {
                icon: Zap,
                title: "Super Fast",
                desc: "Built with Next.js and WebSockets for lightning fast performance.",
              },
            ].map((f, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 bg-[var(--color-secondary)]/10 rounded-xl flex items-center justify-center mb-6 text-[var(--color-primary)]">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-lg mb-3 text-gray-800">
                  {f.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden bg-[var(--color-secondary)]">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            Ready to start drawing?
          </h2>
          <p className="text-cyan-100 text-lg mb-10 max-w-2xl mx-auto">
            Create a room in seconds. No credit card required. Invite your team
            and start creating.
          </p>
          <Button className="px-10 py-4 text-lg border-none" type="primary">
            <Link href="/signup">Launch Canvasly Free</Link>
          </Button>
        </div>
      </section>

      {/* Footer section */}
      <footer className="py-10 border-t border-gray-100 text-center">
        <p className="text-gray-500 text-sm">
          © {new Date().getFullYear()} Canvasly. Built for collaborative
          creativity.
        </p>
      </footer>
    </div>
  );
}
