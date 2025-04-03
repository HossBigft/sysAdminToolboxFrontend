import { Box, Text, HStack, Icon, useColorModeValue } from "@chakra-ui/react";
import { FaServer, FaGlobe, FaEnvelope } from "react-icons/fa";

const DnsInfoBar = ({ aRecord, mxRecord, zoneMaster, isLoading }) => {
  if (isLoading) return null;

  // Color values that will change depending on the color mode
  const bgColor = useColorModeValue("gray.50", "gray.700"); // Light: gray.50, Dark: gray.700
  const textColor = useColorModeValue("gray.700", "gray.200"); // Light: gray.700, Dark: gray.200
  const iconColorA = useColorModeValue("green.500", "green.300");
  const iconColorB = useColorModeValue("blue.500", "blue.300");
  const iconColorC = useColorModeValue("yellow.500", "yellow.300");

  return (
    <Box
      width="100%"
      p={4}
      borderRadius="md"
      borderWidth="1px"
      boxShadow="sm"
      bg={bgColor} // Use color mode-aware bg color
    >
      <HStack spacing={6} justify="flex-start" flexWrap="wrap">
        <HStack spacing={2}>
          <Icon as={FaGlobe} color={iconColorA} />
          <Text fontSize="sm" fontWeight="bold" color={textColor}>
            A Record:
          </Text>
          <Text fontSize="sm" color={textColor}>
            {aRecord?.ptr || aRecord?.ip || "Empty"}
          </Text>
        </HStack>

        <HStack spacing={2}>
          <Icon as={FaEnvelope} color={iconColorB} />
          <Text fontSize="sm" fontWeight="bold" color={textColor}>
            MX Record:
          </Text>
          <Text fontSize="sm" color={textColor}>
            {mxRecord?.ptr || mxRecord?.ip || "Empty"}
          </Text>
        </HStack>

        <HStack spacing={2}>
          <Icon as={FaServer} color={iconColorC} />
          <Text fontSize="sm" fontWeight="bold" color={textColor}>
            ZoneMaster:
          </Text>
          <Text fontSize="sm" color={textColor}>
            {zoneMaster?.ptr || zoneMaster?.ip || "Empty"}
          </Text>
        </HStack>
      </HStack>
    </Box>
  );
};

export default DnsInfoBar;
