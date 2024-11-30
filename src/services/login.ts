import { client, loginAccessToken } from "../client/sdk.gen";
import type { Body_login_login_access_token } from "../client/types.gen";

client.setConfig({
  // set default base url for requests
  baseURL: import.meta.env.VITE_API_URL,
  // set default headers for requests
  headers: {
    Authorization: "bearer",
  },
});

const login = async (credentials: Body_login_login_access_token) => {
  try {
    const response = await loginAccessToken({ body: credentials });
    if (response.data) {
      localStorage.setItem("access_token", response.data.access_token);
    } else {
      throw new Error("No data returned in response");
    }
  } catch (error) {
    console.error(
      "Error logging in:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};
export default { login };
