import {
  Box,
  Text,
  HStack,
  Icon,
  useColorModeValue,
  Tooltip,
  useClipboard,
  Flex,
} from "@chakra-ui/react";
import { FaServer, FaGlobe, FaEnvelope, FaCopy } from "react-icons/fa";
import { useState, useEffect } from "react";

const DnsInfoBar = ({ aRecord, mxRecord, zoneMaster, isLoading }) => {
  const [copyValue, setCopyValue] = useState("");
  const [lastCopied, setLastCopied] = useState("");

  // Reset "Copied!" state after a delay
  useEffect(() => {
    if (lastCopied) {
      const timer = setTimeout(() => {
        setLastCopied("");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [lastCopied]);

  if (isLoading) return null;

  // Color values that will change depending on the color mode
  const bgColor = useColorModeValue("gray.50", "gray.700");
  const textColor = useColorModeValue("gray.700", "gray.200");
  const iconColorA = useColorModeValue("green.500", "green.300");
  const iconColorB = useColorModeValue("blue.500", "blue.300");
  const iconColorC = useColorModeValue("yellow.500", "yellow.300");
  const copyIconColor = useColorModeValue("gray.400", "gray.500");
  const copyHoverBg = useColorModeValue("gray.100", "gray.600");

  const getTooltipContent = (dnsRecord) => {
    if (!dnsRecord) return "";
  
    const { ptr, mx, ip } = dnsRecord;
    const parts = [];
  
    // If ptr exists, start by adding it
    if (ptr) {
      if (mx && ip) {
        parts.push(`${ptr} [${mx} ${ip}]`);
      } else if (ip) {
        parts.push(`${ptr} [${ip}]`);
      } else {
        parts.push(ptr);
      }
    } 
    // If only mx and ip exist, handle them separately
    else if (mx && ip) {
      parts.push(`${mx} [${ip}]`);
    } else if (mx) {
      parts.push(`${mx} []`);
    } else if (ip) {
      parts.push(ip);
    }
  
    return parts.join(" ").trim();
  };
  
  
  
  // Record display component with copy functionality
  const RecordDisplay = ({
    icon,
    iconColor,
    label,
    value,
    tooltipContent,
    id,
  }) => {
    const { onCopy } = useClipboard(copyValue);
    const isCopied = lastCopied === id;

    const handleCopy = () => {
      const valueToCopy = tooltipContent.replace(/[\[\]]/g, "");
      setCopyValue(valueToCopy);
      setLastCopied(id);
    };

    useEffect(() => {
      if (copyValue) {
        onCopy();
      }
    }, [copyValue]);

    return (
      <Tooltip
        hasArrow
        label={isCopied ? "Copied!" : tooltipContent}
        placement="bottom"
        closeOnClick={false}
      >
        <HStack
          spacing={2}
          cursor="pointer"
          onClick={handleCopy}
          _hover={{ bg: copyHoverBg }}
          p={2}
          borderRadius="md"
          transition="all 0.2s"
          position="relative"
          role="group"
        >
          <Icon as={icon} color={iconColor} />
          <Text fontSize="sm" fontWeight="bold" color={textColor}>
            {label}:
          </Text>
          <Flex align="center">
            <Text fontSize="sm">{value || "Empty"}</Text>
            <Icon
              as={FaCopy}
              color={copyIconColor}
              ml={2}
              fontSize="xs"
              opacity="0"
              _groupHover={{ opacity: "1" }}
              transition="opacity 0.2s"
            />
          </Flex>
          {isCopied && (
            <Text
              position="absolute"
              right="0"
              top="-20px"
              color="green.500"
              fontSize="xs"
              fontWeight="bold"
              px={2}
              py={1}
              borderRadius="md"
              bg={useColorModeValue("white", "gray.800")}
              boxShadow="sm"
            >
              Copied!
            </Text>
          )}
        </HStack>
      </Tooltip>
    );
  };

  return (
    <Box
      width="100%"
      p={4}
      borderRadius="md"
      borderWidth="1px"
      boxShadow="sm"
      bg={bgColor}
    >
      <HStack spacing={6} justify="flex-start" flexWrap="wrap">
        <RecordDisplay
          id="aRecord"
          icon={FaGlobe}
          iconColor={iconColorA}
          label="A Record"
          value={aRecord?.ptr || aRecord?.ip || ""}
          tooltipContent={getTooltipContent(aRecord)}
        />

        <RecordDisplay
          id="mxRecord"
          icon={FaEnvelope}
          iconColor={iconColorB}
          label="MX Record"
          value={mxRecord?.ptr || mxRecord?.mx || mxRecord?.ip || ""}
          tooltipContent={getTooltipContent(mxRecord)}
        />

        <RecordDisplay
          id="zoneMaster"
          icon={FaServer}
          iconColor={iconColorC}
          label="ZoneMaster"
          value={zoneMaster?.ptr || zoneMaster?.ip || ""}
          tooltipContent={getTooltipContent(zoneMaster)}
        />
      </HStack>
    </Box>
  );
};

export default DnsInfoBar;
