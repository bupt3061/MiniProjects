// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: "test-m3m5d"
})

const db = cloud.database({
  env: "test-m3m5d"
})

const $ = db.command.aggregate
const { gt, sum } = db.command.aggregate

// 云函数入口函数
exports.main = async(event, context) => {
  let ENV = cloud.getWXContext().ENV

  // updateConfig 方法动态更新配置
  cloud.updateConfig({
    env: ENV
  })

  db.collection('items')
    .aggregate()
    .match({
      price: gt(50)
    })
    .group({
      _id: null,
      count: sum(1)
    })
    .end()
}