// pages/homework/homework.js
const app = getApp()

const dt = require('../../utils/date.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    tasks: [],
    uploadNum: 0
  },
  /**
   * 初始化函数
   */
  init: function() {
    var tasks = app.globalData.tasks
    var courses = app.globalData.courses

    const date = new Date()

    // 处理tasks
    for (var i = 0; i < tasks.length; i++) {
      // 获得封面
      for (var j = 0; j < courses.length; j++) {
        if (courses[j]._courseid == tasks[i]._courseid) {
          tasks[i].tempFileURL = courses[j].tempFileURL
        }
      }
    }

    var wtj_tasks = [] // 未提交
    var ygq_tasks = [] // 已过期
    var ytj_tasks = [] // 已提交
    var kxg_tasks = [] // 可修改

    for (var i = 0; i < tasks.length; i++) {
      if (tasks[i].upload && tasks[i].past_upload) {
        ytj_tasks.push(tasks[i])
      } else if (tasks[i].upload && !tasks[i].past_upload) {
        kxg_tasks.push(tasks[i])
      } else if (!tasks[i].upload && !tasks[i].past_upload) {
        wtj_tasks.push(tasks[i])
      } else {
        ygq_tasks.push(tasks[i])
      }
    }

    for(var i = 0; i < wtj_tasks.length; i++) {
      wtj_tasks[i].jiezhi = this.getTimeBetween(date, wtj_tasks[i].uploadend)
    }

    for (var i = 0; i < kxg_tasks.length; i++) {
      kxg_tasks[i].jiezhi = this.getTimeBetween(date, kxg_tasks[i].uploadend)
    }

    for(var i = 0; i < ytj_tasks.length; i++) {
      ygq_tasks[i].zhouqi = dt.formatTime(ygq_tasks[i].uploadstart) + " - " + dt.formatTime(ygq_tasks[i].uploadend)
    }

    for (var i = 0; i < ytj_tasks.length; i++) {
      ytj_tasks[i].zhouqi = dt.formatTime(ytj_tasks[i].uploadstart) + " - " + dt.formatTime(ytj_tasks[i].uploadend)
    }

    console.log(tasks)
    console.log("未提交", wtj_tasks)
    console.log("已提交", ytj_tasks)
    console.log("已过期", ygq_tasks)
    console.log("可修改", kxg_tasks)

    this.setData({
      tasks: app.globalData.tasks
    })
  },
  /**
   * 页面其他函数
   */
  getTimeBetween: function(startDateString, endDateString) {
    var startDate = Date.parse(startDateString)
    var endDate = Date.parse(endDateString)
    var days = (endDate - startDate) / (1 * 24 * 60 * 60 * 1000)
    var timeString = null

    if (days < 1) {
      var hours = days * 24
      timeString = Math.floor(hours).toString() + "小时"

      if (hours < 1) {
        var mins = hours * 60
        timeString = Math.floor(mins).toString() + "分钟"
      }
    } else if (days >= 1) {
      timeString = Math.floor(days).toString() + "天"
    }

    return timeString
  },
  getHoursBetween: function(startDateString, endDateString) {
    var startDate = Date.parse(startDateString)
    var endDate = Date.parse(endDateString)
    var days = (endDate - startDate) / (60 * 60 * 1000)

    return days;
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      uploadNum: options.uploadNum
    })
    this.init()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})