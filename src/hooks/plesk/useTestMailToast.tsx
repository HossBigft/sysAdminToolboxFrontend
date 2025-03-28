import { useToast } from "@chakra-ui/react";
import React from "react";


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


export const useTestMailToast = () => {
    const toast = useToast();
  
    const showTestMailToast = (loginDetails) => {
      const toastId = toast({
        title: `Mailbox is ready. Password is ${loginDetails.password}`,
        description: (
          <div>
            <a
              href={loginDetails.login_link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={async () => {
                await copyToClipboard(loginDetails.password);
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
    };
  
    return { showTestMailToast };
  };