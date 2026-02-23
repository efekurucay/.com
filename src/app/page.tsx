import React from "react";
import { baseURL } from "@/app/resources";
import { home as staticHome, person as staticPerson, about as staticAbout } from "@/app/resources/content";
import HomePageClient from "@/components/HomePageClient";
import { getHome, getPerson, getAbout, getVisibleProjects, getVisiblePosts } from "@/lib/firestoreService";
import { withTimeout } from "@/lib/utils";

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
  let personData: any;
  let homeData: any;
  let aboutData: any;

  // Promise.allSettled: bir servis çökse bile diğerleri çalışmaya devam eder
  const [projectsResult, postsResult, personResult, homeResult, aboutResult] =
    await Promise.allSettled([
      withTimeout(getVisibleProjects()),
      withTimeout(getVisiblePosts()),
      withTimeout(getPerson()),
      withTimeout(getHome()),
      withTimeout(getAbout()),
    ]);

  const firestoreProjects =
    projectsResult.status === "fulfilled" ? projectsResult.value : null;
  const firestorePosts =
    postsResult.status === "fulfilled" ? postsResult.value : null;
  personData = personResult.status === "fulfilled" ? personResult.value : null;
  homeData = homeResult.status === "fulfilled" ? homeResult.value : null;
  aboutData = aboutResult.status === "fulfilled" ? aboutResult.value : null;



  if (firestoreProjects && firestoreProjects.length > 0) {
    const p = firestoreProjects[0];
    latestProject = {
      title: p.title, slug: p.slug, summary: p.summary,
      images: p.images, image: p.image || "", publishedAt: p.publishedAt,
    };
  }

  if (firestorePosts && firestorePosts.length > 0) {
    const p = firestorePosts[0];
    latestPost = {
      title: p.title, slug: p.slug, summary: p.summary,
      image: p.image, publishedAt: p.publishedAt,
    };
  }

  // Firestore boş / başarısız olursa plain-string fallback
  if (!personData) personData = { ...staticPerson, name: staticPerson.name };
  else personData.name = `${personData.firstName} ${personData.lastName}`;

  if (!homeData)
    homeData = {
      headline: `${staticPerson.firstName} ${staticPerson.lastName}`,
      subline: `I am ${staticPerson.firstName} ${staticPerson.lastName}, a creative and inquisitive Computer Science & Engineering student who thrives on generating innovative ideas and shaping them into impactful technologies. My focus areas include **Software Engineering**, **Artificial Intelligence**, and **Full-Stack Development**. I'm not just coding—I'm envisioning solutions that address real challenges.\n\nI am always open to new opportunities and collaborations. If you have a project in mind or just want to connect, feel free to reach out via my social media links or email.`,
    };
  if (!aboutData) aboutData = { avatarDisplay: staticAbout.avatar.display };

  return (
    <HomePageClient latestProject={latestProject} latestPost={latestPost} person={personData} homeData={homeData} aboutData={aboutData} />
  );
}
