// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database({
  env: "test-m3m5d"
})

const $ = db.command.aggregate

// 云函数入口函数
exports.main = async(event, context) => {
  let ENV = cloud.getWXContext().ENV

  // updateConfig 方法动态更新配置
  cloud.updateConfig({
    env: ENV
  })

  try {
    db.collection('items').aggregate()
      .bucket({
        groupBy: '$price',
        boundaries: [0, 50, 100],
        default: 'other',
        output: {
          count: $.sum(),
          ids: $.push('$_id')
        }
      })
      .end()
  } catch (e) {
    console.log(e)
  }
}