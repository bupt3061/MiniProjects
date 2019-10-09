/**
 * 说明：统计集合记录数或者查询语句对应的结果记录数
 * 返回值：
 * resolve: 结果数量（Result:total)
 * 
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
    name: event.name
  }).count()
}