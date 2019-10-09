/**
 * 说明：更新指令，表示删除某个字段
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
        tags: _.remove()
      }
    })
  }
  catch (e) {
    console.log(e)
  }
}