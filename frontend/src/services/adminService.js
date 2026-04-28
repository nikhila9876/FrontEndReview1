import axiosClient from '../api/axiosClient'

export function getAllStudents() {
  return axiosClient.get('/admin/students')
}

export function addMilestoneToStudent(studentId, payload) {
  return axiosClient.post(`/admin/students/${studentId}/milestones`, payload)
}

export function updateMilestone(milestoneId, payload) {
  return axiosClient.put(`/admin/milestones/${milestoneId}`, payload)
}

export function deleteMilestone(milestoneId) {
  return axiosClient.delete(`/admin/milestones/${milestoneId}`)
}

export function giveFeedbackToStudent(studentId, payload) {
  return axiosClient.post(`/admin/students/${studentId}/feedbacks`, payload)
}

export function getAllFeedbacks() {
  return axiosClient.get('/admin/feedbacks')
}

export function approveProject(projectId) {
  return axiosClient.put(`/admin/projects/approve/${projectId}`)
}
