import React from "react";
import { baseURL, home, person } from "@/app/resources";
import HomePageClient from "@/components/HomePageClient";
import { getAllContent } from "@/lib/utils";

export async function generateMetadata() {
  const title = home.title;
  const description = home.description;
  const ogImage = `https://${baseURL}/og?title=${encodeURIComponent(title)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://${baseURL}`,
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

export default async function Home() {
  const projects = await getAllContent("src/app/work/projects");
  const latestProject = projects[0];
  const posts = await getAllContent("src/app/blog/posts");
  const latestPost = posts[0];

  return (
    <HomePageClient latestProject={latestProject} latestPost={latestPost} />
  );
}


