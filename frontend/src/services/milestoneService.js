import axiosClient from '../api/axiosClient'

export function getMilestonesByStudentId(studentId) {
  return axiosClient.get(`/milestones/student/${studentId}`)
}

export function getOwnMilestones() {
  return axiosClient.get('/student/milestones')
}
