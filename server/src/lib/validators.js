module.exports = {
  isValidEmail,
  normalizeInt,
}

/**
 * @param {string} value
 * @returns {boolean}
 */
function isValidEmail(value) {
  const emailRegex = /^[a-z0-9]([a-z0-9_]|[\'+._-]+[a-z0-9])*@[a-z0-9]([a-z0-9]|[+._-][a-z0-9])*[.][a-z]{2,10}$/i
  return emailRegex.test(value)
}

/**
 * @param {mixed} val
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function normalizeInt(val, min, max) {
  val = parseInt(val, 10);
  if (val < min || isNaN(val)) {
    return min;
  } else if (val > max) {
    return max;
  } else {
    return val;
  }
}
