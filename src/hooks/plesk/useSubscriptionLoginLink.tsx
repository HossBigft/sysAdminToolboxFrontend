import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@chakra-ui/react";

import { getSubscriptionLoginLinkOptions } from "../../client/@tanstack/react-query.gen";

const useSubscriptionLoginLink = (clickedItem) => {
  const {
    data,
    refetch,
    isSuccess,
    isError,
    error: errorLogin,
  } = useQuery({
    ...getSubscriptionLoginLinkOptions({
      body: { host: clickedItem?.host, subscription_id: clickedItem?.id },
    }),
    queryKey: ["subscriptionLoginLink", clickedItem?.id],
    enabled: false,
    refetchOnWindowFocus: false,
  });
  const toast = useToast();

  useEffect(() => {
    if (isSuccess && data) {
      const toastId = toast({
        title: "Login link is ready",
        description: (
          <div>
            <a
              href={data}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => toast.close(toastId)}
              style={{ color: "blue", textDecoration: "underline" }}
            >
              Click me
            </a>
          </div>
        ),
        status: "success",
        duration: null,
        isClosable: true,
      });
    }
  }, [isSuccess, data, toast]);

  useEffect(() => {
    if (isError) {
      toast({
        title: "Error",
        description: `Failed to fetch login link: ${errorLogin.message}`,
        status: "error",
      });
    }
  }, [isError, errorLogin, toast]);

  useEffect(() => {
    if (clickedItem) {
      refetch();
    }
  }, [clickedItem, refetch]);

  return { refetch };
};

export default useSubscriptionLoginLink;
