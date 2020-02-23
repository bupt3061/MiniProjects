// pages/homework/homework.js
const app = getApp()
const dt = require('../../utils/date.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    hasTask: true,
    show: false,
    content: null,
    wtjTasks: [],
    ytjTasks: [],
    ygqTasks: [],
    kxgTasks: [],
    wtjShow: false,
    ytjShow: false
  },
  /**
   * 初始化函数
   */
  async init() {
    var kxgTasks = app.globalData.kxgTasks
    var wtjTasks = app.globalData.wtjTasks
    const courses = app.globalData.courses
    const courseids = app.globalData.courseids
    const openid = app.globalData.openid
    const inUploadNum = app.globalData.inUploadNum
    const now = new Date()

    if (courseids.length == 0) { // 未添加课程
      wx.hideLoading()

      this.setData({
        hasTask: false,
        content: '尚未添加课程'
      })

      return
    }

    wx.showLoading({
      title: '加载中',
    })

    /**
     * 1、获得已提交和过期未提交的任务并存储到全局
     */

    var ygqTasks = []
    var ytjTasks = []

    // 获得所有已过提交期的任务：已过期+已提交
    let pastedUploadCount = await this.getPastedUploadCount(courseids, now)
    console.log('pastedUploadCount', pastedUploadCount)

    let pastedUploadTasks = []

    for (let i = 0; i < pastedUploadCount; i += 20) {
      let res = await this.getPastedUploadSkip(courseids, now, i)
      pastedUploadTasks = pastedUploadTasks.concat(res)

      if (pastedUploadTasks.length == pastedUploadCount) {
        break
      }
    }

    console.log('pastedUploadTasks', pastedUploadTasks)

    if (pastedUploadTasks.length !== 0) {  // 存在已过提交期的任务
      var pastedUploadTaskids = []
      for (var i = 0; i < pastedUploadTasks.length; i++) {
        pastedUploadTaskids.push(pastedUploadTasks[i]._id)
      }

      // 获得已提交的作品
      let worksCount = await this.getWorksCount(pastedUploadTaskids, openid)
      console.log('worksCount', worksCount)

      var works = []

      for(var i = 0; i < worksCount; i += 20) {
        let res = await this.getWorksSkip(pastedUploadTaskids, openid, i)
        works = works.concat(res)

        if(works.length == worksCount) {
          break
        }
      }

      for (var i = 0; i < worksCount; i++) {
        // 排序
        for (var j = 0; j < worksCount - i - 1; j++) {
          if (works[j].uploadtime < works[j + 1].uploadtime) {
            var temp = works[j]
            works[j] = works[j + 1]
            works[j + 1] = temp
          }
        }
      }
      console.log('works', works)
      
      // 获得已提交和已过期的任务
      for (var i = 0; i < pastedUploadTasks.length; i++) {
        var flag = true
        for (var j = 0; j < works.length; j++) {
          if (pastedUploadTasks[i]._id == works[j]._taskid) {
            flag = false
            pastedUploadTasks[i].work = works[j]
            ytjTasks.push(pastedUploadTasks[i])
          }
        }
        if (flag) {
          ygqTasks.push(pastedUploadTasks[i])
        }
      }
    }

    console.log('ygqTasks', ygqTasks)
    console.log('ytjTasks', ytjTasks)

    if (ytjTasks.length == 0 && wtjTasks.length == 0 && kxgTasks.length == 0 && ygqTasks.length == 0) {
      // 空状态
      wx.hideLoading()

      this.setData({
        hasTask: false,
        content: '暂无提交任务'
      })

      return
    }

    /**
     * 处理各类任务
     */

    // 处理未提交
    if (wtjTasks.length != 0) {
      for (var i = 0; i < wtjTasks.length; i++) {
        // 获得剩余时间
        wtjTasks[i].shengyu = this.getTimeBetween(now, wtjTasks[i].uploadend)
      }
    }

    console.log("wtjTasks", wtjTasks)

    /**
     * 处理可修改
     */
    if (kxgTasks.length != 0) {
      // 获得剩余时间
      for (var i = 0; i < kxgTasks.length; i++) {
        kxgTasks[i].shengyu = this.getTimeBetween(now, kxgTasks[i].uploadend)
      }
    }

    // 添加作品信息
    var kxgTaskids = []
    for (var i = 0; i < kxgTasks.length; i++) {
      kxgTaskids.push(kxgTasks[i]._id)
    }

    let kxgWorksCount = await this.getWorksCount(kxgTaskids, openid)
    console.log('kxgWorksCount', kxgWorksCount)

    var kxgWorks = []
    for(var i = 0; i < kxgWorksCount; i += 20) {
      let res = await this.getWorksSkip(kxgTaskids, openid, i)
      kxgWorks = kxgWorks.concat(res)
    }

    for (var i = 0; i < kxgWorksCount; i++) {
      // 排序
      for (var j = 0; j < kxgWorksCount - i - 1; j++) {
        if (kxgWorks[j].uploadtime < kxgWorks[j + 1].uploadtime) {
          var temp = kxgWorks[j]
          kxgWorks[j] = kxgWorks[j + 1]
          kxgWorks[j + 1] = temp
        }
      }
    }
    console.log('kxgWorks', kxgWorks)

    for (var i = 0; i < kxgTasks.length; i++) {
      for (var j = 0; j < kxgWorks.length; j++) {
        if (kxgTasks[i]._id == kxgWorks[j]._taskid) {
          kxgTasks[i].work = kxgWorks[j]
          continue
        }
      }
    }

    console.log("kxgTasks", kxgTasks)

    // 处理已提交
    if (ytjTasks.length != 0) {
      for (var i = 0; i < ytjTasks.length; i++) {
        // 获得提交时间
        ytjTasks[i].tijiao = dt.formatTime(ytjTasks[i].work.uploadtime)
      }
    }

    console.log("ytjTasks", ytjTasks)

    // 处理已过期
    if (ygqTasks.length != 0) {
      for (var i = 0; i < ygqTasks.length; i++) {
        // 获得周期
        ygqTasks[i].zhouqi = dt.formatTime(ygqTasks[i].uploadstart) + " - " + dt.formatTime(ygqTasks[i].uploadend)
      }

      for (var i = 0; i < ygqTasks.length; i++) {
        // 排序
        for (var j = 0; j < ygqTasks.length - i - 1; j++) {
          if (ygqTasks[j].uploadstart < ygqTasks[j + 1].uploadstart) {
            var temp = ygqTasks[j]
            ygqTasks[j] = ygqTasks[j + 1]
            ygqTasks[j + 1] = temp
          }
        }
      }
    }

    console.log("ygqTasks", ygqTasks)

    // 添加课程信息
    wtjTasks = this.addCourseInfo(wtjTasks)
    ytjTasks = this.addCourseInfo(ytjTasks)
    ygqTasks = this.addCourseInfo(ygqTasks)
    kxgTasks = this.addCourseInfo(kxgTasks)

    // 更新数据
    console.log('已过期', ygqTasks)
    console.log('已提交', ytjTasks)
    console.log('可修改', kxgTasks)
    console.log('未提交', wtjTasks)
    app.globalData.wtjTasks = wtjTasks
    app.globalData.ytjTasks = ytjTasks
    app.globalData.ygqTasks = ygqTasks
    app.globalData.kxgTasks = kxgTasks
    app.globalData.storedUploadTasks = true

    var wtjShow = true
    var ytjShow = true

    if (wtjTasks.length == 0 && ygqTasks.length == 0) {
      wtjShow = false
    }

    if (kxgTasks.length == 0 && ytjTasks.length == 0) {
      ytjShow = false
    }

    this.setData({
      wtjTasks: wtjTasks,
      ytjTasks: ytjTasks,
      ygqTasks: ygqTasks,
      kxgTasks: kxgTasks,
      wtjShow: wtjShow,
      ytjShow: ytjShow,
      show: true
    })

    wx.hideLoading()
  },
  /**
   * 页面其他函数
   */
  getPastedUploadCount: function(courseids, now) {
    return new Promise((resolve, reject) => {
      const db = wx.cloud.database()
      const _ = db.command
      const task = db.collection('task')

      task
        .where({
          _courseid: _.in(courseids),
          uploadend: _.lte(now)
        })
        .count()
        .then(res => {
          const total = res.total
          resolve(total);
        }).catch(err => {
          console.log(err)
          reject("查询失败")
        })
    })
  },
  getPastedUploadSkip: function(courseids, now, skip) {
    return new Promise((resolve, reject) => {
      const db = wx.cloud.database()
      const _ = db.command
      const task = db.collection('task')

      let selectPromise

      selectPromise = task
        .where({
          _courseid: _.in(courseids),
          uploadend: _.lte(now)
        })
        .skip(skip)
        .get()
        .then(res => {
          const data = res.data
          resolve(data);
        })
        .catch(err => {
          console.error(err)
          reject("查询失败!")
        })
    })
  },
  getWorksCount: function (pastedUploadTaskids, openid) {
    return new Promise((resolve, reject) => {
      const db = wx.cloud.database()
      const _ = db.command

      db.collection('work')
        .where({
          _taskid: _.in(pastedUploadTaskids),
          _openid: openid
        })
        .count()
        .then(res => {
          const total = res.total
          resolve(total)
        })
        .catch(err => {
          console.log(err)
          reject('获取失败')
        })
    })
  },
  getWorksSkip: function(pastedUploadTaskids, openid, skip) {
    return new Promise((resolve, reject) => {
      const db = wx.cloud.database()
      const _ = db.command

      db.collection('work')
        .where({
          _taskid: _.in(pastedUploadTaskids),
          _openid: openid
        })
        .skip(skip)
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

    app.globalData.arg = '1'

    wx.navigateTo({
      url: '../details/details?data=' + taskid + '/1',
    })
  },
  getTimeBetween: function (startDate, endDate) {
    var days = (endDate - startDate) / (1 * 24 * 60 * 60 * 1000)
    var timeString = null

    if (days >= 365) {
      var years = days / 365
      timeString = Math.floor(years).toString() + "年"
    } else if (days > 30 && days < 365) {
      var months = days / 30
      timeString = Math.floor(months).toString() + "月"
    } else if (days >= 7 && days < 30) {
      var weeks = days / 7
      timeString = Math.floor(weeks).toString() + "周"
    } else if (days >= 1 && days < 7) {
      timeString = Math.floor(days).toString() + "天"
    } else if (days < 1) {
      var hours = days * 24
      timeString = Math.floor(hours).toString() + "小时"

      if (hours < 1) {
        var mins = hours * 60
        timeString = Math.floor(mins).toString() + "分钟"
      }
    }

    return timeString
  },
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
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // 判断是否已存储数据
    const storedUploadTasks = app.globalData.storedUploadTasks

    if (storedUploadTasks) {
      const ytjTasks = app.globalData.ytjTasks
      const ygqTasks = app.globalData.ygqTasks
      const wtjTasks = app.globalData.wtjTasks
      const kxgTasks = app.globalData.kxgTasks
      const courseids = app.globalData.courseids

      if(courseids.length == 0) {  // 未添加课程
        this.setData({
          hasTask: false,
          content: '尚未添加课程'
        })

        return
      }

      if (ytjTasks.length == 0 && wtjTasks.length == 0 && kxgTasks.length == 0 && ygqTasks.length == 0) {
        // 无任务
        this.setData({
          hasTask: false,
          content: '暂无提交任务'
        })

        return
      }

      var wtjShow = true
      var ytjShow = true

      if (wtjTasks.length == 0 && ygqTasks.length == 0) {
        wtjShow = false
      }

      if (kxgTasks.length == 0 && ytjTasks.length == 0) {
        ytjShow = false
      }

      this.setData({
        wtjTasks: wtjTasks,
        ytjTasks: ytjTasks,
        ygqTasks: ygqTasks,
        kxgTasks: kxgTasks,
        wtjShow: wtjShow,
        ytjShow: ytjShow,
        show: true
      })

      return
    }

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
    const storedUploadTasks = app.globalData.storedUploadTasks

    if (storedUploadTasks) {
      const wtjTasks = app.globalData.wtjTasks
      const ytjTasks = app.globalData.ytjTasks
      const ygqTasks = app.globalData.ygqTasks
      const kxgTasks = app.globalData.kxgTasks
      const courseids = app.globalData.courseids

      if (courseids.length == 0) {  // 未添加课程
        this.setData({
          hasTask: false,
          content: '尚未添加课程'
        })

        return
      }

      if (ytjTasks.length == 0 && wtjTasks.length == 0 && kxgTasks.length == 0 && ygqTasks.length == 0) {
        // 无任务
        this.setData({
          hasTask: false,
          content: '暂无提交任务'
        })

        return
      }

      var wtjShow = true
      var ytjShow = true

      if (wtjTasks.length == 0 && ygqTasks.length == 0) {
        wtjShow = false
      }

      if (kxgTasks.length == 0 && ytjTasks.length == 0) {
        ytjShow = false
      }

      this.setData({
        wtjTasks: wtjTasks,
        ytjTasks: ytjTasks,
        ygqTasks: ygqTasks,
        kxgTasks: kxgTasks,
        wtjShow: wtjShow,
        ytjShow: ytjShow,
        show: true
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