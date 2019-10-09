/**
 * 说明：用云文件ID换取真实链接，有效期可自定义，默认1天且最大不超过1天
 * 请求参数：
 * fileList：云文件ID列表（String[]）
 * 返回参数：
 * fileList：文件列表（[{fileID, tempFileUrl, status, errMsg},...]）
 */

// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  let ENV = cloud.getWXContext().ENV

  // updateConfig 方法动态更新配置
  cloud.updateConfig({
    env: ENV
  })

  const result = await cloud.getTempFileURL({
    fileList: event.fileList,
  })
  return result.fileList
}