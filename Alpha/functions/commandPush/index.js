/**
 * 说明：更新指令，向数组尾部添加数据（若字段为空则创建该字段并传入值）
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
    return await db.collection('todo').doc('HXdoPAf7BO7zChkROxMJAO1R25Vw7tlABceYvBLdzKl45mAq').update({
      data: {
        tags: _.push(event.tags)
      }
    })
  }
  catch (e) {
    console.log(e)
  }
}