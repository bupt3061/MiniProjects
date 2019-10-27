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
  },
})