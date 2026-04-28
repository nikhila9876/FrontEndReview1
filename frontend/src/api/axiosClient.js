import axios from 'axios'
import { getToken } from '../utils/authStorage'

const axiosClient = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

axiosClient.interceptors.request.use(
  (config) => {
    if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
      // Let browser set multipart boundary automatically.
      if (config.headers) {
        delete config.headers['Content-Type']
      }
    }
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

axiosClient.interceptors.response.use((response) => response, (error) => Promise.reject(error))

export default axiosClient
