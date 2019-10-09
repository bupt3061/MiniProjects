/**
 * 说明：查询筛选条件，表示字段的值在给定的数组内
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

  try{
    return await db.collection('todo').where({
      // progress: _.nin(event.list)  // 不在数组的范围内
      progress: _.in(event.list)
    })
    .get()
  }catch(e){
    console.log(e)
  }
}