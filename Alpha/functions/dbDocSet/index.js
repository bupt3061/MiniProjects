/**
 * 说明：替换更新一条记录
 * 参数：
 * data: 更新对象（Object）
 * 返回值：
 * resolve：新增记录结果（Result:{_id, stats:updated}）
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

  try{
    return await user.doc(event.id).set({
      data: event.data
    })
  }catch(e) {
    console.log(e)
  }
}