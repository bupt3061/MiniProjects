/**
 * openid: 同一小程序下用户的openid是相同的
 * appid：唯一标志小程序
 * unionid：同一平台下用户的unionid是相同的
 */

const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  let { OPENID, APPID, UNIONID, ENV} = cloud.getWXContext()

  // updateConfig 方法动态更新配置
  cloud.updateConfig({
    env: ENV
  })

  return {
    OPENID,
    APPID,
    UNIONID
  }
}