import React from "react";
import { baseURL } from "@/app/resources";
import { home as staticHome, person as staticPerson } from "@/app/resources/content";
import HomePageClient from "@/components/HomePageClient";
import { getPosts } from "@/app/utils/utils";
import { getHome, getPerson, getVisibleProjects, getVisiblePosts } from "@/lib/firestoreService";

export const revalidate = 60;

export async function generateMetadata() {
  let homeData;
  let personData;
  try {
    homeData = await getHome();
    personData = await getPerson();
  } catch { }

  const personName = personData ? `${personData.firstName} ${personData.lastName}` : staticPerson.name;
  const title = homeData?.headline ? `${personName}'s Portfolio` : staticHome.title;
  const description = staticHome.description;
  const ogImage = `https://${baseURL}/og?title=${encodeURIComponent(title)}`;

  return {
    title, description,
    openGraph: { title, description, type: "website", url: `https://${baseURL}`, images: [{ url: ogImage, alt: title }] },
    twitter: { card: "summary_large_image" as const, title, description, images: [ogImage] },
  };
}

export default async function Home() {
  let latestProject: any = null;
  let latestPost: any = null;

  try {
    // Try Firestore first
    const [firestoreProjects, firestorePosts] = await Promise.all([
      getVisibleProjects(),
      getVisiblePosts(),
    ]);

    if (firestoreProjects.length > 0) {
      const p = firestoreProjects[0];
      latestProject = {
        title: p.title, slug: p.slug, summary: p.summary,
        images: p.images, image: p.image || "", publishedAt: p.publishedAt,
      };
    }

    if (firestorePosts.length > 0) {
      const p = firestorePosts[0];
      latestPost = {
        title: p.title, slug: p.slug, summary: p.summary,
        image: p.image, publishedAt: p.publishedAt,
      };
    }
  } catch { }

  // Fallback to file system
  if (!latestProject) {
    try {
      const projects = getPosts(["src", "app", "work", "projects"]);
      if (projects.length > 0) {
        latestProject = { ...projects[0].metadata, slug: projects[0].slug };
      }
    } catch { }
  }

  if (!latestPost) {
    try {
      const posts = getPosts(["src", "app", "blog", "posts"]);
      if (posts.length > 0) {
        latestPost = { ...posts[0].metadata, slug: posts[0].slug };
      }
    } catch { }
  }

  return (
    <HomePageClient latestProject={latestProject} latestPost={latestPost} />
  );
}
