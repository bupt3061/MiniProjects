// pages/course/course.js
const app = getApp()
const dt = require('../../utils/date.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    courses: null
  },
  /**
   * 初始化函数
   */
  init: function() {
    var courses = app.globalData.courses

    // 处理时间并存储到全局
    for(var i = 0; i < courses.length; i++) {
      courses[i].zhouqi = dt.formatTime(courses[i].starttime) + '-' + dt.formatTime(courses[i].endtime)
    }

    console.log('courses', courses)
    app.globalData.courses = courses

    this.setData({
      courses: courses
    })
  },
  /**
   * 其他函数
   */
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