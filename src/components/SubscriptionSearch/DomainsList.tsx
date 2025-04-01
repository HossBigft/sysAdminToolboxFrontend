import { Tooltip, VStack, Text, Flex, useClipboard } from "@chakra-ui/react";
const DomainsList = ({ domains }) => {
  const initialDisplayCount = 2;
  const hasMoreDomains = domains.length > initialDisplayCount;
  const { onCopy, hasCopied } = useClipboard(domains.join("\n")); // Copy all domains

  return (
    <Tooltip
      label={
        <VStack
          align="start"
          overflowY="auto"
          spacing={1}
          p={1}
          pointerEvents="auto"
        >
          {domains.map((domain, idx) => (
            <Text key={idx} fontSize="xs">
              {domain}
            </Text>
          ))}
        </VStack>
      }
      hasArrow
      placement="bottom-start"
      gutter={5}
    >
      <VStack align="start" spacing={1} width="100%">
        {domains.slice(0, initialDisplayCount).map((domain, idx) => (
          <Text key={idx} fontSize="sm">
            {domain}
          </Text>
        ))}

        {hasMoreDomains && (
          <Flex
            width="100%"
            borderWidth="1px"
            borderRadius="md"
            borderStyle="dashed"
            py={1}
            cursor="pointer"
            onClick={onCopy} // Copies all domains on click
          >
            <Text fontSize="xs" color="gray.500">
              {hasCopied
                ? "Copied!"
                : `+${domains.length - initialDisplayCount} more`}
            </Text>
          </Flex>
        )}
      </VStack>
    </Tooltip>
  );
};

export default DomainsList;
