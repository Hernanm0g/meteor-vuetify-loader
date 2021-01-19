/**
 * Name kebabToPascal
 * Description: convert kebab-case string to PascalCase
 * @param  {String} string kebab-case string
 * @returns {String} PascalCase string
 */
module.exports = (string) => {
  let parts = string.split("-")
  parts = parts.map(v=> v.charAt(0).toUpperCase() + v.slice(1))
  return parts.join("")
};