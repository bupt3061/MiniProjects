/**
 * 说明：创建集合
 * 参数：
 * name
 * 返回值：
 * resolve：{Result:errMsg}
 * reject
 */

// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database({
  env: "test-m3m5d"
})

// 云函数入口函数
exports.main = async (event, context) => {
  let ENV = cloud.getWXContext().ENV

  // updateConfig 方法动态更新配置
  cloud.updateConfig({
    env: ENV
  })

  try{
    return await db.createCollection('name')
  }catch(e) {
    console.log(e)
  }
}