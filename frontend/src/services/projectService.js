import axiosClient from '../api/axiosClient'

export function getProjects() {
  return axiosClient.get('/projects')
}

export function getProjectsByStudent(studentId) {
  return axiosClient.get(`/projects/student/${studentId}`)
}

export function getProjectById(projectId) {
  return axiosClient.get(`/projects/${projectId}`)
}

export function createProject(payload) {
  return axiosClient.post('/projects', payload)
}

export function uploadProject(payload) {
  return axiosClient.post('/projects/upload', payload, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export function getProjectFileUrl(projectId) {
  return axiosClient.get(`/projects/file/${projectId}`)
}

export function updateProject(projectId, payload) {
  return axiosClient.put(`/projects/${projectId}`, payload)
}

export function deleteProject(projectId) {
  return axiosClient.delete(`/projects/${projectId}`)
}
