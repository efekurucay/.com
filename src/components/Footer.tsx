import { Flex, IconButton, SmartLink, Text } from "@/once-ui/components";
import styles from "./Footer.module.scss";
import type { PersonData, SocialLink } from "@/lib/firestoreService";

type PersonShape = Partial<PersonData> & { name?: string };

interface FooterProps {
  person: PersonShape;
  social: Array<Partial<SocialLink> & { name: string; icon: string; link: string }>;
}

export const Footer: React.FC<FooterProps> = ({ person, social }) => {
  const currentYear = new Date().getFullYear();

  return (
    <Flex
      as="footer"
      position="relative"
      fillWidth
      padding="8"
      horizontal="center"
      mobileDirection="column"
    >
      <Flex
        className={styles.mobile}
        maxWidth="m"
        paddingY="8"
        paddingX="16"
        gap="16"
        horizontal="space-between"
        vertical="center"
      >
        <Text variant="body-default-s" onBackground="neutral-strong">
          <Text onBackground="neutral-weak">© {currentYear} /</Text>
          <Text paddingX="4">{person.name}</Text>
          <Text onBackground="neutral-weak">
          </Text>
        </Text>
        <Flex gap="16">
          {social.map(
            (item: any) =>
              item.link && (
                <IconButton
                  key={item.name}
                  href={item.link}
                  icon={item.icon}
                  tooltip={item.name}
                  size="s"
                  variant="ghost"
                />
              ),
          )}
        </Flex>
      </Flex>
      <Flex height="80" show="s"></Flex>
    </Flex>
  );
};
