/**
 * 说明：正则匹配
 * flag：i(大小写不敏感)、m(跨行匹配)、s(让.可以匹配包括换行符在内的所有字符)
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
    return await db.collection('user').where({
      name: new db.RegExp({
        regexp: event.regexp,
        options: event.options
      })
    }).get()
  }catch(e) {
    console.log(e)
  }
 }