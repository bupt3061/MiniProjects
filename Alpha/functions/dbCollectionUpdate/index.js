/**
 * 说明：更新多条记录
 * 参数：data
 * 返回结果：
 * resolve：新增记录结果（Result:{stats:updated}）
 * reject
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

  try{
    return await db.collection('user').where({
      name: event.name
    })
    .update({
      data: {
        phone: event.phone
      }
    })
  }
  catch(e) {
    console.log(e)
  }
}