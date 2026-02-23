'use client';

import React from "react";
import Image from "next/image";
import {
  Flex,
  Text,
  Button,
  Heading,
} from "@/once-ui/components";
import { baseURL } from "@/app/resources";

import NowPlaying from "@/components/SpotifyNowPlaying";
import GitHubActivity from "@/components/GitHubActivity";
import { Chat } from "@/app/chat/Chat";
import styles from './HomePageClient.module.scss';
import type { PersonData, HomeData, AboutData } from "@/lib/firestoreService";

interface Content {
  slug: string;
  title: string;
  summary?: string;
  images?: string[];
  image?: string;
}

type PersonShape = PersonData & { name: string; avatar: string };

interface HomePageClientProps {
  latestProject: Content | null;
  latestPost: Content | null;
  person: PersonShape;
  homeData: HomeData & { headline: string; subline: string };
  aboutData: AboutData | { avatarDisplay: boolean };
  avatarUrl: string;
}

export default function HomePageClient({ latestProject, latestPost, person, homeData, avatarUrl }: HomePageClientProps) {
  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: homeData.headline,
            description: homeData.subline,
            url: `https://${baseURL}`,
            image: `${baseURL}/og?title=${encodeURIComponent(homeData.headline)}`,
            publisher: {
              "@type": "Person",
              name: person.name,
              image: {
                "@type": "ImageObject",
                url: `${baseURL}${person.avatar}`,
              },
            },
          }),
        }}
      />

      <div className={styles.homepageLayout}>
        {/* Cards Sidebar */}
        <aside className={styles.cardsSidebar}>

          {/* Spotify */}
          <div className={styles.sidebarCard}>
            <Text variant="label-strong-s" onBackground="neutral-weak">
              Now playing
            </Text>
            <NowPlaying />
          </div>

          {/* GitHub */}
          <div className={styles.sidebarCard}>
            <Text variant="label-strong-s" onBackground="neutral-weak">
              GitHub Activity
            </Text>
            <GitHubActivity />
          </div>

          {/* Contact */}
          <div className={styles.sidebarCard}>
            <Heading as="h2" variant="heading-strong-s">
              Get in touch
            </Heading>
            <Text onBackground="neutral-weak" size="s" wrap="balance">
              Have a project in mind or just want to say hi? I'd love to hear from you.
            </Text>
            <Button href="/contact" variant="secondary" size="s" style={{ marginTop: 'auto' }}>
              Contact
            </Button>
          </div>

          {/* Latest Project */}
          {latestProject && (
            <div className={styles.sidebarCard}>
              <Heading as="h2" variant="heading-strong-s">
                Latest Project
              </Heading>
              <Flex as="div" gap="s" vertical="start" style={{ flexGrow: 1, width: '100%' }}>
                {latestProject.images && latestProject.images.length > 0 && (
                  <div style={{ position: 'relative', width: '40px', height: '40px', flexShrink: 0, borderRadius: 'var(--radius-m)', overflow: 'hidden' }}>
                    <Image
                      src={latestProject.images[0]}
                      alt={latestProject.title}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                )}
                <Flex direction="column" gap="xs" style={{ flexGrow: 1, minHeight: '100%' }}>
                  <Text onBackground="neutral-weak" size="s" wrap="balance">{latestProject.title}</Text>
                  <Button href={`/work/${latestProject.slug}`} variant="secondary" size="s" style={{ marginTop: 'auto' }}>
                    View
                  </Button>
                </Flex>
              </Flex>
            </div>
          )}

          {/* Latest Blog */}
          {latestPost && (
            <div className={styles.sidebarCard}>
              <Heading as="h2" variant="heading-strong-s">
                Latest Blog
              </Heading>
              <Flex as="div" gap="s" vertical="start" style={{ flexGrow: 1, width: '100%' }}>
                {latestPost.image && (
                  <div style={{ position: 'relative', width: '40px', height: '40px', flexShrink: 0, borderRadius: 'var(--radius-m)', overflow: 'hidden' }}>
                    <Image
                      src={latestPost.image}
                      alt={latestPost.title}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                )}
                <Flex direction="column" gap="xs" style={{ flexGrow: 1, minHeight: '100%' }}>
                  <Text onBackground="neutral-weak" size="s" wrap="balance">{latestPost.title}</Text>
                  <Button href={`/blog/${latestPost.slug}`} variant="secondary" size="s" style={{ marginTop: 'auto' }}>
                    Read
                  </Button>
                </Flex>
              </Flex>
            </div>
          )}

        </aside>

        {/* Chat area */}
        <div className={styles.chatContainer}>
          <Chat avatarUrl={avatarUrl} />
        </div>
      </div>
    </>
  );
}
