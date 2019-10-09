/**
 * 说明：删除一条数据
 * 返回值：
 * resolve：新增记录结果（Result:removed）
 * reject
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
    return await user.doc({
      name: event.name,
      phone: event.phone,
    }).remove()
  }catch(e){
    console.log(e)
  }
}