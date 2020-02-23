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
    const now = new Date()

    // 处理时间并存储到全局
    for(var i = 0; i < courses.length; i++) {
      courses[i].shengyu = this.getTimeBetween(now, courses[i].endtime)
    }

    // 逆序
    var courseids = app.globalData.courseids
    var length = courseids.length

    var temp = []
    for(var i = 0; i < length; i++) {
      temp.push(courseids.pop())
    }

    var list = []
    for(var i = 0; i < temp.length; i++) {
      for(var j = 0; j < courses.length; j++) {
        if(temp[i] == courses[j]._id) {
          list.push(courses[j])
          break
        }
      }
    }

    console.log('courses', list)
    app.globalData.courses = list

    this.setData({
      courses: list
    })
  },
  /**
   * 其他函数
   */
  getTimeBetween: function (startDate, endDate) {
    var days = (endDate - startDate) / (1 * 24 * 60 * 60 * 1000)
    var timeString = null

    if(days < 0) {
      timeString = "已过期"
    } else if (days >= 365) {
      var years = days / 365
      timeString = "剩余：" + Math.floor(years).toString() + "年"
    } else if (days > 30 && days < 365) {
      var months = days / 30
      timeString = "剩余：" + Math.floor(months).toString() + "个月"
    } else if (days >= 7 && days < 30) {
      var weeks = days / 7
      timeString = "剩余：" + Math.floor(weeks).toString() + "周"
    } else if (days >= 1 && days < 7) {
      timeString = "剩余：" + Math.floor(days).toString() + "天"
    } else if (days < 1) {
      var hours = days * 24
      timeString = "剩余：" + Math.floor(hours).toString() + "小时"

      if (hours < 1) {
        var mins = hours * 60
        timeString = "剩余：" + Math.floor(mins).toString() + "分钟"
      }
    }

    return timeString
  },
  clickCourse: function(e) {
    const courseid = e.currentTarget.dataset.courseid
    console.log(courseid)
  },
  clickBtn: function (e) {
    const courseid = e.currentTarget.dataset.cu
    console.log(index)
  },
  addCourse: function() {

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