import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { person, about, work, blog, social } from "@/app/resources/content";

function getMdxFiles(dir: string): string[] {
  try {
    return fs.readdirSync(dir).filter((file) => path.extname(file) === ".mdx");
  } catch (e) {
    return []; // Return empty array if directory doesn't exist
  }
}

function readMdxFile(filePath: string): string {
  try {
    const rawContent = fs.readFileSync(filePath, "utf-8");
    const { content } = matter(rawContent);
    return content;
  } catch (e) {
    return ""; // Return empty string if file can't be read
  }
}

export function getPortfolioContext(): string {
  const socialLinks = social.map(s => `${s.name}: ${s.link}`).join(', ');

  let context = `
    Kişisel Bilgiler:
    Ad: ${person.name}
    Rol: ${person.role}
    Medeni Durum: Evli
    Konum: ${person.location}
    İletişim ve Sosyal Medya: ${socialLinks}
    Hakkında: ${about.intro.description}
    İş Deneyimleri: ${about.work.experiences.map(exp => `${exp.company} şirketinde ${exp.role} olarak çalıştı. Başarıları: ${exp.achievements.join(', ')}`).join('. ')}
    Eğitim: ${about.studies.institutions.map(inst => `${inst.name} - ${inst.description}`).join('. ')}

    ---
  `;

  const workDir = path.join(process.cwd(), "src", "app", "work", "projects");
  const blogDir = path.join(process.cwd(), "src", "app", "blog", "posts");

  const workFiles = getMdxFiles(workDir);
  const blogFiles = getMdxFiles(blogDir);

  context += "\nProjeler:\n";
  workFiles.forEach(file => {
    const content = readMdxFile(path.join(workDir, file));
    context += `Proje (${file}):\n${content}\n---\n`;
  });

  context += "\nBlog Yazıları:\n";
  blogFiles.forEach(file => {
    const content = readMdxFile(path.join(blogDir, file));
    context += `Blog Yazısı (${file}):\n${content}\n---\n`;
  });

  return context;
} 