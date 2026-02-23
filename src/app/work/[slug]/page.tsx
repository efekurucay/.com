import { notFound } from "next/navigation";
import { Avatar, Button, Column, Flex, Heading, Line, SmartImage, Tag, Text } from "@/once-ui/components";
import { baseURL } from "@/app/resources";
import { person as staticPerson } from "@/app/resources/content";
import { formatDate } from "@/app/utils/formatDate";
import { getProjectBySlug, getPerson } from "@/lib/firestoreService";
import ReactMarkdown from "react-markdown";
import { withTimeout } from "@/lib/utils";

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

  const [projRes, personRes] = await Promise.allSettled([
    withTimeout(getProjectBySlug(slug)),
    withTimeout(getPerson()),
  ]);
  project    = projRes.status   === "fulfilled" ? projRes.value   : null;
  personData = personRes.status === "fulfilled" ? personRes.value : null;

  if (!project) notFound();

  const person = personData
    ? { name: `${personData.firstName} ${personData.lastName}`, avatar: personData.avatar }
    : { name: staticPerson.name, avatar: staticPerson.avatar };

  return (
    <Column as="section" maxWidth="m" fillWidth gap="xl" paddingY="l">
      <Button href="/work" variant="tertiary" size="s" prefixIcon="chevronLeft">
        All Projects
      </Button>
      <Column gap="m">
        <Heading variant="display-strong-l">{project.title}</Heading>
        {project.summary && (
          <Text variant="body-default-l" onBackground="neutral-weak">
            {project.summary}
          </Text>
        )}
        {project.tags?.length > 0 && (
          <Flex gap="8" wrap>
            {project.tags.map((tag: string) => (
              <Tag key={tag} label={tag} variant="neutral" />
            ))}
          </Flex>
        )}
      </Column>
      {project.images?.[0] && (
        <SmartImage
          priority
          fillWidth
          sizes="(max-width: 768px) 100vw, 800px"
          border="neutral-alpha-weak"
          radius="l"
          src={project.images[0]}
          alt={project.title}
          aspectRatio="16 / 9"
        />
      )}
      <Line />
      <Flex gap="16" vertical="center" horizontal="space-between" fillWidth>
        <Flex gap="16" vertical="center">
          {person.avatar && <Avatar size="s" src={person.avatar} />}
          <Column gap="4">
            <Text variant="body-strong-s">{person.name}</Text>
            <Text variant="body-default-s" onBackground="neutral-weak">
              {formatDate(project.publishedAt)}
            </Text>
          </Column>
        </Flex>
        {project.link && (
          <Button href={project.link} variant="secondary" size="s" suffixIcon="arrowUpRight">
            View Project
          </Button>
        )}
      </Flex>
      <Line />
      {project.team && project.team.length > 0 && (
        <Column gap="m">
          <Text variant="label-default-s" onBackground="neutral-weak">Team</Text>
          <Flex gap="m" wrap>
            {project.team.map((member: any, i: number) => (
              <Flex
                key={i}
                gap="12"
                vertical="center"
                padding="m"
                background="surface"
                border="neutral-alpha-weak"
                radius="l"
              >
                {member.avatar && <Avatar size="s" src={member.avatar} />}
                <Column gap="4">
                  <Text variant="body-strong-s">{member.name}</Text>
                  <Text variant="body-default-xs" onBackground="neutral-weak">{member.role}</Text>
                </Column>
              </Flex>
            ))}
          </Flex>
        </Column>
      )}
      <Column as="article" fillWidth gap="m">
        <div className="prose">
          <ReactMarkdown>{project.content}</ReactMarkdown>
        </div>
      </Column>
    </Column>
  );
}
