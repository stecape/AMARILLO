// Get the base URL for API calls
// When running through nginx, use relative paths
// When running in development without docker, use the env variable
export const getServerUrl = () => {
  // If we're accessing through port 80 (nginx), use relative path
  if (window.location.port === '80' || window.location.port === '') {
    return window.location.origin
  }
  // Otherwise use the env variable or localhost
  return process.env.REACT_APP_SERVER_IP || "http://localhost:3001"
}

export const getApiUrl = () => {
  // Always return just the base URL
  // The /api path will be added by the calling code
  return getServerUrl()
}
