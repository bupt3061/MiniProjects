//index.js

// 引入外部js
const stg = require('../../js/storage.js')

//获取应用实例
const app = getApp()

Page({
  data: {
    type: null,
    taskNum: 0,
    mutualEvaluateNum: 0,
  },
  onLoad: function() {
    this.setData({
      type: app.globalData.type
    })

    // 查询一条记录
    const db = wx.cloud.database({
      env: 'test-m3m5d'
    })
    const _ = db.command

    var stu = db.collection('stu')

    stu.doc('1c756ce65db4fe4a00ab578512a8c17a')
      .get()
      .then(res => {
        console.log(res.data)
      })
      .catch(err => {
        console.log(err)
      })

    // 查询多个记录
    var teach = db.collection('teach')

    teach.where({
        gender: _.eq(2)
      })
      .get()
      .then(res => {
        console.log(res.data)
      })
      .catch(err => {
        console.log(err)
      })

    // 查询集合
    teach.get()
      .then(res => {
        console.log(res.data)
      })
      .catch(err => {
        console.log(err)
      })
  },
})