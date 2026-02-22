import Link from "next/link";
import Image from "next/image";
import { getVisibleProjects } from "@/lib/firestoreService";
import { Grid, Flex, Heading, Text, RevealFx } from "@/once-ui/components";

export async function Projects() {
  let allProjects: any[] = [];

  try {
    const firestoreProjects = await getVisibleProjects();
    if (firestoreProjects.length > 0) {
      allProjects = firestoreProjects.map((p) => ({
        slug: p.slug,
        metadata: {
          title: p.title,
          summary: p.summary,
          images: p.images || [],
          image: p.image || "",
          publishedAt: p.publishedAt,
          team: p.team || [],
          tag: p.tags?.[0] || "",
          link: p.link || "",
        },
        content: p.content,
      }));
    }
  } catch { }

  return (
    <Grid columns="2" mobileColumns="1" gap="xl">
      {allProjects.map((project, index) => (
        <RevealFx delay={index * 0.1} key={project.slug}>
          <Link href={`/work/${project.slug}`} style={{ textDecoration: "none" }}>
            <Flex
              direction="column"
              gap="m"
              style={{ height: "100%" }}
            >
              <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', borderRadius: 'var(--radius-l)', overflow: 'hidden' }}>
                {project.metadata.images?.[0] ? (
                  <Image
                    src={project.metadata.images[0]}
                    alt={project.metadata.title}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: 'var(--color-surface-neutral-strong)', position: 'absolute', top: 0, left: 0 }} />
                )}
              </div>
              <Flex direction="column" gap="xs">
                <Heading as="h3" variant="heading-strong-m">
                  {project.metadata.title}
                </Heading>
                <Text onBackground="neutral-weak">
                  {project.metadata.summary}
                </Text>
              </Flex>
            </Flex>
          </Link>
        </RevealFx>
      ))}
    </Grid>
  );
}
