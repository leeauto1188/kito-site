"use client";

import { useState, useEffect, useRef, ChangeEvent, FormEvent } from "react";
import matter from "gray-matter";
import { FadeIn } from "@/components/motion";
import { listFiles, getFile, putFile, deleteFile, toBase64 } from "@/lib/github";

type Tab = "works" | "thoughts";
type Status = "idle" | "loading" | "success" | "error";

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "";
const GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN || "";
const GITHUB_OWNER = process.env.NEXT_PUBLIC_GITHUB_OWNER || "";
const GITHUB_REPO = process.env.NEXT_PUBLIC_GITHUB_REPO || "";

interface WorkForm {
  filename: string;
  title: string;
  date: string;
  description: string;
  tags: string;
  link: string;
  sha?: string;
}

interface ThoughtForm {
  filename: string;
  date: string;
  content: string;
  image: File | null;
  existingImagePath: string | null;
  sha?: string;
}

function Spinner({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

function StatusBanner({
  status,
  message,
  networkDiag,
  onTestConnection,
}: {
  status: Status;
  message: string;
  networkDiag: string;
  onTestConnection: () => void;
}) {
  if (status === "idle" || !message) return null;

  return (
    <div className="mb-6 rounded-xl border px-4 py-3 text-sm transition-all">
      <div className="flex items-center gap-2">
        {status === "loading" && (
          <Spinner className="h-4 w-4 text-[var(--fg-muted)]" />
        )}
        {status === "success" && (
          <span className="text-emerald-400">✓</span>
        )}
        {status === "error" && <span className="text-red-400">✕</span>}
        <p
          className={
            status === "error"
              ? "text-red-400"
              : status === "success"
              ? "text-emerald-400"
              : "text-[var(--fg-muted)]"
          }
        >
          {message}
        </p>
      </div>
      {status === "error" && (
        <button
          onClick={onTestConnection}
          className="mt-2 text-sm text-[var(--accent)] transition-colors hover:text-[var(--accent-hover)]"
        >
          Test GitHub connection →
        </button>
      )}
      {networkDiag && (
        <p
          className={`mt-2 text-xs ${
            networkDiag.includes("OK")
              ? "text-emerald-400"
              : "text-[var(--fg-muted)]"
          }`}
        >
          {networkDiag}
        </p>
      )}
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--fg)] placeholder:text-[var(--fg-subtle)] transition-all duration-200 focus:outline-none focus:border-[var(--fg-muted)] focus:ring-2 focus:ring-[var(--fg-muted)]/10";

const textareaClass =
  "resize-none rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--fg)] placeholder:text-[var(--fg-subtle)] transition-all duration-200 focus:outline-none focus:border-[var(--fg-muted)] focus:ring-2 focus:ring-[var(--fg-muted)]/10";

const btnPrimaryClass =
  "inline-flex items-center gap-2 rounded-lg bg-[var(--fg)] px-5 py-2.5 text-sm font-medium text-[var(--bg)] transition-all duration-200 hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40";

const btnSecondaryClass =
  "rounded-lg border border-[var(--border)] px-5 py-2.5 text-sm font-medium text-[var(--fg-secondary)] transition-all duration-200 hover:bg-[var(--border)]/30";

const btnDangerClass =
  "rounded-lg border border-red-500/20 px-5 py-2.5 text-sm font-medium text-red-400 transition-all duration-200 hover:bg-red-500/10";

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [pwdInput, setPwdInput] = useState("");
  const [pwdError, setPwdError] = useState(false);

  const [tab, setTab] = useState<Tab>("works");

  // Works
  const [worksList, setWorksList] = useState<any[]>([]);
  const [workForm, setWorkForm] = useState<WorkForm>({
    filename: "",
    title: "",
    date: "",
    description: "",
    tags: "",
    link: "",
  });

  // Thoughts
  const [thoughtsList, setThoughtsList] = useState<any[]>([]);
  const [thoughtForm, setThoughtForm] = useState<ThoughtForm>({
    filename: "",
    date: "",
    content: "",
    image: null,
    existingImagePath: null,
  });
  const thoughtFileRef = useRef<HTMLInputElement>(null);

  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [networkDiag, setNetworkDiag] = useState<string>("");

  useEffect(() => {
    if (!authenticated) return;
    if (tab === "works") loadWorks();
    else loadThoughts();
  }, [authenticated, tab]);

  const handleUnlock = (e: FormEvent) => {
    e.preventDefault();
    if (pwdInput === ADMIN_PASSWORD && ADMIN_PASSWORD) {
      setAuthenticated(true);
      setPwdError(false);
    } else {
      setPwdError(true);
    }
  };

  // ---------- Works ----------
  async function loadWorks() {
    setStatus("loading");
    try {
      const files = await listFiles("content/works");
      const items = (
        await Promise.all(
          files.map(async (f) => {
            try {
              const { content } = await getFile(f.path);
              const parsed = matter(content);
              return {
                name: f.name,
                path: f.path,
                sha: f.sha,
                title: parsed.data.title || f.name,
              };
            } catch (e) {
              return null;
            }
          })
        )
      ).filter(Boolean) as any[];
      setWorksList(items);
      setStatus("idle");
      setMessage("");
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message);
    }
  }

  function resetWorkForm() {
    setWorkForm({
      filename: "",
      title: "",
      date: "",
      description: "",
      tags: "",
      link: "",
    });
  }

  async function editWork(item: any) {
    setStatus("loading");
    try {
      const { content, sha } = await getFile(item.path);
      const parsed = matter(content);
      setWorkForm({
        filename: item.name,
        title: parsed.data.title || "",
        date: parsed.data.date || "",
        description: parsed.data.description || "",
        tags: (parsed.data.tags || []).join(", "),
        link: parsed.data.link || "",
        sha,
      });
      setStatus("idle");
      setMessage("");
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message);
    }
  }

  async function saveWork(e: FormEvent) {
    e.preventDefault();
    if (!workForm.title || !workForm.date) return;

    setStatus("loading");
    setMessage("Saving...");

    try {
      const slug =
        workForm.filename.replace(/\.md$/, "") ||
        workForm.title.toLowerCase().replace(/\s+/g, "-");
      const filename = `${slug}.md`;
      const path = `content/works/${filename}`;
      const tags = workForm.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const front = {
        title: workForm.title,
        date: workForm.date,
        description: workForm.description,
        tags,
        link: workForm.link || undefined,
      };

      const yaml = matter.stringify("", front).trim();
      const base64 = toBase64(yaml);

      await putFile(
        path,
        base64,
        workForm.sha ? `Update work: ${filename}` : `Add work: ${filename}`,
        workForm.sha
      );

      setStatus("success");
      setMessage("Saved.");
      resetWorkForm();
      await loadWorks();
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message);
    }
  }

  async function removeWork(item: any) {
    if (!confirm(`Delete "${item.title || item.name}"?`)) return;
    setStatus("loading");
    try {
      await deleteFile(
        item.path,
        item.sha,
        `Delete work: ${item.name}`
      );
      if (workForm.filename === item.name) resetWorkForm();
      await loadWorks();
      setStatus("success");
      setMessage("Deleted.");
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message);
    }
  }

  // ---------- Thoughts ----------
  async function loadThoughts() {
    setStatus("loading");
    try {
      const files = await listFiles("content/thoughts");
      const items = (
        await Promise.all(
          files.map(async (f) => {
            try {
              const { content } = await getFile(f.path);
              const parsed = matter(content);
              return {
                name: f.name,
                path: f.path,
                sha: f.sha,
                date: parsed.data.date,
                preview: parsed.content.trim().slice(0, 60),
              };
            } catch (e) {
              return null;
            }
          })
        )
      ).filter(Boolean) as any[];
      setThoughtsList(items);
      setStatus("idle");
      setMessage("");
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message);
    }
  }

  function resetThoughtForm() {
    setThoughtForm({
      filename: "",
      date: new Date().toISOString().slice(0, 16),
      content: "",
      image: null,
      existingImagePath: null,
    });
    if (thoughtFileRef.current) thoughtFileRef.current.value = "";
  }

  async function editThought(item: any) {
    setStatus("loading");
    try {
      const { content, sha } = await getFile(item.path);
      const parsed = matter(content);
      const rawDate = parsed.data.date;
      const dateStr =
        rawDate instanceof Date
          ? rawDate.toISOString()
          : String(rawDate || "");
      setThoughtForm({
        filename: item.name,
        date: dateStr.slice(0, 16),
        content: parsed.content.trim(),
        image: null,
        existingImagePath: parsed.data.image || null,
        sha,
      });
      if (thoughtFileRef.current) thoughtFileRef.current.value = "";
      setStatus("idle");
      setMessage("");
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message);
    }
  }

  const toBase64Blob = (blob: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onload = () => resolve((reader.result as string).split(",")[1]);
      reader.onerror = reject;
    });

  async function saveThought(e: FormEvent) {
    e.preventDefault();
    if (!thoughtForm.content.trim()) return;

    setStatus("loading");
    setMessage("Saving...");

    try {
      const now = new Date();
      const datePrefix = now.toISOString().split("T")[0];
      const ts = now.getTime();
      const rnd = Math.random().toString(36).slice(2, 6);

      let imagePath = thoughtForm.existingImagePath;

      if (thoughtForm.image) {
        const ext = thoughtForm.image.name.split(".").pop() || "png";
        const imageName = `${ts}-${rnd}.${ext}`;
        imagePath = `/images/thoughts/${imageName}`;
        const imageBase64 = await toBase64Blob(thoughtForm.image);
        await putFile(
          `public${imagePath}`,
          imageBase64,
          `Add thought image: ${imageName}`
        );
      }

      const filename =
        thoughtForm.filename || `${datePrefix}-${ts}-${rnd}.md`;
      const path = `content/thoughts/${filename}`;
      const mdContent = `---\ndate: ${new Date(
        thoughtForm.date
      ).toISOString()}\nimage: ${imagePath || "null"}\n---\n\n${thoughtForm.content.trim()}\n`;
      const base64 = toBase64(mdContent);

      await putFile(
        path,
        base64,
        thoughtForm.sha
          ? `Update thought: ${filename}`
          : `Add thought: ${filename}`,
        thoughtForm.sha
      );

      setStatus("success");
      setMessage("Saved.");
      resetThoughtForm();
      await loadThoughts();
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message);
    }
  }

  async function removeThought(item: any) {
    if (!confirm(`Delete thought "${item.name}"?`)) return;
    setStatus("loading");
    try {
      await deleteFile(
        item.path,
        item.sha,
        `Delete thought: ${item.name}`
      );
      if (thoughtForm.filename === item.name) resetThoughtForm();
      await loadThoughts();
      setStatus("success");
      setMessage("Deleted.");
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message);
    }
  }

  async function testConnection() {
    setNetworkDiag("Testing...");
    try {
      const res = await fetch(
        `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}`,
        {
          headers: {
            Authorization: `Bearer ${GITHUB_TOKEN}`,
            Accept: "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
          },
        }
      );
      if (res.ok) {
        setNetworkDiag("GitHub API connection: OK");
      } else {
        const err = await res.json().catch(() => ({}));
        setNetworkDiag(
          `GitHub API error: ${res.status} ${err.message || ""}`
        );
      }
    } catch (e: any) {
      setNetworkDiag(
        `Network blocked: ${e.message || "Failed to fetch"}. Check browser extensions (AdBlock/uBlock) or network proxy.`
      );
    }
  }

  // Image preview URL
  const thoughtImagePreview = thoughtForm.image
    ? URL.createObjectURL(thoughtForm.image)
    : thoughtForm.existingImagePath || null;

  // ---------- UI ----------
  if (!authenticated) {
    return (
      <div className="flex min-h-[50vh] flex-col justify-center">
        <FadeIn>
          <h1 className="mb-8 text-2xl font-medium tracking-[-0.02em] text-[var(--fg)]">
            Admin
          </h1>
        </FadeIn>
        <FadeIn delay={0.06}>
          <form onSubmit={handleUnlock} className="flex flex-col gap-4">
            <input
              type="password"
              value={pwdInput}
              onChange={(e) => setPwdInput(e.target.value)}
              placeholder="Password"
              className={inputClass}
            />
            {pwdError && (
              <p className="text-sm text-red-400">Incorrect password.</p>
            )}
            <button type="submit" className={btnPrimaryClass}>
              Enter
            </button>
          </form>
        </FadeIn>
      </div>
    );
  }

  return (
    <div>
      <FadeIn>
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-medium tracking-[-0.02em] text-[var(--fg)]">
            Admin
          </h1>
          <button
            onClick={() => setAuthenticated(false)}
            className="text-sm text-[var(--fg-muted)] transition-colors duration-200 hover:text-[var(--fg)]"
          >
            Lock
          </button>
        </div>
      </FadeIn>

      <FadeIn delay={0.06}>
        <div className="mb-8 flex gap-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1">
          {(["works", "thoughts"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium capitalize transition-all duration-200 ${
                tab === t
                  ? "bg-[var(--fg)] text-[var(--bg)] shadow-sm"
                  : "text-[var(--fg-muted)] hover:text-[var(--fg)]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </FadeIn>

      {/* Status */}
      <StatusBanner
        status={status}
        message={message}
        networkDiag={networkDiag}
        onTestConnection={testConnection}
      />

      {tab === "works" && (
        <div className="grid gap-8 md:grid-cols-[1fr,1.2fr]">
          {/* List */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-[0.1em] text-[var(--fg-muted)]">
                Works
              </h2>
              <button
                onClick={resetWorkForm}
                className="text-sm text-[var(--accent)] transition-colors duration-200 hover:text-[var(--accent-hover)]"
              >
                + New
              </button>
            </div>
            <div className="flex max-h-[60vh] flex-col gap-1 overflow-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2">
              {worksList.map((w) => (
                <div
                  key={w.name}
                  onClick={() => editWork(w)}
                  className={`cursor-pointer rounded-lg px-3 py-2.5 transition-all duration-200 ${
                    workForm.filename === w.name
                      ? "bg-[var(--fg)]/10"
                      : "hover:bg-[var(--border)]/50"
                  }`}
                >
                  <p className="text-sm font-medium text-[var(--fg)]">
                    {w.title}
                  </p>
                  <p className="text-xs text-[var(--fg-muted)]">{w.name}</p>
                </div>
              ))}
              {worksList.length === 0 && (
                <p className="px-3 py-4 text-sm text-[var(--fg-muted)]">
                  No works yet.
                </p>
              )}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={saveWork} className="flex flex-col gap-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.1em] text-[var(--fg-muted)]">
              {workForm.sha ? "Edit Work" : "New Work"}
            </h2>
            <input
              type="text"
              value={workForm.title}
              onChange={(e) =>
                setWorkForm({ ...workForm, title: e.target.value })
              }
              placeholder="Title"
              className={inputClass}
            />
            <input
              type="text"
              value={workForm.date}
              onChange={(e) =>
                setWorkForm({ ...workForm, date: e.target.value })
              }
              placeholder="Date (e.g. 2025-06)"
              className={inputClass}
            />
            <textarea
              value={workForm.description}
              onChange={(e) =>
                setWorkForm({ ...workForm, description: e.target.value })
              }
              placeholder="Description"
              rows={4}
              className={textareaClass}
            />
            <input
              type="text"
              value={workForm.tags}
              onChange={(e) =>
                setWorkForm({ ...workForm, tags: e.target.value })
              }
              placeholder="Tags (comma separated)"
              className={inputClass}
            />
            <input
              type="text"
              value={workForm.link}
              onChange={(e) =>
                setWorkForm({ ...workForm, link: e.target.value })
              }
              placeholder="Project link"
              className={inputClass}
            />

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={
                  status === "loading" || !workForm.title || !workForm.date
                }
                className={btnPrimaryClass}
              >
                {status === "loading" && (
                  <Spinner className="h-4 w-4 text-[var(--bg)]" />
                )}
                {workForm.sha ? "Update" : "Save"}
              </button>
              {workForm.sha && (
                <button
                  type="button"
                  onClick={() => {
                    const item = worksList.find(
                      (w) => w.name === workForm.filename
                    );
                    if (item) removeWork(item);
                  }}
                  className={btnDangerClass}
                >
                  Delete
                </button>
              )}
              <button
                type="button"
                onClick={resetWorkForm}
                className={btnSecondaryClass}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {tab === "thoughts" && (
        <div className="grid gap-8 md:grid-cols-[1fr,1.2fr]">
          {/* List */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-[0.1em] text-[var(--fg-muted)]">
                Thoughts
              </h2>
              <button
                onClick={resetThoughtForm}
                className="text-sm text-[var(--accent)] transition-colors duration-200 hover:text-[var(--accent-hover)]"
              >
                + New
              </button>
            </div>
            <div className="flex max-h-[60vh] flex-col gap-1 overflow-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2">
              {thoughtsList.map((t) => (
                <div
                  key={t.name}
                  onClick={() => editThought(t)}
                  className={`cursor-pointer rounded-lg px-3 py-2.5 transition-all duration-200 ${
                    thoughtForm.filename === t.name
                      ? "bg-[var(--fg)]/10"
                      : "hover:bg-[var(--border)]/50"
                  }`}
                >
                  <p className="text-sm font-medium text-[var(--fg)] line-clamp-2">
                    {t.preview || "(empty)"}
                  </p>
                  <p className="text-xs text-[var(--fg-muted)]">{t.name}</p>
                </div>
              ))}
              {thoughtsList.length === 0 && (
                <p className="px-3 py-4 text-sm text-[var(--fg-muted)]">
                  No thoughts yet.
                </p>
              )}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={saveThought} className="flex flex-col gap-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.1em] text-[var(--fg-muted)]">
              {thoughtForm.sha ? "Edit Thought" : "New Thought"}
            </h2>
            <input
              type="datetime-local"
              value={thoughtForm.date}
              onChange={(e) =>
                setThoughtForm({ ...thoughtForm, date: e.target.value })
              }
              className={inputClass}
            />
            <textarea
              value={thoughtForm.content}
              onChange={(e) =>
                setThoughtForm({ ...thoughtForm, content: e.target.value })
              }
              placeholder="What's on your mind..."
              rows={6}
              className={textareaClass}
            />

            {/* Image upload with preview */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  ref={thoughtFileRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setThoughtForm({
                      ...thoughtForm,
                      image: e.target.files?.[0] || null,
                    })
                  }
                  className="hidden"
                  id="thought-image"
                />
                <label
                  htmlFor="thought-image"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--border)] px-4 py-2 text-sm text-[var(--fg-secondary)] transition-all duration-200 hover:bg-[var(--border)]/30"
                >
                  <span>📎</span>
                  <span>
                    {thoughtForm.image
                      ? thoughtForm.image.name
                      : thoughtForm.existingImagePath
                      ? "Replace image"
                      : "Attach image"}
                  </span>
                </label>
                {(thoughtForm.image || thoughtForm.existingImagePath) && (
                  <button
                    type="button"
                    onClick={() => {
                      setThoughtForm({
                        ...thoughtForm,
                        image: null,
                        existingImagePath: null,
                      });
                      if (thoughtFileRef.current)
                        thoughtFileRef.current.value = "";
                    }}
                    className="text-sm text-[var(--fg-muted)] transition-colors duration-200 hover:text-[var(--fg)]"
                  >
                    Remove
                  </button>
                )}
              </div>

              {/* Image preview */}
              {thoughtImagePreview && (
                <div className="overflow-hidden rounded-xl border border-[var(--border)]">
                  <img
                    src={thoughtImagePreview}
                    alt="Preview"
                    className="max-h-48 w-full object-cover"
                  />
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={
                  status === "loading" || !thoughtForm.content.trim()
                }
                className={btnPrimaryClass}
              >
                {status === "loading" && (
                  <Spinner className="h-4 w-4 text-[var(--bg)]" />
                )}
                {thoughtForm.sha ? "Update" : "Save"}
              </button>
              {thoughtForm.sha && (
                <button
                  type="button"
                  onClick={() => {
                    const item = thoughtsList.find(
                      (t) => t.name === thoughtForm.filename
                    );
                    if (item) removeThought(item);
                  }}
                  className={btnDangerClass}
                >
                  Delete
                </button>
              )}
              <button
                type="button"
                onClick={resetThoughtForm}
                className={btnSecondaryClass}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
