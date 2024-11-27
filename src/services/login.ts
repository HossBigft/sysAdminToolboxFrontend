import { client, loginAccessToken } from "../client/sdk.gen";
import type { LoginAccessTokenData } from "../client/types.gen";

client.setConfig({
  // set default base url for requests
  baseURL: import.meta.env.VITE_API_URL,
  // set default headers for requests
  headers: {
    Authorization: "Bearer <token_from_service_client>",
  },
});

const login = async (credentials: { username: string; password: string }) => {
  const loginData: LoginAccessTokenData = {
    body: {
      username: credentials.username,
      password: credentials.password,
    },
  };

  try {
    const response = await loginAccessToken(loginData);
    return response.data;
  } catch (error) {
    console.error(
      "Error logging in:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};
export default { login };
