// pages/loginNext/loginNext.js

const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    openid: null,
    type: null,
    basicInfo: null,
    name: null,
    phone: null,
    courses: null
  },
  async init() {
    // 初始化

    let openid = await this.getOpenid()
    let type = await this.getType()

    app.globalData.openid = openid
    this.setData({
      openid: openid,
      type: type
    })
  },
  getOpenid: function () {
    return new Promise((resolve, reject) => {
      // 获取openid
      wx.cloud.callFunction({
        name: 'getInfo',
        data: {},
        success: res => {
          resolve(res.result.OPENID)
        },
        fail: err => {
          console.log(err)
          reject(err)
        }
      })
    })
  },
  getType: function() {
    return new Promise((resolve, reject) => {
      const app = getApp()
      var type = app.globalData.type
      if(type) {
        resolve(type)
      }
    })
  },
  confirm: function() {
    // 

    // 跳转到首页
    wx.switchTab({
      url: '../index/index',
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.init()

    
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