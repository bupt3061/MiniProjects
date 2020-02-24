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

  return str.slice(0, 5)
}

function handleListTaskName(str) {
  if (str.length <= 12) {
    return str
  }

  return str.slice(0, 11) + '...'
}

module.exports = {
  handleTaskName: handleTaskName,
  handleCourseName: handleCourseName,
  handleListTaskName: handleListTaskName
}