import { Column, Flex, Heading } from "@/once-ui/components";
import { Posts } from "@/components/blog/Posts";
import { baseURL } from "@/app/resources";
import { blog as staticBlog, person as staticPerson } from "@/app/resources/content";
import { getPerson, getBlogSettings } from "@/lib/firestoreService";

export async function generateMetadata() {
  let blogData;
  try {
    blogData = await getBlogSettings();
  } catch { }

  const title = blogData?.title || staticBlog.title;
  const description = blogData?.description || staticBlog.description;
  const ogImage = `https://${baseURL}/og?title=${encodeURIComponent(title)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://${baseURL}/blog`,
      images: [
        {
          url: ogImage,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function Blog() {
  let blogData: any;
  let personData: any;

  try {
    const [b, p] = await Promise.all([getBlogSettings(), getPerson()]);
    blogData = b;
    personData = p;
  } catch { }

  if (!blogData) blogData = staticBlog;
  if (!personData) personData = { ...staticPerson, name: staticPerson.name };
  else personData.name = `${personData.firstName} ${personData.lastName}`;

  return (
    <Column maxWidth="s">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            headline: blogData.title,
            description: blogData.description,
            url: `https://${baseURL}/blog`,
            image: `${baseURL}/og?title=${encodeURIComponent(blogData.title)}`,
            author: {
              "@type": "Person",
              name: personData.name,
              image: {
                "@type": "ImageObject",
                url: `${baseURL}${personData.avatar}`,
              },
            },
          }),
        }}
      />
      <Heading marginBottom="l" variant="display-strong-s">
        {blogData.title}
      </Heading>
      <Column fillWidth flex={1}>
        <Posts range={[1, 3]} thumbnail />
        <Posts range={[4]} columns="2" />
      </Column>

    </Column>
  );
}
