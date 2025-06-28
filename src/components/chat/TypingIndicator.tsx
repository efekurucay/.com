import { Flex } from "@/once-ui/components";

export const TypingIndicator = () => {
  const dotStyle = {
    width: '8px',
    height: '8px',
    margin: '0 3px',
    backgroundColor: 'var(--text-weaker)',
    borderRadius: '50%',
    animation: 'typing-animation 1.4s infinite ease-in-out both',
  };

  return (
    <>
      <style>
        {`
          @keyframes typing-animation {
            0%, 80%, 100% {
              transform: scale(0);
            }
            40% {
              transform: scale(1.0);
            }
          }
        `}
      </style>
      <Flex align="center" style={{padding: '0.5rem 0.25rem'}}>
        <div style={{ ...dotStyle, animationDelay: '-0.32s' }} />
        <div style={{ ...dotStyle, animationDelay: '-0.16s' }} />
        <div style={{ ...dotStyle }} />
      </Flex>
    </>
  );
}; 