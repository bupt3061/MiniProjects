/**
 * 说明：在表上新增数据
 * 参数：
 * data：新增记录（Obect）
 * 返回值：
 * resolve: {_id}
 * reject：失败原因
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
    return await user.add({
      data: event.data
    })
  }catch(e) {

  }
}