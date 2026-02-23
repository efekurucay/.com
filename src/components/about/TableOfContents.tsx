"use client";

import React from "react";
import { Column, Flex, Text } from "@/once-ui/components";
import styles from "./about.module.scss";

interface TableOfContentsProps {
  structure: {
    title: string;
    display: boolean;
    items: string[];
  }[];
  about: {
    tableOfContent: {
      display: boolean;
      subItems: boolean;
    };
  };
}

const TableOfContents: React.FC<TableOfContentsProps> = ({ structure, about }) => {
  const scrollTo = (id: string, offset: number) => {
    const element = document.getElementById(id);
    if (element) {
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - offset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  if (!about.tableOfContent.display) return null;

  const visible = structure.filter((s) => s.display);

  return (
    <Column
      position="fixed"
      left="0"
      style={{ top: "50%", transform: "translateY(-50%)", whiteSpace: "nowrap" }}
      paddingLeft="20"
      gap="4"
      hide="m"
    >
      {visible.map((section, i) => (
        <Flex
          key={i}
          cursor="interactive"
          className={styles.hover}
          gap="12"
          vertical="center"
          onClick={() => scrollTo(section.title, 80)}
          paddingY="4"
        >
          <Text
            variant="label-default-xs"
            onBackground="brand-weak"
            style={{ minWidth: "20px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}
          >
            {String(i + 1).padStart(2, "0")}
          </Text>
          <Text variant="label-default-s" onBackground="neutral-weak">
            {section.title}
          </Text>
        </Flex>
      ))}
    </Column>
  );
};

export default TableOfContents;
