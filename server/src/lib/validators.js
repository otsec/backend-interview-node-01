module.exports = {
  isValidEmail,
}

/**
 * @param {string} value
 * @returns {boolean}
 */
function isValidEmail(value) {
  const emailRegex = /^[a-z0-9]([a-z0-9_]|[\'+._-]+[a-z0-9])*@[a-z0-9]([a-z0-9]|[+._-][a-z0-9])*[.][a-z]{2,10}$/i
  return emailRegex.test(value)
}

