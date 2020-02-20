// pages/homework/homework.js
const app = getApp()
const dt = require('../../utils/date.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    wtjTasks: [],
    ytjTasks: [],
    ygqTasks: [],
    kxgTasks: [],
    inUploadNum: 0,
    ygqNum: 0,
  },
  /**
   * 初始化函数
   */
  async init() {
    const courses = app.globalData.courses
    const courseids = app.globalData.courseids
    const openid = app.globalData.openid

    wx.showLoading({
      title: '加载中',
    })

    // 获得待提交及可修改任务
    let inUploadTasks = await this.getInUploadTasks(courseids)

    console.log('inUploadTasks', inUploadTasks)

    // 分组
    var wtj_tasks = [] // 未提交
    var ygq_tasks = [] // 已过期
    var ytj_tasks = [] // 已提交
    var kxg_tasks = [] // 可修改

    for (var i = 0; i < tasks.length; i++) {
      if (tasks[i].status == 1) {
        if (tasks[i].uploaded) {
          kxg_tasks.push(tasks[i])
        } else {
          wtj_tasks.push(tasks[i])
        }
      }
      if ([2, 3].indexOf(tasks[i].status) != -1) {
        if (tasks[i].uploaded) {
          ytj_tasks.push(tasks[i])
        } else {
          ygq_tasks.push(tasks[i])
        }
      }
    }

    // 处理未提交
    if (wtj_tasks.length != 0) {
      for (var i = 0; i < wtj_tasks.length; i++) {
        // 获得剩余时间
        wtj_tasks[i].shengyu = this.getTimeBetween(now, wtj_tasks[i].uploadend)

        // 排序
        for (var j = 0; j < wtj_tasks.length - i - 1; j++) {
          if (wtj_tasks[j].uploadend > wtj_tasks[j + 1].uploadend) {
            var temp = wtj_tasks[j + 1]
            wtj_tasks[j + 1] = wtj_tasks[j]
            wtj_tasks[j] = temp
          }
        }
      }
    }

    console.log("未提交", wtj_tasks)

    // 处理可修改
    if (kxg_tasks.length != 0) {
      for (var i = 0; i < kxg_tasks.length; i++) {
        // 获得剩余时间
        kxg_tasks[i].shengyu = this.getTimeBetween(now, kxg_tasks[i].uploadend)

        // 排序
        for (var j = 0; j < kxg_tasks.length - i - 1; j++) {
          if (kxg_tasks[j].work.uploadtime < kxg_tasks[j + 1].work.uploadtime) {
            var temp = kxg_tasks[j]
            kxg_tasks[j] = kxg_tasks[j + 1]
            kxg_tasks[j + 1] = temp
          }
        }
      }
    }

    console.log("可修改", kxg_tasks)

    // 处理已提交
    if (ytj_tasks.length != 0) {
      for (var i = 0; i < ytj_tasks.length; i++) {
        // 获得提交时间
        ytj_tasks[i].tijiao = dt.formatTime(new Date(ytj_tasks[i].work.uploadtime))
      }

      for (var i = 0; i < ytj_tasks.length; i++) {
        // 排序
        for (var j = 0; j < ytj_tasks.length - i - 1; j++) {
          if (ytj_tasks[j].work.uploadtime < ytj_tasks[j + 1].work.uploadtime) {
            var temp = ytj_tasks[j]
            ytj_tasks[j] = ytj_tasks[j + 1]
            ytj_tasks[j + 1] = temp
          }
        }
      }
    }

    console.log("已提交", ytj_tasks)

    // 处理已过期
    if (ygq_tasks.length != 0) {
      for (var i = 0; i < ygq_tasks.length; i++) {
        // 获得周期
        ygq_tasks[i].zhouqi = dt.formatTime(new Date(ygq_tasks[i].uploadstart)) + " - " + dt.formatTime(new Date(ygq_tasks[i].uploadend))
      }

      for (var i = 0; i < ygq_tasks.length; i++) {
        // 排序
        for (var j = 0; j < ygq_tasks.length - i - 1; j++) {
          if (ygq_tasks[j].uploadstart > ygq_tasks[j + 1].uploadstart) {
            var temp = ygq_tasks[j]
            ygq_tasks[j] = ygq_tasks[j + 1]
            ygq_tasks[j + 1] = temp
          }
        }
      }
    }

    console.log("已过期", ygq_tasks)

    wx.hideLoading()

    // 存储
    app.globalData.wtj_tasks = wtj_tasks
    app.globalData.ytj_tasks = ytj_tasks
    app.globalData.ygq_tasks = ygq_tasks
    app.globalData.kxg_tasks = kxg_tasks

    this.setData({
      wtj_tasks: wtj_tasks,
      ytj_tasks: ytj_tasks,
      ygq_tasks: ygq_tasks,
      kxg_tasks: kxg_tasks,
      ygqNum: ygq_tasks.length,
    })
  },
  /**
   * 页面其他函数
   */
  getInUploadTasks: function(courseids) {
    return new Promise((resolve, reject) => {
      const db = wx.cloud.database()
      const _ = db.command
      const now = new Date()

      db.collection('task')
        .where({
          _courseid: _.in(courseids),
          uploadstart: _.lte(now),
          uploadend: _.gte(now)
        })
        .get()
        .then(res => {
          const data = res.data
          resolve(data)
        })
        .catch(err => {
          console.log(err)
          reject('获取失败')
        })
    })
  },
  clickwtj: function(e) {
    const taskid = e.currentTarget.dataset.taskid
    console.log(taskid)

    wx.navigateTo({
      url: '../submit/submit?data=' + taskid + '/1',
    })
  },
  clickkxg: function(e) {
    const taskid = e.currentTarget.dataset.taskid
    console.log(taskid)

    wx.navigateTo({
      url: '../submit/submit?data=' + taskid + '/2',
    })
  },
  clickytj: function(e) {
    const taskid = e.currentTarget.dataset.taskid
    console.log(taskid)

    console.log('已提交')

    wx.navigateTo({
      url: '../details/details?taskid=' + taskid,
    })
  },
  getTimeBetween: function(startDateString, endDateString) {
    var startDate = Date.parse(startDateString)
    var endDate = Date.parse(endDateString)
    var days = (endDate - startDate) / (1 * 24 * 60 * 60 * 1000)
    var timeString = null

    if (days > 30) {
      var months = days / 30
      timeString = Math.floor(months).toString() + "月"

      if (days >= 365) {
        var years = days / 365
        timeString = Math.floor(years).toString() + "年"
      }
    } else if (days < 2) {
      var hours = days * 24
      timeString = Math.floor(hours).toString() + "小时"

      if (hours < 1) {
        var mins = hours * 60
        timeString = Math.floor(mins).toString() + "分钟"
      }
    } else {
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
    this.setData({
      wtjTasks: app.globalData.wtjTasks,
      ytjTasks: app.globalData.ytjTasks,
      ygqTasks: app.globalData.ygqTasks,
      kxgTasks: app.globalData.kxgTasks,
      ygqNum: app.globalData.ygqTasks.length
    })
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