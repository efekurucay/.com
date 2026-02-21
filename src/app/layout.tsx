import "@/once-ui/styles/index.scss";
import "@/once-ui/tokens/index.scss";

import classNames from "classnames";

import { Footer, Header, RouteGuard } from "@/components";
import SiteShell from "@/components/SiteShell";
import { baseURL, effects, style } from "@/app/resources";

import { Inter } from "next/font/google";
import { Source_Code_Pro } from "next/font/google";

import { person as staticPerson, social as staticSocial, about as staticAbout, home as staticHome } from "@/app/resources/content";
import { getPerson, getSocialLinks, getAbout, getHome } from "@/lib/firestoreService";
import { Background, Column, Flex, ToastProvider } from "@/once-ui/components";
import { Providers } from "@/app/providers";

// ... existing generateMetadata code ...
export async function generateMetadata() {
  let homeData;
  let personData;
  try {
    homeData = await getHome();
    personData = await getPerson();
  } catch { }

  const title = homeData?.title || staticHome.title;
  const description = homeData?.description || staticHome.description;
  const personName = personData ? `${personData.firstName}` : staticPerson.firstName;

  return {
    metadataBase: new URL(`https://${baseURL}`),
    title: title,
    description: description,
    openGraph: {
      title: `${personName}'s Portfolio`,
      description: "Portfolio website showcasing my work.",
      url: baseURL,
      siteName: `${personName}'s Portfolio`,
      locale: "en_US",
      type: "website",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

const primary = Inter({
  variable: "--font-primary",
  subsets: ["latin"],
  display: "swap",
});

type FontConfig = {
  variable: string;
};

const secondary: FontConfig | undefined = undefined;
const tertiary: FontConfig | undefined = undefined;

const code = Source_Code_Pro({
  variable: "--font-code",
  subsets: ["latin"],
  display: "swap",
});

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  let personData: any;
  let socialData: any;
  let aboutData: any;

  try {
    const [p, s, a] = await Promise.all([getPerson(), getSocialLinks(), getAbout()]);
    personData = p;
    socialData = s;
    aboutData = a;
  } catch { }

  if (!personData) personData = { ...staticPerson, name: staticPerson.name };
  else personData.name = `${personData.firstName} ${personData.lastName}`;

  if (!socialData || socialData.length === 0) socialData = staticSocial;
  else socialData = socialData.map((s: any) => ({
    name: s.name,
    icon: s.icon ? s.icon.toLowerCase() : s.name ? s.name.toLowerCase() : "",
    link: s.link
  }));

  if (!aboutData) aboutData = staticAbout;

  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-neutral={style.neutral}
      data-brand={style.brand}
      data-accent={style.accent}
      data-solid={style.solid}
      data-solid-style={style.solidStyle}
      data-border={style.border}
      data-surface={style.surface}
      data-transition={style.transition}
      className={classNames(
        primary.variable,
        secondary ? secondary.variable : "",
        tertiary ? tertiary.variable : "",
        code.variable,
      )}
    >
      <body style={{ margin: 0, padding: 0 }}>
        <Providers>
          <ToastProvider>
            <SiteShell
              siteContent={
                <Flex background="page">
                  <Column style={{ minHeight: "100vh" }} fillWidth>
                    <Background
                      mask={{
                        cursor: effects.mask.cursor,
                        x: effects.mask.x,
                        y: effects.mask.y,
                        radius: effects.mask.radius,
                      }}
                      gradient={{
                        display: effects.gradient.display,
                        x: effects.gradient.x,
                        y: effects.gradient.y,
                        width: effects.gradient.width,
                        height: effects.gradient.height,
                        tilt: effects.gradient.tilt,
                        colorStart: effects.gradient.colorStart,
                        colorEnd: effects.gradient.colorEnd,
                        opacity: effects.gradient.opacity as any,
                      }}
                      dots={{
                        display: effects.dots.display,
                        color: effects.dots.color,
                        size: effects.dots.size as any,
                        opacity: effects.dots.opacity as any,
                      }}
                      grid={{
                        display: effects.grid.display,
                        color: effects.grid.color,
                        width: effects.grid.width as any,
                        height: effects.grid.height as any,
                        opacity: effects.grid.opacity as any,
                      }}
                      lines={{
                        display: effects.lines.display,
                        opacity: effects.lines.opacity as any,
                      }}
                    />
                    <Flex fillWidth minHeight="16"></Flex>
                    <Header person={personData} />
                    <Flex
                      position="relative"
                      zIndex={0}
                      fillWidth
                      paddingY="l"
                      paddingX="l"
                      horizontal="center"
                      flex={1}
                    >
                      <Flex horizontal="center" fillWidth minHeight="0">
                        <RouteGuard>{children}</RouteGuard>
                      </Flex>
                    </Flex>
                    <Footer person={personData} social={socialData} />
                  </Column>
                </Flex>
              }
            >
              {children}
            </SiteShell>
          </ToastProvider>
        </Providers>
      </body>
    </html>
  );
}
