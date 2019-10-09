/**
 * 说明：获取集合数据，或根据查询条件筛选后的集合数据
 * 没有指定limit，默认最多获取20条数据
 * 没有指定skip，默认从第0条开始取数据
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
  }).get()
}