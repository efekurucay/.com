import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { person as staticPerson, about as staticAbout, social as staticSocial } from "@/app/resources/content";
import {
  getPerson,
  getAbout,
  getSocialLinks,
  getExperiences,
  getEducation,
  getVisiblePosts,
  getVisibleProjects,
  type Experience,
  type Education,
  type SocialLink,
} from "@/lib/firestoreService";
import { withTimeout } from "@/lib/utils";

function getMdxFiles(dir: string): string[] {
  try {
    return fs.readdirSync(dir).filter((file) => path.extname(file) === ".mdx");
  } catch (e) {
    return [];
  }
}

function readMdxFile(filePath: string): string {
  try {
    const rawContent = fs.readFileSync(filePath, "utf-8");
    const { content } = matter(rawContent);
    return content;
  } catch (e) {
    return "";
  }
}

export async function getPortfolioContext(): Promise<string> {
  let context = "";

  const [personRes, aboutRes, socialRes, workRes, eduRes, postsRes, projectsRes] =
    await Promise.allSettled([
      withTimeout(getPerson()),
      withTimeout(getAbout()),
      withTimeout(getSocialLinks()),
      withTimeout(getExperiences("work")),
      withTimeout(getEducation()),
      withTimeout(getVisiblePosts()),
      withTimeout(getVisibleProjects()),
    ]);

  const person   = personRes.status   === "fulfilled" ? personRes.value   : null;
  const about    = aboutRes.status    === "fulfilled" ? aboutRes.value    : null;
  const social   = socialRes.status   === "fulfilled" ? socialRes.value   : null;
  const workExps = workRes.status     === "fulfilled" ? (workRes.value ?? []) : [];
  const education = eduRes.status     === "fulfilled" ? (eduRes.value ?? []) : [];
  const posts    = postsRes.status    === "fulfilled" ? (postsRes.value ?? []) : [];
  const projects = projectsRes.status === "fulfilled" ? (projectsRes.value ?? []) : [];

  const personName    = person ? `${person.firstName} ${person.lastName}` : staticPerson.name;
  const personRole    = person?.role     || staticPerson.role;
  const personLocation = person?.location || staticPerson.location;
  const socialLinks = ((social && social.length > 0) ? social : staticSocial)
    .map((s: { name: string; link: string }) => `${s.name}: ${s.link}`).join(", ");

  context = `
    Personal Information:
    Name: ${personName}
    Role: ${personRole}
    Location: ${personLocation}
    Contact & Social Media: ${socialLinks}
    About: ${about?.introDescription || ""}
    Work Experience: ${workExps.map((exp: Experience) => `Worked at ${exp.company} as ${exp.role}. Achievements: ${(exp.achievements || []).join(", ")}`).join(". ")}
    Education: ${education.map((inst: Education) => `${inst.name} - ${inst.description}`).join(". ")}

    ---
    `;

  if (projects.length > 0) {
    context += "\nProjects:\n";
    projects.forEach((p) => {
      context += `Project (${p.title}):\n${p.content}\n---\n`;
    });
  }

  if (posts.length > 0) {
    context += "\nBlog Posts:\n";
    posts.forEach((p) => {
      context += `Blog Post (${p.title}):\n${p.content}\n---\n`;
    });
  }

  return context;
}