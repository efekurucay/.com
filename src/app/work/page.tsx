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
  let personData: any;
  let workData: any;
  let allProjects: any[] = [];

  try {
    const [person, ws, projects] = await Promise.all([
      getPerson(), getWorkSettings(), getVisibleProjects(),
    ]);
    personData = person;
    workData = ws;
    if (projects.length > 0) {
      allProjects = projects.map((p) => ({
        slug: p.slug,
        metadata: { title: p.title, summary: p.summary, images: p.images, image: p.image || "" },
      }));
    }
  } catch { }

  if (!personData) personData = { ...staticPerson, name: staticPerson.name };
  else personData.name = `${personData.firstName} ${personData.lastName}`;

  if (!workData) workData = staticWork;

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
            headline: workData.title,
            description: workData.description,
            url: `https://${baseURL}/projects`,
            image: `${baseURL}/og?title=Design%20Projects`,
            author: { "@type": "Person", name: personData.name },
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
