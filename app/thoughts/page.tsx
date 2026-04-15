import Link from "next/link";
import { getThoughts } from "@/lib/content";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion";

export default function ThoughtsPage() {
  const thoughts = getThoughts();

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
        <header className="mb-14 md:mb-16">
          <h1 className="mb-3 text-[clamp(1.85rem,4.5vw,2.75rem)] font-medium tracking-[-0.025em] text-[var(--fg)]">
            Thoughts
          </h1>
          <p className="text-base text-[var(--fg-muted)]">
            Fleeting notes and half-baked ideas.
          </p>
        </header>
      </FadeIn>

      <StaggerContainer className="flex flex-col divide-y divide-[var(--border)]">
        {thoughts.map((thought) => {
          const formattedDate = new Date(thought.date).toLocaleDateString(
            "en-US",
            {
              month: "short",
              day: "numeric",
              year: "numeric",
            }
          );

          return (
            <StaggerItem key={thought.date}>
              <article className="py-10 md:py-12">
                <div className="mb-5 flex items-center gap-3">
                  <span className="h-px w-6 bg-[var(--border)]" />
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
                      className="w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                )}
              </article>
            </StaggerItem>
          );
        })}
      </StaggerContainer>
    </>
  );
}
