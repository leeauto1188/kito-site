"use client";

import Link from "next/link";
import matter from "gray-matter";
import { useState, useEffect } from "react";
import { listFiles, getFile } from "@/lib/github";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion";

const lightVars: React.CSSProperties = {
  "--bg": "#fafaf9",
  "--fg": "#1c1917",
  "--fg-secondary": "#44403c",
  "--fg-muted": "#78716c",
  "--fg-subtle": "#a8a29e",
  "--accent": "#57534e",
  "--accent-hover": "#292524",
  "--border": "#e7e5e4",
  "--surface": "#ffffff",
  "--surface-hover": "#fafaf9",
  "--ring": "rgba(87, 83, 78, 0.08)",
} as React.CSSProperties;

function ThoughtsSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8"
        >
          <div className="mb-6 h-6 w-24 rounded skeleton-shimmer" />
          <div className="space-y-3">
            <div className="h-5 w-full rounded skeleton-shimmer" />
            <div className="h-5 w-full rounded skeleton-shimmer" />
            <div className="h-5 w-2/3 rounded skeleton-shimmer" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ThoughtsPage() {
  const [thoughts, setThoughts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const files = await listFiles("content/thoughts");
        const items = (
          await Promise.all(
            files.map(async (f) => {
              try {
                const { content } = await getFile(f.path);
                const parsed = matter(content);
                return {
                  date: parsed.data.date,
                  content: parsed.content.trim(),
                  image: parsed.data.image,
                };
              } catch (e) {
                return null;
              }
            })
          )
        ).filter(Boolean);
        setThoughts(
          (items as any[]).sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          )
        );
      } catch (err: any) {
        setError(err.message || "Failed to load thoughts");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div style={lightVars}>
      {/* Light background layer */}
      <div className="fixed inset-0 -z-10 bg-[#fafaf9]" />

      <FadeIn>
        <Link
          href="/"
          className="group mb-12 inline-flex items-center gap-2 text-sm text-[var(--fg-muted)] transition-colors hover:text-[var(--fg)]"
        >
          <span className="transition-transform duration-300 group-hover:-translate-x-1">
            ←
          </span>
          <span className="link-underline">Back</span>
        </Link>
      </FadeIn>

      <FadeIn delay={0.06}>
        <header className="mb-14 md:mb-16">
          <h1 className="mb-3 text-[clamp(1.85rem,4.5vw,2.75rem)] font-normal tracking-[-0.025em] text-[var(--fg)]">
            Thoughts
          </h1>
          <p className="text-base text-[var(--fg-secondary)]">
            Fleeting notes and half-baked ideas.
          </p>
        </header>
      </FadeIn>

      {loading && <ThoughtsSkeleton />}
      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-500">
          {error}
        </p>
      )}

      {!loading && !error && (
        <StaggerContainer className="flex flex-col gap-8">
          {thoughts.map((thought, idx) => {
            const formattedDate = new Date(thought.date).toLocaleDateString(
              "en-US",
              {
                month: "short",
                day: "numeric",
                year: "numeric",
              }
            );

            return (
              <StaggerItem key={idx}>
                <article className="group relative rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 transition-all duration-300 hover:shadow-md">
                  {/* Date badge */}
                  <div className="mb-6 flex items-center gap-3">
                    <span className="h-px w-8 bg-[var(--border)] transition-all duration-500 group-hover:w-12 group-hover:bg-[var(--fg-muted)]" />
                    <time className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
                      {formattedDate}
                    </time>
                  </div>

                  {/* Quote content */}
                  <blockquote>
                    <p className="whitespace-pre-wrap text-xl font-light leading-[1.65] tracking-[-0.01em] text-[var(--fg)] md:text-2xl">
                      {thought.content}
                    </p>
                  </blockquote>

                  {/* Image if present */}
                  {thought.image && thought.image !== "null" && (
                    <div className="mt-6 overflow-hidden rounded-xl border border-[var(--border)]">
                      <img
                        src={thought.image}
                        alt=""
                        className="img-zoom w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}
                </article>
              </StaggerItem>
            );
          })}

          {thoughts.length === 0 && (
            <p className="py-12 text-center text-sm text-[var(--fg-muted)]">
              No thoughts yet.
            </p>
          )}
        </StaggerContainer>
      )}
    </div>
  );
}
