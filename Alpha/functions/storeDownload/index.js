/**
 * 说明：从云端下载文件
 * 请求参数：
 * fileID：云端文件ID
 * 返回参数：
 * fileContent：文件内容
 * statusCode：HTTP状态码
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

  const fileID = event.fileID
  const res = await cloud.downloadFile({
    fileID: fileID,
  })
  const buffer = res.fileContent
  return buffer.toString('utf-8')
}