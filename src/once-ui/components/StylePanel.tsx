"use client";

import { forwardRef, useState, useEffect } from "react";
import { Flex, Text, SegmentedControl, IconButton, Scroller, Column } from ".";

import styles from "./StylePanel.module.scss";
import classNames from "classnames";
import { style } from "@/app/resources";

interface StylePanelProps extends React.ComponentProps<typeof Flex> {
  style?: React.CSSProperties;
  className?: string;
}

const shapes = ["conservative", "playful", "rounded"] as const;

const colorOptions = {
  brand: [
    "cyan",
    "blue",
    "indigo",
    "violet",
    "magenta",
    "pink",
    "red",
    "orange",
    "yellow",
    "moss",
    "green",
    "emerald",
    "aqua",
  ] as const,
  accent: [
    "cyan",
    "blue",
    "indigo",
    "violet",
    "magenta",
    "pink",
    "red",
    "orange",
    "yellow",
    "moss",
    "green",
    "emerald",
    "aqua",
  ] as const,
  neutral: ["sand", "gray", "slate"] as const,
};

const StylePanel = forwardRef<HTMLDivElement, StylePanelProps>(({ ...rest }, ref) => {
  const [selectedShape, setSelectedShape] = useState(style.border);
  const [brandColor, setBrandColor] = useState(style.brand);
  const [accentColor, setAccentColor] = useState(style.accent);
  const [neutralColor, setNeutralColor] = useState(style.neutral);
  const [theme, setTheme] = useState(style.theme);
  const [solid, setSolid] = useState(style.solid);
  const [solidStyle, setSolidStyle] = useState(style.solidStyle);
  const [transition, setTransition] = useState(style.transition);
  const [scaling, setScaling] = useState(style.scaling);
  const [surface, setSurface] = useState(style.surface);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-border", selectedShape);
    root.setAttribute("data-brand", brandColor);
    root.setAttribute("data-accent", accentColor);
    root.setAttribute("data-neutral", neutralColor);
    root.setAttribute("data-solid", solid);
    root.setAttribute("data-solid-style", solidStyle);
    root.setAttribute("data-theme", theme);
    root.setAttribute("data-transition", transition);
    root.setAttribute("data-scaling", scaling);
    root.setAttribute("data-surface", surface);
    root.setAttribute("data-transition", transition);
  }, [
    selectedShape,
    brandColor,
    accentColor,
    neutralColor,
    solid,
    solidStyle,
    theme,
    transition,
    surface,
    scaling,
  ]);

  return (
    <Column fillWidth gap="16" ref={ref} {...rest}>
      <Column fillWidth paddingTop="12" paddingLeft="16" gap="4">
        <Text variant="heading-strong-s">Page</Text>
        <Text variant="body-default-s" onBackground="neutral-weak">
          Customize global design settings
        </Text>
      </Column>

      <Column fillWidth border="neutral-alpha-medium" radius="l-4">
        <Flex
          borderBottom="neutral-alpha-medium"
          horizontal="space-between"
          vertical="center"
          fillWidth
          paddingX="24"
          paddingY="16"
          gap="24"
        >
          <Text variant="label-default-s">Theme</Text>
          <SegmentedControl
            maxWidth={22}
            buttons={[
              { size: "l", label: "Light", value: "light", prefixIcon: "light" },
              { size: "l", label: "Dark", value: "dark", prefixIcon: "dark" },
            ]}
            onToggle={(value) => setTheme(value as "light" | "dark")}
            selected={theme}
          />
        </Flex>
        <Flex horizontal="space-between" vertical="center" fillWidth paddingX="24" paddingY="16">
          <Text variant="label-default-s">Shape</Text>
          <Flex gap="4">
            {shapes.map((radius, index) => (
              <Flex
                data-border={shapes[index]}
                key={radius}
                horizontal="center"
                vertical="center"
                className={classNames(
                  styles.select,
                  selectedShape === radius ? styles.selected : "",
                )}
                onClick={() => {
                  setSelectedShape(radius);
                }}
              >
                <IconButton variant="ghost" size="m">
                  <div className={classNames(styles.neutral, styles.swatch)}></div>
                </IconButton>
              </Flex>
            ))}
          </Flex>
        </Flex>
      </Column>

      <Column fillWidth paddingTop="12" paddingLeft="16" gap="4">
        <Text variant="heading-strong-s">Color</Text>
        <Text variant="body-default-s" onBackground="neutral-weak">
          Customize color schemes
        </Text>
      </Column>
      <Column fillWidth border="neutral-alpha-medium" radius="l-4">
        <Flex
          borderBottom="neutral-alpha-medium"
          horizontal="space-between"
          vertical="center"
          fillWidth
          paddingX="24"
          paddingY="16"
          gap="24"
        >
          <Flex textVariant="label-default-s" minWidth={3}>
            Brand
          </Flex>
          <Scroller minWidth={0} fitWidth>
            {colorOptions.brand.map((color, index) => (
              <Flex
                marginRight="2"
                key={color}
                horizontal="center"
                vertical="center"
                className={classNames(styles.select, brandColor === color ? styles.selected : "")}
                onClick={() => {
                  setBrandColor(color);
                }}
              >
                <IconButton variant="ghost" size="m">
                  <div className={`${styles[color]} ${styles.swatch}`}></div>
                </IconButton>
              </Flex>
            ))}
          </Scroller>
        </Flex>

        <Flex
          borderBottom="neutral-alpha-medium"
          horizontal="space-between"
          vertical="center"
          fillWidth
          paddingX="24"
          paddingY="16"
          gap="24"
        >
          <Flex textVariant="label-default-s" minWidth={3}>
            Accent
          </Flex>
          <Scroller minWidth={0} fitWidth>
            {colorOptions.accent.map((color, index) => (
              <Flex
                marginRight="2"
                key={color}
                horizontal="center"
                vertical="center"
                className={classNames(styles.select, accentColor === color ? styles.selected : "")}
                onClick={() => {
                  setAccentColor(color);
                }}
              >
                <IconButton variant="ghost" size="m">
                  <div className={`${styles[color]} ${styles.swatch}`}></div>
                </IconButton>
              </Flex>
            ))}
          </Scroller>
        </Flex>

        <Flex
          horizontal="space-between"
          vertical="center"
          fillWidth
          paddingX="24"
          paddingY="16"
          gap="24"
        >
          <Flex textVariant="label-default-s" minWidth={3}>
            Neutral
          </Flex>
          <Scroller minWidth={0} fitWidth>
            {colorOptions.neutral.map((color, index) => (
              <Flex
                marginRight="2"
                key={color}
                horizontal="center"
                vertical="center"
                className={classNames(styles.select, neutralColor === color ? styles.selected : "")}
                onClick={() => {
                  setNeutralColor(color);
                }}
              >
                <IconButton variant="ghost" size="m">
                  <div className={`${styles[color]} ${styles.swatch}`}></div>
                </IconButton>
              </Flex>
            ))}
          </Scroller>
        </Flex>
      </Column>

      <Column fillWidth paddingTop="12" paddingLeft="16" gap="4">
        <Text variant="heading-strong-s">Solid style</Text>
        <Text variant="body-default-s" onBackground="neutral-weak">
          Customize the appearance of solid colors
        </Text>
      </Column>
      <Column fillWidth border="neutral-alpha-medium" radius="l-4">
        <Flex
          borderBottom="neutral-alpha-medium"
          horizontal="space-between"
          vertical="center"
          fillWidth
          paddingX="24"
          paddingY="16"
          gap="24"
        >
          <Text variant="label-default-s">Contrast</Text>
          <SegmentedControl
            maxWidth={22}
            buttons={[
              { size: "l", label: "Color", value: "color" },
              { size: "l", label: "Contrast", value: "contrast" },
            ]}
            onToggle={(value) => setSolid(value as "color" | "contrast")}
            selected={solid}
          />
        </Flex>
        <Flex horizontal="space-between" vertical="center" fillWidth paddingX="24" paddingY="16">
          <Text variant="label-default-s">Style</Text>
          <SegmentedControl
            maxWidth={22}
            buttons={[
              { size: "l", label: "Flat", value: "flat" },
              { size: "l", label: "Plastic", value: "plastic" },
            ]}
            onToggle={(value) => setSolidStyle(value as "flat" | "plastic")}
            selected={solidStyle}
          />
        </Flex>
      </Column>

      <Column fillWidth paddingTop="12" paddingLeft="16" gap="4">
        <Text variant="heading-strong-s">Transitions</Text>
        <Text variant="body-default-s" onBackground="neutral-weak">
          Customize the page transitions
        </Text>
      </Column>

      <Column fillWidth border="neutral-alpha-medium" radius="l-4">
        <Flex
          borderBottom="neutral-alpha-medium"
          horizontal="space-between"
          vertical="center"
          fillWidth
          paddingX="24"
          paddingY="16"
          gap="24"
        >
          <Text variant="label-default-s">Scaling</Text>
          <SegmentedControl
            maxWidth={22}
            buttons={[
              { size: "l", label: "Compact", value: "compact" },
              { size: "l", label: "Normal", value: "normal" },
            ]}
            onToggle={(value) => setScaling(value as "compact" | "normal")}
            selected={scaling}
          />
        </Flex>
        <Flex horizontal="space-between" vertical="center" fillWidth paddingX="24" paddingY="16">
          <Text variant="label-default-s">Animation</Text>
          <SegmentedControl
            maxWidth={22}
            buttons={[
              { size: "l", label: "Micro", value: "micro" },
              { size: "l", label: "Macro", value: "macro" },
              { size: "l", label: "All", value: "all" },
            ]}
            onToggle={(value) => setTransition(value as "micro" | "macro" | "all")}
            selected={transition}
          />
        </Flex>
      </Column>

      <Column fillWidth paddingTop="12" paddingLeft="16" gap="4">
        <Text variant="heading-strong-s">Surface</Text>
        <Text variant="body-default-s" onBackground="neutral-weak">
          Customize the surface appearance
        </Text>
      </Column>
      <Column fillWidth border="neutral-alpha-medium" radius="l-4">
        <Flex horizontal="space-between" vertical="center" fillWidth paddingX="24" paddingY="16">
          <Text variant="label-default-s">Style</Text>
          <SegmentedControl
            maxWidth={22}
            buttons={[
              { size: "l", label: "Filled", value: "filled" },
              { size: "l", label: "Translucent", value: "translucent" },
            ]}
            onToggle={(value) => setSurface(value as "filled" | "translucent")}
            selected={surface}
          />
        </Flex>
      </Column>
    </Column>
  );
});

StylePanel.displayName = "StylePanel";
export { StylePanel };
