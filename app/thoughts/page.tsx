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
    <div className="flex flex-col divide-y divide-[var(--border)]">
      {[1, 2, 3].map((i) => (
        <div key={i} className="py-10 md:py-12">
          <div className="mb-5 flex items-center gap-3">
            <div className="h-px w-6 bg-[var(--border)]" />
            <div className="h-3 w-24 rounded skeleton-shimmer" />
          </div>
          <div className="space-y-2">
            <div className="h-5 w-full max-w-[560px] rounded skeleton-shimmer" />
            <div className="h-5 w-full max-w-[480px] rounded skeleton-shimmer" />
            <div className="h-5 w-2/3 max-w-[400px] rounded skeleton-shimmer" />
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
        <StaggerContainer className="flex flex-col divide-y divide-[var(--border)]">
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
                <article className="group py-10 md:py-12">
                  <div className="mb-5 flex items-center gap-3">
                    <span className="h-px w-6 bg-[var(--border)] transition-all duration-500 group-hover:w-10 group-hover:bg-[var(--fg-muted)]" />
                    <p className="text-xs font-medium uppercase tracking-[0.08em] text-[var(--fg-muted)]">
                      {formattedDate}
                    </p>
                  </div>

                  <blockquote>
                    <p className="whitespace-pre-wrap text-[17px] font-light leading-[1.75] text-[var(--fg-secondary)] md:text-lg">
                      {thought.content}
                    </p>
                  </blockquote>

                  {thought.image && (
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
