//index.js

// 引入外部js
const stg = require('../../js/storage.js')

//获取应用实例
const app = getApp()

Page({
  data: {
    openid: null,
    type: null,
    taskNum: 0,
    mutualEvaluateNum: 0,
    courses: [],
    tasks: []
  },
  async init() {

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    this.init()
    this.setData({
      type: app.globalData.type,
      openid: app.globalData.openid
    })
    console.log(this.data)
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})