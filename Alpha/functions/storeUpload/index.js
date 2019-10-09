/**
 * 说明：上传文件到云端
 * 请求参数：
 * cloudPath：云端路径
 * fileContent：文件内容（Buffer或fs.ReadStream）
 * 返回结果：
 * fileID：文件ID
 * statusCode：HTTP状态码
 */

// 云函数入口文件
const cloud = require('wx-server-sdk')
const fs = require('fs')
const path = require('path')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  let ENV = cloud.getWXContext().ENV

  // updateConfig 方法动态更新配置
  cloud.updateConfig({
    env: ENV
  })

  return await cloud.uploadFile({
    cloudPath: event.cloudPath,
    fileContent: event.filePath,
  })
}