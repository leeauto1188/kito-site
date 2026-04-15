import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface Work {
  title: string;
  date: string;
  description: string;
  tags: string[];
  image?: string;
  link?: string;
}

export interface Thought {
  date: string;
  content: string;
  image?: string | null;
}

const contentDir = path.join(process.cwd(), "content");

export function getWorks(): Work[] {
  const worksDir = path.join(contentDir, "works");
  const files = fs.readdirSync(worksDir).filter((f) => f.endsWith(".md"));

  const works = files.map((filename) => {
    const filePath = path.join(worksDir, filename);
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const { data } = matter(fileContent);
    return data as Work;
  });

  return works.sort((a, b) => b.date.localeCompare(a.date));
}

export function getThoughts(): Thought[] {
  const thoughtsDir = path.join(contentDir, "thoughts");
  const files = fs.readdirSync(thoughtsDir).filter((f) => f.endsWith(".md"));

  const thoughts = files.map((filename) => {
    const filePath = path.join(thoughtsDir, filename);
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(fileContent);
    return {
      date: data.date,
      image: data.image,
      content: content.trim(),
    } as Thought;
  });

  return thoughts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
