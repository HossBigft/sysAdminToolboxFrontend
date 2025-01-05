import { useToast } from "@chakra-ui/react";

export const useToastHelpers = () => {
  const toast = useToast();

  const showSuccessToast = (title, description) => {
    toast({
      title,
      description,
      status: "success",
      duration: 5000,
      isClosable: true,
    });
  };

  const showErrorToast = (title, description) => {
    toast({
      title,
      description,
      status: "error",
      duration: 5000,
      isClosable: true,
    });
  };

  return { showSuccessToast, showErrorToast };
};
