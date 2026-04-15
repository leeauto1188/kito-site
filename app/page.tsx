"use client";

import Link from "next/link";
import { FadeIn } from "@/components/motion";

export default function Home() {
  return (
    <div className="flex min-h-[60vh] flex-col justify-center">
      <FadeIn>
        <p className="mb-10 text-[11px] font-semibold tracking-[0.22em] text-[var(--fg-muted)]">
          KITO
        </p>
      </FadeIn>

      <FadeIn delay={0.08}>
        <h1 className="mb-16 max-w-[560px] text-[clamp(2rem,5.5vw,3.75rem)] font-extralight leading-[1.1] tracking-[-0.03em] text-[var(--fg)]">
          Don&apos;t learn AI.
          <br />
          <span className="text-[var(--fg-muted)]">Use AI.</span>
        </h1>
      </FadeIn>

      <FadeIn delay={0.16}>
        <nav className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/works"
            className="group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_var(--ring)]"
          >
            <div className="mb-1 flex items-center justify-between">
              <span className="text-lg font-medium text-[var(--fg)]">Works</span>
              <span className="text-[var(--fg-subtle)] transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </div>
            <p className="text-sm text-[var(--fg-muted)]">
              A timeline of things I&apos;ve built.
            </p>
          </Link>

          <Link
            href="/thoughts"
            className="group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_var(--ring)]"
          >
            <div className="mb-1 flex items-center justify-between">
              <span className="text-lg font-medium text-[var(--fg)]">Thoughts</span>
              <span className="text-[var(--fg-subtle)] transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </div>
            <p className="text-sm text-[var(--fg-muted)]">
              Fleeting notes and half-baked ideas.
            </p>
          </Link>
        </nav>
      </FadeIn>

      <FadeIn delay={0.24}>
        <footer className="mt-20 flex items-center gap-5 border-t border-[var(--border)] pt-8">
          <a
            href="https://github.com/kito"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--fg-muted)] transition-colors hover:text-[var(--fg)]"
            aria-label="GitHub"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
            </svg>
          </a>
          <a
            href="https://x.com/kito"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[var(--fg-muted)] transition-colors hover:text-[var(--fg)]"
          >
            X / Twitter
          </a>
        </footer>
      </FadeIn>
    </div>
  );
}
