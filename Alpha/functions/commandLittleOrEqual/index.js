/**
 * 说明：查询筛选条件，表示小于等于
 */

// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database({
  env: "test-m3m5d"
})

const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  let ENV = cloud.getWXContext().ENV

  // updateConfig 方法动态更新配置
  cloud.updateConfig({
    env: ENV
  })

  try {
    return await db.collection('todo').where({
      progress: _.lte(event.progress)
      // progress: _.gte(event.progress)  // 大约等于
    }).get()
  } catch (e) {
    console.log(e)
  }
}