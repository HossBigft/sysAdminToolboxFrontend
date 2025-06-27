import {
    Box,
    Text,
    HStack,
    Icon,
    useColorModeValue,
    Tooltip,
    useClipboard,
    Flex, VStack
} from "@chakra-ui/react";
import {FaServer, FaGlobe, FaEnvelope, FaCopy, FaExclamationTriangle} from "react-icons/fa";
import {useState, useEffect} from "react";

const DnsInfoBar = ({internalARecord, internalMxRecord, googleARecord, googleMxRecord, zoneMaster}) => {
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

        const {ptr, mx, ip} = dnsRecord;
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

    const normalize = (val) => {
        if (!val) return "";

        if (typeof val === 'object' && !Array.isArray(val)) {
            const actualValue = val.ip || val.ptr || val.value || val.target || "";
            return String(actualValue).trim().toLowerCase();
        }

        if (Array.isArray(val)) {
            return val
                .map(v => {
                    if (typeof v === 'object') {
                        return String(v.ip || v.ptr || v.value || v.target || "").trim().toLowerCase();
                    }
                    return String(v).trim().toLowerCase();
                })
                .filter(v => v !== "")
                .sort()
                .join(",");
        }

        return String(val).trim().toLowerCase();
    };

    const RecordValue = ({value, isEmpty = false, isHighlighted = false}) => {
        const getDisplayValue = (val) => {
            if (!val) return "Empty";

            if (typeof val === 'object' && !Array.isArray(val)) {
                const actualValue = val.ip || val.ptr || val.value || val.target;
                return actualValue || "Empty";
            }

            if (Array.isArray(val)) {
                const displayValues = val
                    .map(v => {
                        if (typeof v === 'object') {
                            return v.ip || v.ptr || v.value || v.target || "";
                        }
                        return String(v);
                    })
                    .filter(v => v !== "");

                return displayValues.length > 0 ? displayValues.join(", ") : "Empty";
            }

            return String(val);
        };

        return (
            <Text
                fontSize="sm"
                color={isEmpty ? "gray.400" : "gray.700"}
                fontWeight={isHighlighted ? "semibold" : "normal"}
                _dark={{
                    color: isEmpty ? "gray.500" : "gray.200"
                }}
            >
                {getDisplayValue(value)}
            </Text>
        );
    };


    const RecordStatus = ({hasMatch, hasValues}) => {
        if (!hasValues) return null;

        return (
            <Icon
                as={hasMatch ? FaCheck : FaExclamationTriangle}
                color={hasMatch ? "green.500" : "orange.500"}
            />
        );
    };


    const RecordDisplay = ({
                               icon,
                               iconColor,
                               label,
                               externalRecordValue,
                               internalRecordValue,
                               tooltipContent,
                               id,
                           }) => {
        const {onCopy} = useClipboard(copyValue);
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


        const normalizedExternal = normalize(externalRecordValue);
        const normalizedInternal = normalize(internalRecordValue);
        const valuesMatch = normalizedExternal === normalizedInternal;

        const hasExternalValue = normalizedExternal !== "";
        const hasInternalValue = normalizedInternal !== "";
        const hasAnyValue = hasExternalValue || hasInternalValue;
        const hasDifference = !valuesMatch && hasAnyValue;

        return (
            <Tooltip
                hasArrow
                label={
                    isCopied ? (
                        "Copied!"
                    ) : hasDifference ? (
                        <Box as="span">
                            ⚠️ <b>DNS records mismatch. Check domain nameservers.</b>
                            <br />
                            <b>Google:</b> {normalizedExternal || "None"}
                            <br />
                            <b>Hoster.kz:</b> {normalizedInternal || "None"}
                        </Box>
                    ) : (
                        tooltipContent
                    )
                }
                placement="bottom"
                closeOnClick={false}
            >
                <HStack
                    spacing={3}
                    cursor="pointer"
                    onClick={handleCopy}
                    _hover={{bg: useColorModeValue("gray.50", "gray.700")}}
                    p={3}
                    borderRadius="md"
                    transition="all 0.2s"
                    position="relative"
                    role="group"
                    border="2px solid"
                    borderColor={hasDifference ? "red.300" : "transparent"}
                    bg={hasDifference ? "red.50" : "transparent"}
                    _dark={{
                        borderColor: hasDifference ? "red.500" : "gray.600",
                        bg: hasDifference ? "red.900" : "transparent"
                    }}
                >

                    <HStack spacing={2} minW="120px">
                        <Icon as={icon} color={iconColor}/>
                        <Text fontSize="sm" fontWeight="bold" color="gray.700" _dark={{color: "gray.200"}}>
                            {label}
                        </Text>
                        <RecordStatus hasMatch={valuesMatch} hasValues={hasAnyValue}/>
                    </HStack>


                    <Flex align="center" flex="1">
                        {valuesMatch ? (
                            <RecordValue
                                value={externalRecordValue || internalRecordValue}
                                isEmpty={!hasAnyValue}
                            />
                        ) : (
                            <VStack align="start" spacing={1} flex="1">
                                <RecordValue
                                    value={externalRecordValue}
                                    isEmpty={!hasExternalValue}
                                    isHighlighted={hasExternalValue}
                                />
                                <RecordValue
                                    value={internalRecordValue}
                                    isEmpty={!hasInternalValue}
                                    isHighlighted={hasInternalValue}
                                />
                            </VStack>
                        )}

                        <Icon
                            as={FaCopy}
                            color="gray.400"
                            ml={2}
                            fontSize="xs"
                            opacity="0"
                            _groupHover={{opacity: "1"}}
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
                    id="googleARecord"
                    icon={FaGlobe}
                    iconColor={iconColorA}
                    label="A Record"
                    externalRecordValue={googleARecord?.ptr || googleARecord?.ip || ""}
                    internalRecordValue={internalARecord?.ptr || internalARecord?.ip || ""}
                    tooltipContent={getTooltipContent(googleARecord)}
                />

                <RecordDisplay
                    id="googleMxRecord"
                    icon={FaEnvelope}
                    iconColor={iconColorB}
                    label="MX Record"
                    externalRecordValue={googleMxRecord?.ptr || googleMxRecord?.mx || googleMxRecord?.ip}
                    internalRecordValue={internalMxRecord?.ptr || internalMxRecord?.mx || internalMxRecord?.ip}
                    tooltipContent={getTooltipContent(googleMxRecord)}
                />

                <RecordDisplay
                    id="zoneMaster"
                    icon={FaServer}
                    iconColor={iconColorC}
                    label="ZoneMaster"
                    externalRecordValue={zoneMaster?.ptr || zoneMaster?.ip}
                    internalRecordValue={zoneMaster?.ptr || zoneMaster?.ip}
                    tooltipContent={getTooltipContent(zoneMaster)}
                />
            </HStack>
        </Box>
    );
};

export default DnsInfoBar;
