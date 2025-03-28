import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@chakra-ui/react";

import { createTestmailForDomainOptions } from "../../client/@tanstack/react-query.gen";

async function copyToClipboard(textToCopy) {
  // Navigator clipboard api needs a secure context (https)
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(textToCopy);
  } else {
    // Use the 'out of viewport hidden text area' trick
    const textArea = document.createElement("textarea");
    textArea.value = textToCopy;

    // Move textarea out of the viewport so it's not visible
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
  const [shouldFetch, setShouldFetch] = useState(false);

  const {
    data,
    isSuccess,
    isError,
    error: errorLogin,
  } = useQuery({
    ...createTestmailForDomainOptions({
      query: { server: clickedItem?.host, maildomain: domain },
    }),
    queryKey: ["testMailLoginLink", domain],
    enabled: shouldFetch && !!clickedItem,
    refetchOnWindowFocus: false,
    retry: 0,
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
      setShouldFetch(false);
    }
  }, [isSuccess, data, toast]);

  useEffect(() => {
    if (isError) {
      toast({
        title: "Error",
        description: `Failed to fetch webmail login link: ${errorLogin.message}`,
        status: "error",
      });
    }
  }, [isError, errorLogin, toast]);

  return {
    fetch: () => {
      setShouldFetch(true);
    },
  };
};

export default useCreateTestMail;
