export function extractApiData(responseData) {
  if (
    responseData &&
    typeof responseData === 'object' &&
    Object.prototype.hasOwnProperty.call(responseData, 'success') &&
    Object.prototype.hasOwnProperty.call(responseData, 'data')
  ) {
    return responseData.data
  }
  return responseData
}

export function extractApiError(error, fallback = 'Request failed.') {
  const payload = error?.response?.data
  if (payload?.message) return payload.message
  if (Array.isArray(payload?.validationErrors) && payload.validationErrors.length > 0) {
    return payload.validationErrors.join(', ')
  }
  if (error?.message) return error.message
  return fallback
}
