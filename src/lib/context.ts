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
} from "@/lib/firestoreService";

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

  try {
    // Try Firestore first
    const [person, about, social, workExps, education, posts, projects] = await Promise.all([
      getPerson(),
      getAbout(),
      getSocialLinks(),
      getExperiences("work"),
      getEducation(),
      getVisiblePosts(),
      getVisibleProjects(),
    ]);

    const personName = person ? `${person.firstName} ${person.lastName}` : staticPerson.name;
    const personRole = person?.role || staticPerson.role;
    const personLocation = person?.location || staticPerson.location;
    const socialLinks = (social.length > 0 ? social : staticSocial).map((s: any) => `${s.name}: ${s.link}`).join(", ");

    context = `
    Personal Information:
    Name: ${personName}
    Role: ${personRole}
    Location: ${personLocation}
    Contact & Social Media: ${socialLinks}
    About: ${about?.introDescription || ""}
    Work Experience: ${workExps.map((exp: any) => `Worked at ${exp.company} as ${exp.role}. Achievements: ${(exp.achievements || []).join(", ")}`).join(". ")}
    Education: ${education.map((inst: any) => `${inst.name} - ${inst.description}`).join(". ")}

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
  } catch (e) {
    // Fallback to static files
  }

  // Static fallback
  const socialLinks = staticSocial.map(s => `${s.name}: ${s.link}`).join(', ');

  context = `
    Personal Information:
    Name: ${staticPerson.name}
    Role: ${staticPerson.role}
    Location: ${staticPerson.location}
    Contact & Social Media: ${socialLinks}
    About: ${staticAbout.intro.description}
    Work Experience: ${staticAbout.work.experiences.map((exp: any) => `Worked at ${exp.company} as ${exp.role}. Achievements: ${exp.achievements.join(', ')}`).join('. ')}
    Education: ${staticAbout.studies.institutions.map((inst: any) => `${inst.name} - ${inst.description}`).join('. ')}

    ---
  `;

  const workDir = path.join(process.cwd(), "src", "app", "work", "projects");
  const blogDir = path.join(process.cwd(), "src", "app", "blog", "posts");

  const workFiles = getMdxFiles(workDir);
  const blogFiles = getMdxFiles(blogDir);

  context += "\nProjects:\n";
  workFiles.forEach(file => {
    const content = readMdxFile(path.join(workDir, file));
    context += `Project (${file}):\n${content}\n---\n`;
  });

  context += "\nBlog Posts:\n";
  blogFiles.forEach(file => {
    const content = readMdxFile(path.join(blogDir, file));
    context += `Blog Post (${file}):\n${content}\n---\n`;
  });

  return context;
}