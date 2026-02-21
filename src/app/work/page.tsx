import { Column } from "@/once-ui/components";
import { Projects } from "@/components/work/Projects";
import { baseURL } from "@/app/resources";
import { getWorkSettings, getVisibleProjects, getPerson } from "@/lib/firestoreService";
import { getPosts } from "@/app/utils/utils";
import { person as staticPerson, work as staticWork } from "@/app/resources/content";

export const revalidate = 60;

export async function generateMetadata() {
  let workSettings;
  try { workSettings = await getWorkSettings(); } catch { }
  const title = workSettings?.title || staticWork.title;
  const description = workSettings?.description || staticWork.description;
  const ogImage = `https://${baseURL}/og?title=${encodeURIComponent(title)}`;
  return {
    title, description,
    openGraph: { title, description, type: "website", url: `https://${baseURL}/work/`, images: [{ url: ogImage, alt: title }] },
    twitter: { card: "summary_large_image" as const, title, description, images: [ogImage] },
  };
}

export default async function Work() {
  let personName = staticPerson.name;
  let workSettings = { title: staticWork.title, description: staticWork.description };
  let allProjects: any[] = [];

  try {
    const [person, ws, projects] = await Promise.all([
      getPerson(), getWorkSettings(), getVisibleProjects(),
    ]);
    if (person) personName = `${person.firstName} ${person.lastName}`;
    if (ws) workSettings = { title: ws.title, description: ws.description };
    if (projects.length > 0) {
      allProjects = projects.map((p) => ({
        slug: p.slug,
        metadata: { title: p.title, summary: p.summary, images: p.images, image: p.image || "" },
      }));
    }
  } catch { }

  if (allProjects.length === 0) {
    allProjects = getPosts(["src", "app", "work", "projects"]);
  }

  return (
    <Column maxWidth="m">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            headline: workSettings.title,
            description: workSettings.description,
            url: `https://${baseURL}/projects`,
            image: `${baseURL}/og?title=Design%20Projects`,
            author: { "@type": "Person", name: personName },
            hasPart: allProjects.map((project) => ({
              "@type": "CreativeWork",
              headline: project.metadata.title,
              description: project.metadata.summary,
              url: `https://${baseURL}/projects/${project.slug}`,
              image: project.metadata.images?.[0] ? `${baseURL}/${project.metadata.images[0]}` : "",
            })),
          }),
        }}
      />
      <Projects />
    </Column>
  );
}
