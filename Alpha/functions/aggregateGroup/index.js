// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database({
  env: "test-m3m5d"
})

// const db = cloud.database()

const $ = db.command.aggregate

// 云函数入口函数
exports.main = async(event, context) => {
  let ENV = cloud.getWXContext().ENV

  // updateConfig 方法动态更新配置
  cloud.updateConfig({
    env: ENV
  })

  db.collection('items').aggregate()
    .group({
      _id: '$category',
      num: $.sum(1)
    })
    .end()
}