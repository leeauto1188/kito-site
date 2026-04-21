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

function WorksSkeleton() {
  return (
    <div className="relative flex flex-col">
      <div className="absolute left-[5px] top-2 bottom-0 w-px bg-gradient-to-b from-[var(--border)] via-[var(--border)] to-transparent md:left-[6px]" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="relative pl-10 md:pl-12">
          <div className="absolute left-0 top-1.5 h-[11px] w-[11px] rounded-full border-2 border-[var(--border)] bg-[var(--bg)]" />
          <div className="pb-16 md:pb-20">
            <div className="mb-3 h-3 w-20 rounded skeleton-shimmer" />
            <div className="mb-3 h-7 w-3/4 rounded skeleton-shimmer" />
            <div className="mb-2 h-4 w-full max-w-[480px] rounded skeleton-shimmer" />
            <div className="mb-5 h-4 w-2/3 max-w-[320px] rounded skeleton-shimmer" />
            <div className="flex gap-2">
              <div className="h-6 w-16 rounded-full skeleton-shimmer" />
              <div className="h-6 w-20 rounded-full skeleton-shimmer" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function WorksPage() {
  const [works, setWorks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const files = await listFiles("content/works");
        const items = (
          await Promise.all(
            files.map(async (f) => {
              try {
                const { content } = await getFile(f.path);
                const parsed = matter(content);
                return {
                  title: parsed.data.title,
                  date: parsed.data.date,
                  description: parsed.data.description,
                  tags: parsed.data.tags || [],
                  image: parsed.data.image,
                  link: parsed.data.link,
                };
              } catch (e) {
                return null;
              }
            })
          )
        ).filter(Boolean);
        setWorks(items as any[]);
      } catch (err: any) {
        setError(err.message || "Failed to load works");
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
        <header className="mb-16 md:mb-20">
          <h1 className="mb-3 text-[clamp(1.85rem,4.5vw,2.75rem)] font-normal tracking-[-0.025em] text-[var(--fg)]">
            Works
          </h1>
          <p className="text-base text-[var(--fg-secondary)]">
            A timeline of things I&apos;ve built.
          </p>
        </header>
      </FadeIn>

      {loading && <WorksSkeleton />}
      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-500">
          {error}
        </p>
      )}

      {!loading && !error && (
        <StaggerContainer className="relative flex flex-col">
          <div className="absolute left-[5px] top-2 bottom-0 w-px bg-gradient-to-b from-[var(--border)] via-[var(--border)] to-transparent md:left-[6px]" />

          {works.map((work, idx) => (
            <StaggerItem key={idx}>
              <div className="group relative pl-10 md:pl-12">
                <div className="absolute left-0 top-1.5 h-[11px] w-[11px] rounded-full border-2 border-[var(--fg-subtle)] bg-[var(--bg)] transition-all duration-300 group-hover:scale-130 group-hover:border-[var(--fg)] group-hover:bg-[var(--fg)]" />

                <article className="pb-16 md:pb-20">
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
                    {work.date}
                  </p>

                  <h3 className="mb-2 text-xl font-medium tracking-[-0.01em] text-[var(--fg)]">
                    {work.title}
                  </h3>

                  <p className="group/desc relative mb-5 max-w-[560px] text-[15px] leading-relaxed text-[var(--fg-secondary)]">
                    <span className="line-clamp-2">{work.description}</span>
                    {work.description?.length > 80 && (
                      <span className="pointer-events-none absolute left-0 top-full z-10 mt-2 hidden max-w-[400px] rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm shadow-lg backdrop-blur-sm group-hover/desc:block">
                        {work.description}
                      </span>
                    )}
                  </p>

                  {work.tags && work.tags.length > 0 && (
                    <div className="mb-5 flex flex-wrap gap-2">
                      {work.tags.map((tag: string) => (
                        <span
                          key={tag}
                          className="tag-hover cursor-default rounded-full border border-[var(--border)] px-2.5 py-1 text-[11px] font-medium tracking-wide text-[var(--fg-muted)]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {work.link && (
                    <a
                      href={work.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/link inline-flex items-center gap-1.5 text-sm font-medium text-[var(--accent)] transition-colors hover:text-[var(--accent-hover)]"
                    >
                      View project
                      <span className="transition-transform duration-300 group-hover/link:translate-x-0.5">
                        →
                      </span>
                    </a>
                  )}
                </article>
              </div>
            </StaggerItem>
          ))}

          {works.length === 0 && (
            <p className="py-12 text-center text-sm text-[var(--fg-muted)]">
              No works yet.
            </p>
          )}
        </StaggerContainer>
      )}
    </div>
  );
}
