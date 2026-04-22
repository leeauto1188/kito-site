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

const gradients = [
  "from-stone-200 to-stone-300",
  "from-neutral-200 to-stone-300",
  "from-warm-gray-200 to-stone-300",
  "from-gray-200 to-stone-300",
  "from-zinc-200 to-stone-300",
];

function getGradient(title: string) {
  const idx = title.charCodeAt(0) % gradients.length;
  return gradients[idx];
}

function WorksSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]"
        >
          <div className="aspect-[16/10] skeleton-shimmer" />
          <div className="p-5">
            <div className="mb-2 h-5 w-3/4 rounded skeleton-shimmer" />
            <div className="mb-4 h-4 w-full rounded skeleton-shimmer" />
            <div className="flex gap-2">
              <div className="h-6 w-14 rounded-full skeleton-shimmer" />
              <div className="h-6 w-16 rounded-full skeleton-shimmer" />
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
        <header className="mb-14 md:mb-16">
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
        <StaggerContainer className="grid gap-5 sm:grid-cols-2">
          {works.map((work, idx) => (
            <StaggerItem key={idx}>
              <a
                href={work.link || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="group block overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                {/* Cover image or gradient fallback */}
                <div className="relative aspect-[16/10] overflow-hidden">
                  {work.image ? (
                    <img
                      src={work.image}
                      alt={work.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div
                      className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${getGradient(
                        work.title
                      )}`}
                    >
                      <span className="text-4xl font-light tracking-tight text-[var(--fg-subtle)]">
                        {work.title?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                  )}
                  {/* Hover overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/5" />
                </div>

                {/* Card content */}
                <div className="p-5">
                  <div className="mb-1 flex items-center justify-between">
                    <h3 className="text-lg font-medium tracking-[-0.01em] text-[var(--fg)]">
                      {work.title}
                    </h3>
                    <span className="text-[var(--fg-subtle)] transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-[var(--fg-muted)]">
                      →
                    </span>
                  </div>

                  <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-[var(--fg-secondary)]">
                    {work.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1.5">
                      {work.tags?.map((tag: string) => (
                        <span
                          key={tag}
                          className="rounded-full bg-[var(--bg)] px-2 py-0.5 text-[11px] font-medium tracking-wide text-[var(--fg-muted)]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--fg-subtle)]">
                      {work.date}
                    </span>
                  </div>
                </div>
              </a>
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}
    </div>
  );
}
