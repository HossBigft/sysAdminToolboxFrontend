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

  const options = {
    ...loginData,  // Spread the login data directly into options
    headers: {
      "Content-Type": "application/x-www-form-urlencoded", // Make sure the correct content type is set
      accept: "application/json", // Expect JSON response
    },
  };

  try {
    // Send the POST request with the formatted data and appropriate headers
    const response = await loginAccessToken(options);

    return response.data; // Return the response data, typically an access token
  } catch (error) {
    console.error("Error logging in:", error.response ? error.response.data : error.message);
    throw error; // Propagate the error to handle it elsewhere
  }
};
export default { login };
