'use client';

import React, { useRef } from "react";
import Image from "next/image";
import {
  Heading,
  Flex,
  Text,
  Button,
  Avatar,
  RevealFx,
  Column,
  Grid,
  Icon,
} from "@/once-ui/components";
import { baseURL, routes } from "@/app/resources";
import { home, about, person, newsletter } from "@/app/resources/content";
import { Mailchimp } from "@/components";
import { Posts } from "@/components/blog/Posts";
import { Projects } from "@/components/work/Projects";
import NowPlaying from "@/components/SpotifyNowPlaying";
import GitHubActivity from "@/components/GitHubActivity";
import NeuralNetworkCanvas from "@/components/NeuralNetworkCanvas";
import styles from './HomePageClient.module.scss';

interface Content {
  slug: string;
  title: string;
  summary?: string;
  images?: string[];
  image?: string;
}

interface HomePageClientProps {
  latestProject: Content;
  latestPost: Content;
}

export default function HomePageClient({ latestProject, latestPost }: HomePageClientProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const card1Ref = useRef<HTMLDivElement>(null);
  const card2Ref = useRef<HTMLDivElement>(null);
  const card3Ref = useRef<HTMLDivElement>(null);
  const card4Ref = useRef<HTMLDivElement>(null);
  const card5Ref = useRef<HTMLDivElement>(null);

  return (
    <Column gap="xl" horizontal="center" paddingX="l">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: home.title,
            description: home.description,
            url: `https://${baseURL}`,
            image: `${baseURL}/og?title=${encodeURIComponent(home.title)}`,
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
      <div style={{ position: "relative" }}>
        <Grid ref={containerRef} columns="5" mobileColumns="1" fillWidth gap="m" style={{ marginBottom: "var(--space-l)"}}>
          {/* Spotify Card */}
          <Flex ref={card1Ref} direction="column" gap="s" padding="m" radius="l" background="surface" border="neutral-alpha-medium" style={{zIndex: 1}}>
            <Text variant="label-strong-s" onBackground="neutral-weak">
              Now playing
            </Text>
            <NowPlaying />
          </Flex>
          {/* GitHub Card */}
          <Flex ref={card2Ref} direction="column" gap="s" padding="m" radius="l" background="surface" border="neutral-alpha-medium" style={{zIndex: 1}}>
            <Text variant="label-strong-s" onBackground="neutral-weak">
              GitHub Activity
            </Text>
            <GitHubActivity />
          </Flex>
          {/* Contact Card */}
          <Flex ref={card3Ref} direction="column" gap="s" padding="m" radius="l" background="surface" border="neutral-alpha-medium" style={{zIndex: 1}}>
            <Heading as="h2" variant="heading-strong-s">
              Get in touch
            </Heading>
            <Text onBackground="neutral-weak" size="s" wrap="balance">
              Have a project in mind or just want to say hi? I'd love to hear from you.
            </Text>
            <Button href="/contact" variant="secondary" size="s" style={{marginTop: 'auto'}}>
              Contact
            </Button>
          </Flex>
          {/* Latest Project Card */}
          <Flex ref={card4Ref} direction="column" gap="s" padding="m" radius="l" background="surface" border="neutral-alpha-medium" style={{zIndex: 1}}>
            <Heading as="h2" variant="heading-strong-s">
              Latest Project
            </Heading>
            <Flex as="div" gap="m" vertical="start" style={{ flexGrow: 1, width: '100%' }}>
              {latestProject.images && latestProject.images.length > 0 && (
                <div style={{ position: 'relative', width: '56px', height: '56px', flexShrink: 0, borderRadius: 'var(--radius-m)', overflow: 'hidden' }}>
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
          </Flex>
          {/* Latest Blog Card */}
          <Flex ref={card5Ref} direction="column" gap="s" padding="m" radius="l" background="surface" border="neutral-alpha-medium" style={{zIndex: 1}}>
            <Heading as="h2" variant="heading-strong-s">
              Latest Blog
            </Heading>
            <Flex as="div" gap="m" vertical="start" style={{ flexGrow: 1, width: '100%' }}>
              {latestPost.image && (
                <div style={{ position: 'relative', width: '56px', height: '56px', flexShrink: 0, borderRadius: 'var(--radius-m)', overflow: 'hidden' }}>
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
          </Flex>
        </Grid>
        <NeuralNetworkCanvas containerRef={containerRef} cardRefs={[card1Ref, card2Ref, card3Ref, card4Ref, card5Ref]} />
      </div>
      
      <div className={styles.responsiveFlex}>
        <Column as="section" fillWidth paddingY="l" gap="m">
          <Column maxWidth="s" gap="m" horizontal="start">
            <RevealFx translateY="4" fillWidth horizontal="start" paddingBottom="m">
              <Heading wrap="balance" variant="display-strong-m" className={styles.headline}>
                {home.headline}
              </Heading>
            </RevealFx>
            <RevealFx translateY="8" delay={0.2} fillWidth horizontal="start" paddingBottom="m">
              <Text wrap="balance" onBackground="neutral-weak" variant="heading-default-l" className={styles.subline}>
                {home.subline}
              </Text>
            </RevealFx>
            <RevealFx translateY="12" delay={0.4} horizontal="start">
              <Button
                id="about"
                data-border="rounded"
                href="/about"
                variant="secondary"
                size="m"
                arrowIcon
              >
                <Flex gap="8" vertical="center">
                  {about.avatar.display && (
                    <Avatar
                      style={{ marginLeft: "-0.75rem", marginRight: "0.25rem" }}
                      src={person.avatar}
                      size="m"
                    />
                  )}
                  {about.title}
                </Flex>
              </Button>
            </RevealFx>
          </Column>
        </Column>

        <Column gap="m" style={{ minWidth: "20rem", flexShrink: 0 }}>
          {/* AI Chat Card */}
          <RevealFx translateY="12" delay={0.3}>
            <Flex direction="column" gap="m" padding="m" radius="l" background="surface" border="neutral-alpha-medium">
              <Flex vertical="center" gap="s">
                <Icon name="sparkle" size="m" onBackground="neutral-weak" />
                <Heading as="h2" variant="heading-strong-s">
                  Chat with me
                </Heading>
              </Flex>
              <Text onBackground="neutral-weak" size="s">
                Ask my AI assistant anything about me.
              </Text>

              <Flex direction="column" gap="xs">
                <Text onBackground="neutral-weak" size="s" variant="label-default-s">Or try one of these conversation starters:</Text>
                <Flex direction="column" gap="xs" style={{alignItems: 'flex-start'}}>
                    <Button href="/chat?q=What was your most challenging project?" variant="tertiary" size="s" suffixIcon="arrowRight">
                        Most challenging project?
                    </Button>
                    <Button href="/chat?q=Tell me about your design system" variant="tertiary" size="s" suffixIcon="arrowRight">
                        About your design system
                    </Button>
                </Flex>
              </Flex>
              
              <Button href="/chat" variant="secondary" size="s" suffixIcon="arrowRight">
                Start a new chat
              </Button>
            </Flex>
          </RevealFx>
        </Column>
      </div>
      
      {newsletter.display && <Mailchimp newsletter={newsletter} />}
    </Column>
  );
} 