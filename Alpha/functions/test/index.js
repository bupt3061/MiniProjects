// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  // updateConfig 方法动态更新配置
  let { OPENID, APPID, UNIONID, ENV } = cloud.getWXContext()
  cloud.updateConfig({
    env: ENV
  })

  return new Promise((resolve, reject) => {
    const now = new Date()

    const db = cloud.database()
    const _ = db.command
    const $ = _.aggregate

    db.collection('task').aggregate()
    .match({
      _courseid: _.in(event.courseids),
      uploadstart: _.lte(now),
      uploadend: _.gte(now)
    })
    .lookup({
      from: 'work',
      localField: '_id',
      foreignField: '_taskid',
      as: 'list',
    })
    .end()
    .then(res => {
      resolve(res)
    })
    .catch(err => {
      reject(err)
    })
  })
}