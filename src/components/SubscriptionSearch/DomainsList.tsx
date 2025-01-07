import { useState } from "react";
import { Box, Text, Button, VStack } from "@chakra-ui/react";
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";

const DomainsList = ({ domains, initialDisplayCount = 3 }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const displayedDomains = isExpanded
    ? domains
    : domains.slice(0, initialDisplayCount);
  const hasMoreDomains = domains.length > initialDisplayCount;

  return (
    <VStack align="stretch" spacing={2}>
      {displayedDomains.map((domain, idx) => (
        <Text key={idx}>{domain}</Text>
      ))}
      {hasMoreDomains && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          rightIcon={isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
        >
          {isExpanded
            ? "Show Less"
            : `Show ${domains.length - initialDisplayCount} More`}
        </Button>
      )}
    </VStack>
  );
};

export default DomainsList;
