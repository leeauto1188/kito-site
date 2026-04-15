const TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN || "";
const OWNER = process.env.NEXT_PUBLIC_GITHUB_OWNER || "";
const REPO = process.env.NEXT_PUBLIC_GITHUB_REPO || "";
const BRANCH = process.env.NEXT_PUBLIC_GITHUB_BRANCH || "main";

export interface GitHubFile {
  name: string;
  path: string;
  sha: string;
  type: "file" | "dir";
  download_url?: string;
}

function headers() {
  return {
    Authorization: `Bearer ${TOKEN}`,
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

export async function listFiles(dirPath: string): Promise<GitHubFile[]> {
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${dirPath}?ref=${BRANCH}`;
  const res = await fetch(url, { headers: headers() });
  if (!res.ok) {
    if (res.status === 404) return [];
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `GitHub list error: ${res.status}`);
  }
  const data = await res.json();
  return Array.isArray(data) ? data.filter((d: any) => d.type === "file") : [];
}

export async function getFile(path: string): Promise<{ content: string; sha: string }> {
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}?ref=${BRANCH}`;
  const res = await fetch(url, { headers: headers() });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `GitHub get error: ${res.status}`);
  }
  const data = await res.json();
  const content = atob(data.content.replace(/\n/g, ""));
  return { content, sha: data.sha };
}

export async function putFile(path: string, contentBase64: string, message: string, sha?: string) {
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`;
  const body: any = {
    message,
    content: contentBase64,
    branch: BRANCH,
  };
  if (sha) body.sha = sha;
  const res = await fetch(url, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `GitHub put error: ${res.status}`);
  }
  return res.json();
}

export async function deleteFile(path: string, sha: string, message: string) {
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: headers(),
    body: JSON.stringify({ message, sha, branch: BRANCH }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `GitHub delete error: ${res.status}`);
  }
  return res.json();
}

export function toBase64(str: string): string {
  return btoa(unescape(encodeURIComponent(str)));
}
