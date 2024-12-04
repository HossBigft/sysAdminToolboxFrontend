import { ChakraProvider } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import ReactDOM from "react-dom/client";
import { routeTree } from "./routeTree.gen";

import { StrictMode } from "react";
import { client } from "./client";
import theme from "./theme";

async function getAccessToken() {
  const token = await localStorage.getItem("access_token");
  return token || "";
}

const accessToken = await getAccessToken();
client.setConfig({
  // set default base url for requests
  baseURL: import.meta.env.VITE_API_URL,
  // set default headers for requests
  headers: {
    Authorization: "Bearer " + accessToken,
  },
});

const queryClient = new QueryClient();

const router = createRouter({ routeTree });
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ChakraProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ChakraProvider>
  </StrictMode>
);
