import { Flex, Text } from "@/once-ui/components";

export const HandoffWaiting = () => {
  const pulseStyle: React.CSSProperties = {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    backgroundColor: "#22c55e",
    animation: "handoff-pulse 1.5s infinite ease-in-out",
    flexShrink: 0,
  };

  return (
    <>
      <style>
        {`
          @keyframes handoff-pulse {
            0%, 100% { opacity: 0.4; transform: scale(0.8); }
            50% { opacity: 1; transform: scale(1.2); }
          }
        `}
      </style>
      <Flex align="center" gap="12" style={{ padding: "0.5rem 0.25rem" }}>
        <div style={pulseStyle} />
        <Text variant="body-default-s" onBackground="neutral-weak">
          Efe bağlanıyor...
        </Text>
      </Flex>
    </>
  );
};
