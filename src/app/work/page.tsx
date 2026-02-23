import { Column } from "@/once-ui/components";
import { Projects } from "@/components/work/Projects";
import { baseURL } from "@/app/resources";
import { getWorkSettings, getVisibleProjects, getPerson } from "@/lib/firestoreService";
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

function withTimeout<T>(promise: Promise<T>, ms = 5000): Promise<T | null> {
  return Promise.race([
    promise,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), ms)),
  ]);
}

export default async function Work() {
  let personData: any;
  let workData: any;
  let allProjects: any[] = [];

  const [personRes, wsRes, projectsRes] = await Promise.allSettled([
    withTimeout(getPerson()),
    withTimeout(getWorkSettings()),
    withTimeout(getVisibleProjects()),
  ]);

  personData  = personRes.status   === "fulfilled" ? personRes.value   : null;
  workData    = wsRes.status       === "fulfilled" ? wsRes.value       : null;
  const projects = projectsRes.status === "fulfilled" ? projectsRes.value : null;

  if (projects && projects.length > 0) {
    allProjects = projects.map((p) => ({
      slug: p.slug,
      metadata: { title: p.title, summary: p.summary, images: p.images, image: p.image || "" },
    }));
  }

  if (!personData) personData = { ...staticPerson, name: staticPerson.name };
  else personData.name = `${personData.firstName} ${personData.lastName}`;

  if (!workData) workData = staticWork;

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
