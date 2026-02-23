import {
  Avatar,
  Button,
  Column,
  Flex,
  Grid,
  Heading,
  Icon,
  IconButton,
  Line,
  RevealFx,
  Tag,
  Text,
} from "@/once-ui/components";
import { baseURL } from "@/app/resources";
import TableOfContents from "@/components/about/TableOfContents";
import styles from "@/components/about/about.module.scss";
import {
  getPerson,
  getAbout,
  getSocialLinks,
  getExperiences,
  getEducation,
  getSkills,
  getCertifications,
} from "@/lib/firestoreService";
import ReactMarkdown from "react-markdown";

// Fallback imports for when Firestore is empty
import { person as staticPerson, about as staticAbout, social as staticSocial } from "@/app/resources/content";
import { withTimeout } from "@/lib/utils";

export const revalidate = 60;

export async function generateMetadata() {
  let aboutData;
  let personData;
  try {
    aboutData = await getAbout();
    personData = await getPerson();
  } catch { }

  const title = aboutData?.introTitle || staticAbout.title;
  const personName = personData ? `${personData.firstName} ${personData.lastName}` : staticPerson.name;
  const personRole = personData?.role || staticPerson.role;
  const description = `Meet ${personName}, ${personRole}`;
  const ogImage = `https://${baseURL}/og?title=${encodeURIComponent(title)}`;

  return {
    title: "About me",
    description,
    openGraph: {
      title: "About me",
      description,
      type: "website",
      url: `https://${baseURL}/about`,
      images: [{ url: ogImage, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title: "About me",
      description,
      images: [ogImage],
    },
  };
}



export default async function About() {
  let person: any, about: any, social: any[], workExps: any[], orgExps: any[],
    education: any[], skills: any[], certifications: any[];

  const [personRes, aboutRes, socialRes, workRes, orgRes, eduRes, skillRes, certRes] =
    await Promise.allSettled([
      withTimeout(getPerson()),
      withTimeout(getAbout()),
      withTimeout(getSocialLinks()),
      withTimeout(getExperiences("work")),
      withTimeout(getExperiences("organization")),
      withTimeout(getEducation()),
      withTimeout(getSkills()),
      withTimeout(getCertifications()),
    ]);

  const personData  = personRes.status  === "fulfilled" ? personRes.value  : null;
  const aboutData   = aboutRes.status   === "fulfilled" ? aboutRes.value   : null;
  const socialData  = socialRes.status  === "fulfilled" ? socialRes.value  : null;
  const workData    = workRes.status    === "fulfilled" ? workRes.value    : null;
  const orgData     = orgRes.status     === "fulfilled" ? orgRes.value     : null;
  const eduData     = eduRes.status     === "fulfilled" ? eduRes.value     : null;
  const skillData   = skillRes.status   === "fulfilled" ? skillRes.value   : null;
  const certData    = certRes.status    === "fulfilled" ? certRes.value    : null;

  person = personData
    ? { ...personData, name: `${personData.firstName} ${personData.lastName}` }
    : { firstName: staticPerson.firstName, lastName: staticPerson.lastName, name: staticPerson.name, role: staticPerson.role, avatar: staticPerson.avatar, location: staticPerson.location, languages: staticPerson.languages };

  about = aboutData || {
    introTitle: staticAbout.intro.title,
    introDescription: "",
    tableOfContentDisplay: true,
    avatarDisplay: true,
    calendarDisplay: true,
    calendarLink: staticAbout.calendar.link,
    workDisplay: true,
    workTitle: "Work Experience",
    studiesDisplay: true,
    studiesTitle: "Education",
    technicalDisplay: true,
    technicalTitle: "Technical skills",
    organizationsDisplay: true,
    organizationsTitle: "Organizations",
    certificationsDisplay: true,
    certificationsTitle: "Certifications",
  };

  social        = (socialData && socialData.length > 0) ? socialData : staticSocial;
  workExps      = workData  ?? [];
  orgExps       = orgData   ?? [];
  education     = eduData   ?? [];
  skills        = skillData ?? [];
  certifications = certData ?? [];

  const structure = [
    { title: about.introTitle,         display: true,                                              items: [] },
    { title: about.workTitle,          display: about.workDisplay          && workExps.length > 0, items: workExps.map((e: any) => e.company) },
    { title: about.organizationsTitle, display: about.organizationsDisplay && orgExps.length > 0,  items: orgExps.map((e: any) => e.company) },
    { title: about.studiesTitle,       display: about.studiesDisplay       && education.length > 0, items: education.map((e: any) => e.name) },
    { title: about.technicalTitle,     display: about.technicalDisplay     && skills.length > 0,   items: skills.map((s: any) => s.title) },
    { title: about.certificationsTitle, display: about.certificationsDisplay && certifications.length > 0, items: certifications.map((c: any) => c.name) },
  ];

  return (
    <Column maxWidth="m">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            name: person.name,
            jobTitle: person.role,
            description: about.introDescription,
            url: `https://${baseURL}/about`,
            image: `${baseURL}/images/${person.avatar}`,
            sameAs: social
              .filter((item: any) => item.link && !item.link.startsWith("mailto:"))
              .map((item: any) => item.link),
            worksFor: workExps[0]
              ? { "@type": "Organization", name: workExps[0].company }
              : undefined,
          }),
        }}
      />

      {about.tableOfContentDisplay && (
        <Column
          left="0"
          style={{ top: "50%", transform: "translateY(-50%)" }}
          position="fixed"
          paddingLeft="24"
          gap="32"
          hide="s"
        >
          <TableOfContents structure={structure} about={{
            tableOfContent: { display: true, subItems: false },
          }} />
        </Column>
      )}

      <Flex fillWidth mobileDirection="column" horizontal="center">
        {about.avatarDisplay && (
          <Column
            className={styles.avatar}
            minWidth="160"
            paddingX="l"
            paddingBottom="xl"
            gap="m"
            flex={3}
            horizontal="center"
          >
            <Avatar src={person.avatar} size="xl" />
            <Flex gap="8" vertical="center">
              <Icon onBackground="accent-weak" name="globe" />
              {person.location}
            </Flex>
            {person.languages && person.languages.length > 0 && (
              <Flex wrap gap="8">
                {person.languages.map((language: string, index: number) => (
                  <Tag key={index} size="l">{language}</Tag>
                ))}
              </Flex>
            )}
          </Column>
        )}

        <Column className={styles.blockAlign} flex={9} maxWidth={40} gap="xl">
          <Column id={about.introTitle} fillWidth gap="m" paddingBottom="4">
            {about.calendarDisplay && about.calendarLink && (
              <Flex
                fitWidth
                border="brand-alpha-medium"
                className={styles.blockAlign}
                style={{ backdropFilter: "blur(var(--static-space-1))" }}
                background="brand-alpha-weak"
                radius="full"
                padding="4"
                gap="8"
                vertical="center"
              >
                <Icon paddingLeft="12" name="calendar" onBackground="brand-weak" />
                <Flex paddingX="8">Schedule a call</Flex>
                <IconButton href={about.calendarLink} data-border="rounded" variant="secondary" icon="chevronRight" />
              </Flex>
            )}
            <Heading className={styles.textAlign} variant="display-strong-l">
              {person.name}
            </Heading>
            <Text className={styles.textAlign} variant="body-default-l" onBackground="neutral-weak">
              {person.role}
            </Text>
            {social.length > 0 && (
              <Flex className={styles.blockAlign} paddingTop="8" gap="8" wrap>
                {social.map((item: any) =>
                  item.link && (
                    <span key={item.name}>
                      <Button className="s-flex-hide" href={item.link} prefixIcon={item.icon} label={item.name} size="s" variant="secondary" />
                      <IconButton className="s-flex-show" size="l" href={item.link} icon={item.icon} variant="secondary" />
                    </span>
                  )
                )}
              </Flex>
            )}
          </Column>

          {about.introDescription && (
            <Column fillWidth gap="m">
              <Line />
              <Column textVariant="body-default-l" fillWidth gap="m">
                <ReactMarkdown>{about.introDescription}</ReactMarkdown>
              </Column>
            </Column>
          )}

          {about.workDisplay && workExps.length > 0 && (
            <Column fillWidth gap="l">
              <Line />
              <Heading as="h2" id={about.workTitle} variant="heading-strong-l">
                {about.workTitle}
              </Heading>
              <Column gap="m">
                {workExps.map((experience: any, index: number) => (
                  <RevealFx key={`${experience.company}-${index}`} translateY="4" delay={index * 0.05}>
                    <Column fillWidth padding="m" background="surface" border="neutral-alpha-weak" radius="l" gap="8">
                      <Flex fillWidth horizontal="space-between" vertical="center">
                        <Text id={experience.company} variant="heading-strong-m">{experience.company}</Text>
                        <Tag size="s">{experience.timeframe}</Tag>
                      </Flex>
                      <Text variant="label-strong-s" onBackground="brand-weak">{experience.role}</Text>
                      <Column as="ul" gap="4">
                        {experience.achievements.map((achievement: string, i: number) => (
                          <Text as="li" variant="body-default-s" onBackground="neutral-weak" key={`${experience.company}-${i}`}>
                            {achievement}
                          </Text>
                        ))}
                      </Column>
                    </Column>
                  </RevealFx>
                ))}
              </Column>
            </Column>
          )}

          {about.organizationsDisplay && orgExps.length > 0 && (
            <Column fillWidth gap="l">
              <Line />
              <Heading as="h2" id={about.organizationsTitle} variant="heading-strong-l">
                {about.organizationsTitle}
              </Heading>
              <Column gap="m">
                {orgExps.map((experience: any, index: number) => (
                  <RevealFx key={`${experience.company}-${index}`} translateY="4" delay={index * 0.05}>
                    <Column fillWidth padding="m" background="surface" border="neutral-alpha-weak" radius="l" gap="8">
                      <Flex fillWidth horizontal="space-between" vertical="center">
                        <Text id={experience.company} variant="heading-strong-m">{experience.company}</Text>
                        <Tag size="s">{experience.timeframe}</Tag>
                      </Flex>
                      <Text variant="label-strong-s" onBackground="brand-weak">{experience.role}</Text>
                      <Column as="ul" gap="4">
                        {experience.achievements.map((achievement: string, i: number) => (
                          <Text as="li" variant="body-default-s" onBackground="neutral-weak" key={`${experience.company}-${i}`}>
                            {achievement}
                          </Text>
                        ))}
                      </Column>
                    </Column>
                  </RevealFx>
                ))}
              </Column>
            </Column>
          )}

          {about.studiesDisplay && education.length > 0 && (
            <Column fillWidth gap="l">
              <Line />
              <Heading as="h2" id={about.studiesTitle} variant="heading-strong-l">
                {about.studiesTitle}
              </Heading>
              <Column gap="s">
                {education.map((institution: any, index: number) => (
                  <Flex
                    key={`${institution.name}-${index}`}
                    fillWidth paddingY="s" paddingX="m"
                    background="surface" border="neutral-alpha-weak" radius="l"
                    horizontal="space-between" vertical="center" gap="m"
                  >
                    <Text id={institution.name} variant="heading-strong-s">{institution.name}</Text>
                    <Text variant="body-default-s" onBackground="neutral-weak">{institution.description}</Text>
                  </Flex>
                ))}
              </Column>
            </Column>
          )}

          {about.technicalDisplay && skills.length > 0 && (
            <Column fillWidth gap="l">
              <Line />
              <Heading as="h2" id={about.technicalTitle} variant="heading-strong-l">
                {about.technicalTitle}
              </Heading>
              <Grid columns="2" mobileColumns="1" gap="m">
                {skills.map((skill: any, index: number) => (
                  <Column key={`${skill.title}-${index}`} padding="m" background="surface" border="neutral-alpha-weak" radius="l" gap="4">
                    <Text variant="heading-strong-s">{skill.title}</Text>
                    {skill.description && (
                      <Text variant="body-default-s" onBackground="neutral-weak">{skill.description}</Text>
                    )}
                  </Column>
                ))}
              </Grid>
            </Column>
          )}

          {about.certificationsDisplay && certifications.length > 0 && (
            <Column fillWidth gap="l">
              <Line />
              <Heading as="h2" id={about.certificationsTitle} variant="heading-strong-l">
                {about.certificationsTitle}
              </Heading>
              <Grid columns="2" mobileColumns="1" gap="s">
                {certifications.map((cert: any, index: number) => (
                  <Flex
                    key={`${cert.name}-${index}`}
                    paddingY="s" paddingX="m"
                    background="surface" border="neutral-alpha-weak" radius="l"
                    gap="s" vertical="center"
                  >
                    <Icon name="check" size="s" onBackground="brand-weak" />
                    <Column gap="2">
                      <Text variant="heading-strong-s">{cert.name}</Text>
                      <Text variant="label-default-xs" onBackground="neutral-weak">{cert.role}</Text>
                    </Column>
                  </Flex>
                ))}
              </Grid>
            </Column>
          )}
        </Column>
      </Flex>
    </Column>
  );
}
