import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@chakra-ui/react";

import { createTestmailForDomainOptions } from "../../client/@tanstack/react-query.gen";

async function copyToClipboard(textToCopy) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(textToCopy);
  } else {
    const textArea = document.createElement("textarea");
    textArea.value = textToCopy;
    textArea.style.position = "absolute";
    textArea.style.left = "-999999px";

    document.body.prepend(textArea);
    textArea.select();

    try {
      document.execCommand("copy");
    } catch (error) {
      console.error(error);
    } finally {
      textArea.remove();
    }
  }
}

const useCreateTestMail = (clickedItem, domain) => {
  const [shouldTriggerQuery, setShouldTriggerQuery] = useState(false);

  const {
    data,
    isSuccess,
    isError,
    error: errorLogin,
    refetch
  } = useQuery({
    ...createTestmailForDomainOptions({
      query: { server: clickedItem?.host, maildomain: domain },
    }),
    queryKey: ["testMailLoginLink", domain],
    enabled: shouldTriggerQuery && !!domain && !!clickedItem,
    refetchOnWindowFocus: false,
    staleTime: 5 * (60 * 1000), // 5 mins
  });
  
  const toast = useToast();

  useEffect(() => {
    if (isSuccess && data) {
      const toastId = toast({
        title: `Mailbox is ready. Password is ${data.password}`,
        description: (
          <div>
            <a
              href={data.login_link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={async () => {
                await copyToClipboard(data.password);
                toast.close(toastId);
              }}
              style={{ color: "blue", textDecoration: "underline" }}
            >
              Click to open webmail and copy password.
            </a>
          </div>
        ),
        status: "success",
        duration: null,
        isClosable: true,
      });
      setShouldTriggerQuery(false);
    }
  }, [isSuccess, data, toast]);

  useEffect(() => {
    if (isError) {
      toast({
        title: "Error",
        description: `Failed to fetch webmail login link: ${errorLogin.message}`,
        status: "error",
      });
      setShouldTriggerQuery(false);
    }
  }, [isError, errorLogin, toast]);

  return {
    fetch: () => {
      setShouldTriggerQuery(true);
      refetch();
    },
  };
};

export default useCreateTestMail;