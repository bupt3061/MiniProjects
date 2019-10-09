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
    return await db.collection('score').aggregate()
      .addFields({
        totalHomework: $.sum('$homework'),
        totalQuiz: $.sum('$quiz')
      })
      .addFields({
        // totalScore: $.add(['$totalHomework', '$totalQuiz', '$extraCredit'])
        totalScore: $.sum(['$totalHomework', '$totalQuiz', '$extraCredit'])
      })
      .end()
  } catch (e) {
    console.log(e)
  }
}