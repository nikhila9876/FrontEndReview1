import axiosClient from '../api/axiosClient'

export function getCurrentUser() {
  return axiosClient.get('/users/me')
}
