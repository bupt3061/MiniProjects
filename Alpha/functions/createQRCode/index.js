// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async(event, context) => {
  try {
    const result = await cloud.openapi.wxacode.createQRCode({
      path: event.path,
      width: 430,
      height: 430
    })
    return result
  } catch (err) {
    return err
  }
}