/**
 * 说明：从云端删除文件，一次最多50
 * 请求参数：
 * fileList：云文件ID列表（String[]）
 * 返回参数：
 * fileList：[{fileID, status, errMsg},...]
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

  const fileIDs = event.fileIDs
  const result = await cloud.deleteFile({
    fileList: fileIDs,
  })
  return result.fileList
}