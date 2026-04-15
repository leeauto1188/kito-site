import Link from "next/link";
import { getWorks } from "@/lib/content";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion";

export default function WorksPage() {
  const works = getWorks();

  return (
    <>
      <FadeIn>
        <Link
          href="/"
          className="mb-12 inline-flex items-center gap-2 text-sm text-[var(--fg-muted)] transition-colors hover:text-[var(--fg)]"
        >
          <span>←</span>
          <span>Back</span>
        </Link>
      </FadeIn>

      <FadeIn delay={0.06}>
        <header className="mb-16 md:mb-20">
          <h1 className="mb-3 text-[clamp(1.85rem,4.5vw,2.75rem)] font-medium tracking-[-0.025em] text-[var(--fg)]">
            Works
          </h1>
          <p className="text-base text-[var(--fg-muted)]">
            A timeline of things I&apos;ve built.
          </p>
        </header>
      </FadeIn>

      <StaggerContainer className="relative flex flex-col">
        {/* timeline line */}
        <div className="absolute left-[5px] top-2 bottom-0 w-px bg-[var(--border)] md:left-[6px]" />

        {works.map((work) => (
          <StaggerItem key={work.title}>
            <div className="relative pl-10 md:pl-12">
              {/* dot */}
              <div className="absolute left-0 top-1.5 h-[11px] w-[11px] rounded-full border-2 border-[var(--fg-subtle)] bg-[var(--bg)]" />

              <article className="pb-16 md:pb-20">
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
                  {work.date}
                </p>

                <h3 className="mb-2 text-xl font-medium tracking-[-0.01em] text-[var(--fg)]">
                  {work.title}
                </h3>

                <p className="group relative mb-5 max-w-[560px] text-[15px] leading-relaxed text-[var(--fg-secondary)]">
                  <span className="line-clamp-2">{work.description}</span>
                  {work.description.length > 80 && (
                    <span className="pointer-events-none absolute left-0 top-full z-10 mt-2 hidden max-w-[400px] rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-sm shadow-lg group-hover:block">
                      {work.description}
                    </span>
                  )}
                </p>

                {work.tags && work.tags.length > 0 && (
                  <div className="mb-5 flex flex-wrap gap-2">
                    {work.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-[var(--border)] px-2.5 py-1 text-[11px] font-medium tracking-wide text-[var(--fg-muted)]"
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
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--accent)] transition-colors hover:text-[var(--accent-hover)]"
                  >
                    View project
                    <span>→</span>
                  </a>
                )}
              </article>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </>
  );
}
