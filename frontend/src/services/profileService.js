import axiosClient from '../api/axiosClient'

export function getCurrentProfile() {
  return axiosClient.get('/profile/me')
}

export function updateCurrentProfile(payload) {
  return axiosClient.put('/profile/me', payload)
}
