/**
 * 说明：指定查询排序条件
 */

// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db= cloud.database({
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
    return await db.collection('user')
      .orderBy('name', 'asc')
      .orderBy('addr', 'desc')
      .get()
  }catch(e) {
    console.log(e)
  }
}