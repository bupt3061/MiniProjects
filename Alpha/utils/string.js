/**
 * 处理字符串
 */

function handleTaskName(str) {
  if(str.length <= 8) {
    return str
  }

  return str.slice(0, 8) + '...'
}

function handleCourseName(str) {
  if (str.length <= 5) {
    return str
  }

  return str.slice(0, 5)
}

function handleCourseName2(str) {
  if (str.length <= 6) {
    return str
  }

  return str.slice(0, 6) + '...'
}

function handleListTaskName(str) {
  if (str.length <= 12) {
    return str
  }

  return str.slice(0, 12) + '...'
}

function handleWorkName(str) {
  if (str.length <= 28) {
    return str
  }

  return str.slice(0, 28) + '...'
}

module.exports = {
  handleTaskName: handleTaskName,
  handleCourseName: handleCourseName,
  handleListTaskName: handleListTaskName,
  handleWorkName: handleWorkName,
  handleCourseName2: handleCourseName2
}