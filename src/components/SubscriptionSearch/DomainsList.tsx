import { Tooltip, VStack, Text, Flex } from "@chakra-ui/react";

const DomainsList = ({ domains }) => {
  const initialDisplayCount = 2;
  const hasMoreDomains = domains.length > initialDisplayCount;

  return (
    <Tooltip
      label={
        <VStack
          align="start"
          overflowY="auto"
          spacing={1}
          p={1}
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
          >
            <Text fontSize="xs" color="gray.500">
              +{domains.length - initialDisplayCount} more
            </Text>
          </Flex>
        )}
      </VStack>
    </Tooltip>
  );
};

export default DomainsList;
