// pages/mutualeval/mutualeval.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    hasTask: true,
    wwcTasks: null,
    whpTasks: null
  },
  /**
   * 初始化函数
   */
  async init() {
    var wwcTasks = app.globalData.wwcTasks
    var whpTasks = app.globalData.whpTasks
    const inEvalNum = app.globalData.inEvalNum
    const courseids = app.globalData.courseids
    const openid = app.globalData.openid

    if (inEvalNum == 0) {
      this.setData({
        hasTask: false
      })

      return
    }

    // 获取已过期任务
    let pastedEvalTasks = await this.getPastedEvalTasks(courseids)

    var pastedEvalTaskids = []
    for (var i = 0; i < pastedEvalTasks.length; i++) {
      pastedEvalTaskids.push(pastedEvalTasks[i]._id)
    }

    console.log('pastedEvalTasks', pastedEvalTasks)
    console.log('pasteEvalTaskids', pastedEvalTaskids)

    // 获取对各个任务的评论数
    let [evaledNum, evaledTasks] = await this.getEvaledTasks(openid, pastedEvalTaskids)
    console.log('evaledTasks', evaledTasks)
    console.log('evaledNum', evaledNum)

    // 处理时间
    const now = new Date()

    for (var i = 0; i < wwcTasks.length; i++) {
      wwcTasks[i].shengyu = this.getTimeBetween(now, wwcTasks[i].evaluateend)
    }

    for (var i = 0; i < whpTasks.length; i++) {
      whpTasks[i].shengyu = this.getTimeBetween(now, whpTasks[i].evaluateend)
    }

    // 添加课程信息
    wwcTasks = this.addCourseInfo(wwcTasks)
    whpTasks = this.addCourseInfo(whpTasks)

    // 更新数据
    app.globalData.wwcTasks = wwcTasks
    app.globalData.whpTasks = whpTasks
    console.log('未完成', wwcTasks)
    console.log('未互评', whpTasks)

    this.setData({
      wwcTasks: wwcTasks,
      whpTasks: whpTasks
    })
  },
  /**
   * 页面其他函数
   */
  addCourseInfo: function(tasks) {
    const courses = app.globalData.courses

    for (var i = 0; i < tasks.length; i++) {
      for (var j = 0; j < courses.length; j++) {
        if (tasks[i]._courseid == courses[j]._id) {
          tasks[i].coursename = courses[j].coursename
          tasks[i].courseCover = courses[j].coverPath
          continue
        }
      }
    }

    return tasks
  },
  getTimeBetween: function(startDate, endDate) {
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

        if (mins < 1) {
          var secs = mins * 60
          timeString = Math.floor(secs).toString() + "秒"
        }
      }
    } else {
      timeString = Math.floor(days).toString() + "天"
    }

    return timeString
  },
  clickhp: function(e) {
    const taskid = e.currentTarget.dataset.taskid
    console.log('taskid', taskid)

    wx.navigateTo({
      url: '../details/details?data=' + taskid + '/2',
    })
  },
  getPastedEvalTasks: function(courseids) {
    return new Promise((resolve, reject) => {
      const db = wx.cloud.database()
      const _ = db.command
      const now = new Date()

      db.collection('task')
        .where({
          _courseid: _.in(courseids),
          evaluateend: _.lt(now)
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
  getEvaledTasks: function (openid, pastedEvalTaskids) {
    return new Promise((resolve, reject) => {
      const db = wx.cloud.database()
      const _ = db.command
      const $ = _.aggregate

      db.collection('evaluate')
        .aggregate()
        .match({
          _openid: openid,
          _taskid: _.in(pastedEvalTaskids)
        })
        .group({
          _id: '$_taskid',
          num: $.sum(1)
        })
        .end()
        .then(res => {
          const list = res.list
          var num = 0
          for (var i = 0; i < list.length; i++) {
            if (list[i].num >= 3) {
              num += 1
            }
          }
          resolve([num, list])
        })
        .catch(err => {
          console.log(err)
          reject('获取失败')
        })
    })
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
    const wwcTasks = app.globalData.wwcTasks
    const whpTasks = app.globalData.whpTasks
    const inEvalNum = app.globalData.inEvalNum

    if (inEvalNum == 0) {
      this.setData({
        hasTask: false
      })

      return
    }

    if (wwcTasks.length != 0 || whpTasks.length != 0) {
      this.setData({
        wwcTasks: wwcTasks,
        whpTasks: whpTasks
      })
    }
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