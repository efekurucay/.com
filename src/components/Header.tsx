"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

import { Fade, Flex, Line, ToggleButton } from "@/once-ui/components";
import styles from "@/components/Header.module.scss";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

import { routes } from "@/app/resources";

type TimeDisplayProps = {
  timeZone: string;
  locale?: string;
};

const TimeDisplay: React.FC<TimeDisplayProps> = ({ timeZone, locale = "en-GB" }) => {
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      };
      const timeString = new Intl.DateTimeFormat(locale, options).format(now);
      setCurrentTime(timeString);
    };

    updateTime();
    const intervalId = setInterval(updateTime, 1000);

    return () => clearInterval(intervalId);
  }, [timeZone, locale]);

  return <>{currentTime}</>;
};

export default TimeDisplay;

import type { PersonData } from "@/lib/firestoreService";

type PersonShape = Partial<PersonData> & { name?: string; firstName?: string; location?: string };

interface HeaderProps {
  person: PersonShape;
  display: {
    location: boolean;
    time: boolean;
  };
}

export const Header: React.FC<HeaderProps> = ({ person, display }) => {
  const pathname = usePathname() ?? "";
  const { resolvedTheme } = useTheme();
  const logoSrc = resolvedTheme === "light"
    ? "/trademark/nav-icon-light.svg"
    : "/trademark/nav-icon-dark.svg";

  return (
    <>
      <Fade hide="s" fillWidth position="fixed" height="80" zIndex={9} />
      <Fade show="s" fillWidth position="fixed" bottom="0" to="top" height="80" zIndex={9} />
      <Flex
        fitHeight
        className={styles.position}
        as="header"
        zIndex={9}
        fillWidth
        padding="8"
        horizontal="center"
      >
        <Flex paddingLeft="12" fillWidth vertical="center" textVariant="body-default-s">
        </Flex>


        <Flex fillWidth horizontal="center">
          <Flex
            background="surface"
            border="neutral-medium"
            radius="m-4"
            shadow="l"
            padding="4"
            horizontal="center"
          >
            <Flex gap="4" vertical="center" textVariant="body-default-s">
              {routes["/"] && (
                <a href="/" aria-label="Home" style={{ display: "flex", alignItems: "center", padding: "0.25rem" }}>
                  <img src={logoSrc} alt="Logo" style={{ height: "32px", width: "auto" }} />
                </a>
              )}
              <Line vert maxHeight="24" />
              {routes["/about"] && (
                <>
                  <ToggleButton
                    className="s-flex-hide"
                    prefixIcon="person"
                    href="/about"
                    label="About"
                    selected={pathname === "/about"}
                  />
                  <ToggleButton
                    className="s-flex-show"
                    prefixIcon="person"
                    href="/about"
                    selected={pathname === "/about"}
                  />
                </>
              )}
              {routes["/work"] && (
                <>
                  <ToggleButton
                    className="s-flex-hide"
                    prefixIcon="grid"
                    href="/work"
                    label="Work"
                    selected={pathname.startsWith("/work")}
                  />
                  <ToggleButton
                    className="s-flex-show"
                    prefixIcon="grid"
                    href="/work"
                    selected={pathname.startsWith("/work")}
                  />
                </>
              )}
              {routes["/blog"] && (
                <>
                  <ToggleButton
                    className="s-flex-hide"
                    prefixIcon="book"
                    href="/blog"
                    label="Blog"
                    selected={pathname.startsWith("/blog")}
                  />
                  <ToggleButton
                    className="s-flex-show"
                    prefixIcon="book"
                    href="/blog"
                    selected={pathname.startsWith("/blog")}
                  />
                </>
              )}

              {routes["/chat"] && (
                <>
                  <ToggleButton
                    className="s-flex-hide"
                    prefixIcon="brain"
                    href="/chat"
                    label="AI Chat"
                    selected={pathname.startsWith("/chat")}
                  />
                  <ToggleButton
                    className="s-flex-show"
                    prefixIcon="brain"
                    href="/chat"
                    selected={pathname.startsWith("/chat")}
                  />
                </>
              )}
              {routes["/contact"] && (
                <>
                  <ToggleButton
                    className="s-flex-hide"
                    prefixIcon="email"
                    href="/contact"
                    label="Contact"
                    selected={pathname.startsWith("/contact")}
                  />
                  <ToggleButton
                    className="s-flex-show"
                    prefixIcon="email"
                    href="/contact"
                    selected={pathname.startsWith("/contact")}
                  />
                </>
              )}
              <Line vert maxHeight="24" />
              <ThemeSwitcher />
            </Flex>
          </Flex>
        </Flex>
        <Flex fillWidth horizontal="end" vertical="center">
          <Flex
            paddingRight="12"
            horizontal="end"
            vertical="center"
            textVariant="body-default-s"
            gap="20"
          >
            <Flex hide="s">{display.time && person?.location && <TimeDisplay timeZone={person.location} />}</Flex>
          </Flex>
        </Flex>
      </Flex>
    </>
  );
};
