import "@/once-ui/styles/index.scss";
import "@/once-ui/tokens/index.scss";

import classNames from "classnames";

import { Footer, Header, RouteGuard } from "@/components";
import SiteShell from "@/components/SiteShell";
import { baseURL, effects as staticEffects, style as staticStyle, display as staticDisplay } from "@/app/resources";

import { Inter } from "next/font/google";
import { Source_Code_Pro } from "next/font/google";

import { person as staticPerson, social as staticSocial, about as staticAbout, home as staticHome } from "@/app/resources/content";
import { getPerson, getSocialLinks, getAbout, getHome, getSiteConfig } from "@/lib/firestoreService";
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

type SiteConfig = {
  theme?: typeof staticStyle.theme;
  neutral?: typeof staticStyle.neutral;
  brand?: typeof staticStyle.brand;
  accent?: typeof staticStyle.accent;
  solid?: typeof staticStyle.solid;
  solidStyle?: typeof staticStyle.solidStyle;
  border?: typeof staticStyle.border;
  surface?: typeof staticStyle.surface;
  transition?: typeof staticStyle.transition;
  scaling?: typeof staticStyle.scaling;
  mask?: Partial<typeof staticEffects.mask>;
  gradient?: Partial<typeof staticEffects.gradient>;
  dots?: Partial<typeof staticEffects.dots>;
  grid?: Partial<typeof staticEffects.grid>;
  lines?: Partial<typeof staticEffects.lines>;
  displayLocation?: boolean;
  displayTime?: boolean;
};

export default async function RootLayout({ children }: RootLayoutProps) {
  let personData: any;
  let socialData: any;
  let aboutData: any;
  let siteConfig: SiteConfig | null = null;

  try {
    const [p, s, a, config] = await Promise.all([getPerson(), getSocialLinks(), getAbout(), getSiteConfig()]);
    personData = p;
    socialData = s;
    aboutData = a;
    siteConfig = config;
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

  const styleConfig = {
    ...staticStyle,
    theme: siteConfig?.theme ?? staticStyle.theme,
    neutral: siteConfig?.neutral ?? staticStyle.neutral,
    brand: siteConfig?.brand ?? staticStyle.brand,
    accent: siteConfig?.accent ?? staticStyle.accent,
    solid: siteConfig?.solid ?? staticStyle.solid,
    solidStyle: siteConfig?.solidStyle ?? staticStyle.solidStyle,
    border: siteConfig?.border ?? staticStyle.border,
    surface: siteConfig?.surface ?? staticStyle.surface,
    transition: siteConfig?.transition ?? staticStyle.transition,
    scaling: siteConfig?.scaling ?? staticStyle.scaling,
  };

  const effectsConfig = {
    mask: { ...staticEffects.mask, ...(siteConfig?.mask ?? {}) },
    gradient: { ...staticEffects.gradient, ...(siteConfig?.gradient ?? {}) },
    dots: { ...staticEffects.dots, ...(siteConfig?.dots ?? {}) },
    grid: { ...staticEffects.grid, ...(siteConfig?.grid ?? {}) },
    lines: { ...staticEffects.lines, ...(siteConfig?.lines ?? {}) },
  };

  const displayConfig = {
    location: siteConfig?.displayLocation ?? staticDisplay.location,
    time: siteConfig?.displayTime ?? staticDisplay.time,
  };

  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-theme={styleConfig.theme}
      data-neutral={styleConfig.neutral}
      data-brand={styleConfig.brand}
      data-accent={styleConfig.accent}
      data-solid={styleConfig.solid}
      data-solid-style={styleConfig.solidStyle}
      data-border={styleConfig.border}
      data-surface={styleConfig.surface}
      data-transition={styleConfig.transition}
      data-scaling={styleConfig.scaling}
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
                        cursor: effectsConfig.mask.cursor,
                        x: effectsConfig.mask.x,
                        y: effectsConfig.mask.y,
                        radius: effectsConfig.mask.radius,
                      }}
                      gradient={{
                        display: effectsConfig.gradient.display,
                        x: effectsConfig.gradient.x,
                        y: effectsConfig.gradient.y,
                        width: effectsConfig.gradient.width,
                        height: effectsConfig.gradient.height,
                        tilt: effectsConfig.gradient.tilt,
                        colorStart: effectsConfig.gradient.colorStart,
                        colorEnd: effectsConfig.gradient.colorEnd,
                        opacity: effectsConfig.gradient.opacity as any,
                      }}
                      dots={{
                        display: effectsConfig.dots.display,
                        color: effectsConfig.dots.color,
                        size: effectsConfig.dots.size as any,
                        opacity: effectsConfig.dots.opacity as any,
                      }}
                      grid={{
                        display: effectsConfig.grid.display,
                        color: effectsConfig.grid.color,
                        width: effectsConfig.grid.width as any,
                        height: effectsConfig.grid.height as any,
                        opacity: effectsConfig.grid.opacity as any,
                      }}
                      lines={{
                        display: effectsConfig.lines.display,
                        opacity: effectsConfig.lines.opacity as any,
                      }}
                    />
                    <Flex fillWidth minHeight="16"></Flex>
                    <Header person={personData} display={displayConfig} />
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
