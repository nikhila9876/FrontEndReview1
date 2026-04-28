import axiosClient from '../api/axiosClient'

export function getOwnFeedbacks() {
  return axiosClient.get('/student/feedbacks')
}
