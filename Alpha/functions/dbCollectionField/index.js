/**
 * 说明：指定结果中需要返回的字段
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
    return await user
    .where({
      name: "Jacob"
    })
    .field({
      name: true,
      addr: true
    }).get()
  }catch(e) {
    console.log(e)
  }
}