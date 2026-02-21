import { notFound } from "next/navigation";
import { Column, Flex, Heading, SmartImage, Text, Button, Avatar } from "@/once-ui/components";
import { baseURL } from "@/app/resources";
import { person as staticPerson } from "@/app/resources/content";
import { formatDate } from "@/app/utils/formatDate";
import { getProjectBySlug, getPerson } from "@/lib/firestoreService";
import { getPosts } from "@/app/utils/utils";
import ReactMarkdown from "react-markdown";

export const revalidate = 60;

interface WorkProjectParams {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: WorkProjectParams) {
  const { slug } = await params;
  let project: any = null;

  try {
    project = await getProjectBySlug(slug);
  } catch { }

  if (!project) {
    try {
      const allProjects = getPosts(["src", "app", "work", "projects"]);
      const fileProject = allProjects.find((p) => p.slug === slug);
      if (fileProject) {
        project = { title: fileProject.metadata.title, summary: fileProject.metadata.summary, images: fileProject.metadata.images };
      }
    } catch { }
  }

  if (!project) return { title: "Project not found" };

  return {
    title: project.title,
    description: project.summary,
    openGraph: {
      title: project.title,
      description: project.summary,
      type: "article",
      url: `https://${baseURL}/work/${slug}`,
      images: project.images?.[0] ? [{ url: project.images[0], alt: project.title }] : [],
    },
  };
}

export default async function WorkProject({ params }: WorkProjectParams) {
  const { slug } = await params;
  let project: any = null;
  let personData: any;

  try {
    project = await getProjectBySlug(slug);
    personData = await getPerson();
  } catch { }

  if (!project) {
    try {
      const allProjects = getPosts(["src", "app", "work", "projects"]);
      const fileProject = allProjects.find((p) => p.slug === slug);
      if (fileProject) {
        project = {
          title: fileProject.metadata.title,
          content: fileProject.content,
          images: fileProject.metadata.images || [],
          image: fileProject.metadata.image || "",
          summary: fileProject.metadata.summary,
          publishedAt: fileProject.metadata.publishedAt,
          team: fileProject.metadata.team || [],
          link: fileProject.metadata.link || "",
        };
      }
    } catch { }
  }

  if (!project) notFound();

  const person = personData
    ? { name: `${personData.firstName} ${personData.lastName}`, avatar: personData.avatar }
    : { name: staticPerson.name, avatar: staticPerson.avatar };

  return (
    <Column as="section" maxWidth="m" horizontal="center" gap="l" paddingY="l">
      <Column maxWidth="xs" gap="16">
        <Button href="/work" variant="tertiary" size="s" prefixIcon="chevronLeft">
          Projects
        </Button>
        <Heading variant="display-strong-s">{project.title}</Heading>
      </Column>

      {project.images?.[0] && (
        <SmartImage
          priority
          maxWidth={40}
          className="my-20"
          sizes="(max-width: 768px) 100vw, 720px"
          border="neutral-alpha-weak"
          radius="m"
          src={project.images[0]}
          alt={project.title}
          aspectRatio="16 / 9"
        />
      )}

      <Flex gap="12" marginBottom="24" vertical="center">
        {person.avatar && <Avatar size="s" src={person.avatar} />}
        <Text variant="body-default-s" onBackground="neutral-weak">
          {formatDate(project.publishedAt)}
        </Text>
        <Text variant="body-default-s" onBackground="neutral-weak">
          {person.name}
        </Text>
      </Flex>

      {project.team && project.team.length > 0 && (
        <Column gap="12" marginBottom="24">
          <Text variant="label-default-s" onBackground="neutral-weak">
            Team
          </Text>
          <Flex gap="12" wrap>
            {project.team.map((member: any, i: number) => (
              <Flex key={i} gap="8" vertical="center">
                {member.avatar && <Avatar size="s" src={member.avatar} />}
                <Column>
                  <Text variant="body-default-s">{member.name}</Text>
                  <Text variant="body-default-xs" onBackground="neutral-weak">{member.role}</Text>
                </Column>
              </Flex>
            ))}
          </Flex>
        </Column>
      )}

      <Column as="article" fillWidth maxWidth="xs" gap="m">
        <div className="prose">
          <ReactMarkdown>{project.content}</ReactMarkdown>
        </div>
      </Column>
    </Column>
  );
}
