import axios from 'axios'
const baseUrl = 'http://localhost:8000/api/v1/login/access-token'

const login = async credentials => {
  const response = await axios.post(baseUrl, credentials)
  return response.data
}

export default { login }