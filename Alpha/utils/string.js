/**
 * 处理字符串
 */

function handleTaskName(str) {
  if(str.length <= 8) {
    return str
  }

  return str.slice(0, 7) + '...'
}

function handleCourseName(str) {
  if (str.length <= 5) {
    return str
  }

  return str.slice(0, 4)
}

module.exports = {
  handleTaskName: handleTaskName,
  handleCourseName: handleCourseName
}