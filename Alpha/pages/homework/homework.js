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
  async init() {
    var tasks = app.globalData.tasks
    var courses = app.globalData.courses
    var openid = app.globalData.openid

    const date = new Date()

    // 处理tasks
    for (var i = 0; i < tasks.length; i++) {
      // 获得封面
      for (var j = 0; j < courses.length; j++) {
        if (courses[j]._id == tasks[i]._courseid) {
          tasks[i].tempFileURL = courses[j].tempFileURL
        }
      }
    }

    // 获得已提交作业
    let works = await this.getWork(openid)
    console.log("作业", works)

    for (var i = 0; i < tasks.length; i++) {
      // 链接作业
      for(var j =0; j < works.length; j++) {
        if(tasks[i]._id == works[j]._taskid) {
          tasks[i]._workid = works[j]._id
          tasks[i].uploadtime = works[j].uploadtime
        }
      }
    }

    // 分组
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

    // 处理未提交
    if (wtj_tasks.length != 0) {
      for (var i = 0; i < wtj_tasks.length; i++) {
        // 获得截止日期
        wtj_tasks[i].jiezhi = this.getTimeBetween(date, new Date(wtj_tasks[i].uploadend))
      }

      for (var i = 0; i < wtj_tasks.length; i++) {
        // 排序
        for (var j = 0; j < wtj_tasks.length - i - 1; j++) {
          if (new Date(wtj_tasks[j].uploadend) > new Date(wtj_tasks[j + 1].uploadend)) {
            var temp = wtj_tasks[j + 1]
            wtj_tasks[j + 1] = wtj_tasks[j]
            wtj_tasks[j] = temp
          }
        }
      }
    }

    // 处理可修改
    if (kxg_tasks.length != 0) {
      for (var i = 0; i < kxg_tasks.length; i++) {
        // 获得截止日期
        kxg_tasks[i].jiezhi = this.getTimeBetween(date, new Date(kxg_tasks[i].uploadend))
      }

      for (var i = 0; i < kxg_tasks.length; i++) {
        // 排序
        for (var j = 0; j < kxg_tasks.length - i - 1; j++) {
          console.log(new Date(kxg_tasks[j].uploadtime))
          console.log(new Date(kxg_tasks[j + 1].uploadtime))
          if (new Date(kxg_tasks[j].uploadtime) < new Date(kxg_tasks[j + 1].uploadtime)) {
            var temp = kxg_tasks[j]
            kxg_tasks[j] = kxg_tasks[j + 1]
            kxg_tasks[j + 1] = temp
          }
        }
      }
    }

    // // 处理已提交
    // for(var i = 0; i < ytj_tasks.length; i++) {
    //   ygq_tasks[i].zhouqi = dt.formatTime(new Date(ygq_tasks[i].uploadstart)) + " - " + dt.formatTime(new Date(ygq_tasks[i].uploadend))
    // }

    // // 处理已过期
    // for (var i = 0; i < ytj_tasks.length; i++) {
    //   ytj_tasks[i].zhouqi = dt.formatTime(new Date(ytj_tasks[i].uploadstart)) + " - " + dt.formatTime(new Date(ytj_tasks[i].uploadend))
    // }

    // console.log(tasks)
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
  getWork: function(openid) {
    return new Promise((resolve, reject) => {
      const db = wx.cloud.database()

      db.collection('work').where({
        _openid: openid
      })
        .get()
        .then(res => {
          resolve(res.data)
        })
        .catch(err => {
          console.log(err)
          reject(err)
        })
    })
  },
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