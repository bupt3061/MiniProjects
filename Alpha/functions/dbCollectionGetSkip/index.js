/**
 * 说明：获取分页数据
 */

// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const user = cloud.database({
  env: "test-m3m5d"
}).collection('user')

// 云函数入口函数
exports.main = async (event, context) => {
  let ENV = cloud.getWXContext().ENV

  // updateConfig 方法动态更新配置
  cloud.updateConfig({
    env: ENV
  })

  return await user.where({
    _openid: event.openid
  })
  .skip(event.skip * event.limit)
  .limit(event.limit)
  .get()
}