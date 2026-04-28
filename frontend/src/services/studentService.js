import axiosClient from '../api/axiosClient'

export function getStudentDashboard() {
  return axiosClient.get('/student/dashboard')
}

export function getStudentProfile() {
  return axiosClient.get('/student/profile')
}

export function updateStudentProfile(payload) {
  return axiosClient.put('/student/profile', payload)
}
