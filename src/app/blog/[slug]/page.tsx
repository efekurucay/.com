import { notFound } from "next/navigation";
import { Avatar, Button, Column, Flex, Heading, Line, SmartImage, Tag, Text } from "@/once-ui/components";
import { baseURL } from "@/app/resources";
import { person as staticPerson } from "@/app/resources/content";
import { formatDate } from "@/app/utils/formatDate";
import { getPostBySlug, getPerson } from "@/lib/firestoreService";
import ReactMarkdown from "react-markdown";
import { withTimeout } from "@/lib/utils";

export const revalidate = 60;

interface BlogPostParams {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogPostParams) {
  const { slug } = await params;
  let post: any = null;

  try {
    post = await getPostBySlug(slug);
  } catch { }

  if (!post) return { title: "Post not found" };

  const title = post.title;
  const description = post.summary;
  const ogImage = post.image || `https://${baseURL}/og?title=${encodeURIComponent(title)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url: `https://${baseURL}/blog/${slug}`,
      images: [{ url: ogImage, alt: title }],
    },
  };
}

export default async function BlogPost({ params }: BlogPostParams) {
  const { slug } = await params;
  let post: any = null;
  let personData: any;

  const [postRes, personRes] = await Promise.allSettled([
    withTimeout(getPostBySlug(slug)),
    withTimeout(getPerson()),
  ]);
  post       = postRes.status   === "fulfilled" ? postRes.value   : null;
  personData = personRes.status === "fulfilled" ? personRes.value : null;

  if (!post) notFound();

  const person = personData
    ? { name: `${personData.firstName} ${personData.lastName}`, avatar: personData.avatar }
    : { name: staticPerson.name, avatar: staticPerson.avatar };

  return (
    <Column as="section" maxWidth="m" fillWidth gap="xl" paddingY="l">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            datePublished: post.publishedAt,
            dateModified: post.updatedAt || post.publishedAt,
            description: post.summary,
            image: post.image
              ? `https://${baseURL}${post.image}`
              : `https://${baseURL}/og?title=${encodeURIComponent(post.title)}`,
            url: `https://${baseURL}/blog/${slug}`,
            author: {
              "@type": "Person",
              name: person.name,
            },
          }),
        }}
      />
      <Button href="/blog" variant="tertiary" size="s" prefixIcon="chevronLeft">
        All Posts
      </Button>
      <Column gap="m">
        <Heading variant="display-strong-l">{post.title}</Heading>
        {post.summary && (
          <Text variant="body-default-l" onBackground="neutral-weak">
            {post.summary}
          </Text>
        )}
        {post.tags?.length > 0 && (
          <Flex gap="8" wrap>
            {post.tags.map((tag: string) => (
              <Tag key={tag} label={tag} variant="neutral" />
            ))}
          </Flex>
        )}
      </Column>
      {post.image && (
        <SmartImage
          priority
          fillWidth
          sizes="(max-width: 768px) 100vw, 800px"
          border="neutral-alpha-weak"
          radius="l"
          src={post.image}
          alt={post.title}
          aspectRatio="16 / 9"
        />
      )}
      <Line />
      <Flex gap="16" vertical="center">
        {person.avatar && <Avatar size="s" src={person.avatar} />}
        <Column gap="4">
          <Text variant="body-strong-s">{person.name}</Text>
          <Text variant="body-default-s" onBackground="neutral-weak">
            {formatDate(post.publishedAt)}
          </Text>
        </Column>
      </Flex>
      <Line />
      <Column as="article" fillWidth gap="m">
        <div className="prose">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>
      </Column>
    </Column>
  );
}
