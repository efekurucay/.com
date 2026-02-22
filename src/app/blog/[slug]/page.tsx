import { notFound } from "next/navigation";
import { Column, Flex, Heading, SmartImage, Text, Button, Avatar } from "@/once-ui/components";
import { baseURL } from "@/app/resources";
import { person as staticPerson } from "@/app/resources/content";
import { formatDate } from "@/app/utils/formatDate";
import { getPostBySlug, getPerson } from "@/lib/firestoreService";
import ReactMarkdown from "react-markdown";

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

  try {
    post = await getPostBySlug(slug);
    personData = await getPerson();
  } catch { }

  if (!post) notFound();

  const person = personData
    ? { name: `${personData.firstName} ${personData.lastName}`, avatar: personData.avatar }
    : { name: staticPerson.name, avatar: staticPerson.avatar };

  return (
    <Column as="section" maxWidth="m" horizontal="center" gap="l" paddingY="l">
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
      <Column maxWidth="xs" gap="16">
        <Button href="/blog" variant="tertiary" size="s" prefixIcon="chevronLeft">
          Posts
        </Button>
        <Heading variant="display-strong-s">{post.title}</Heading>
      </Column>
      {post.image && (
        <SmartImage
          priority
          maxWidth={40}
          className="my-20"
          sizes="(max-width: 768px) 100vw, 720px"
          border="neutral-alpha-weak"
          radius="m"
          src={post.image}
          alt={post.title}
          aspectRatio="16 / 9"
        />
      )}
      <Flex gap="12" marginBottom="24" vertical="center">
        {person.avatar && <Avatar size="s" src={person.avatar} />}
        <Text variant="body-default-s" onBackground="neutral-weak">
          {formatDate(post.publishedAt)}
        </Text>
        <Text variant="body-default-s" onBackground="neutral-weak">
          {person.name}
        </Text>
      </Flex>
      <Column as="article" fillWidth maxWidth="xs" gap="m">
        <div className="prose">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>
      </Column>
    </Column>
  );
}
