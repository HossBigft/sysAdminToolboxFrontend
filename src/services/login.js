import axios from 'axios'
const baseUrl = 'http://localhost:8000/api/v1/login/access-token'

const login = async credentials => {
  // Create a URLSearchParams object to format the data as x-www-form-urlencoded
  const params = new URLSearchParams();
  params.append('grant_type', 'password');
  params.append('username', credentials.username); // Use the actual username
  params.append('password', credentials.password); // Use the actual password
  params.append('scope', ''); // Empty if no scope is provided
  params.append('client_id', credentials.client_id); // Use the actual client_id
  params.append('client_secret', credentials.client_secret); // Use the actual client_secret

  try {
    // Send the POST request with the formatted data and appropriate headers
    const response = await axios.post(baseUrl, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded', // Make sure the correct content type is set
        'accept': 'application/json' // Expect JSON response
      }
    });

    return response.data; // Return the response data, typically an access token
  } catch (error) {
    console.error('Error logging in:', error.response.data);
    throw error; // Propagate the error to handle it elsewhere
  }
}
export default { login }