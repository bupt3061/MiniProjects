// pages/mutualeval/mutualeval.js
const app = getApp()
const dt = require('../../utils/date.js')
const st = require('../../utils/string.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    hasTask: true,
    hasCourse: true,
    show: false,
    wwcTasks: null,
    whpTasks: null,
    ygqETasks: null
  },
  /**
   * 初始化函数
   */
  async init(arg) {
    var wwcTasks = app.globalData.wwcTasks
    var whpTasks = app.globalData.whpTasks
    const inEvalNum = app.globalData.inEvalNum
    const openid = app.globalData.openid
    const now = new Date()
    let courseids
    let hasCourse
    let hasTask
    let ygqETasks

    if (arg == 1) {
      console.log('test, 加载')

      courseids = app.globalData.courseids
      if (courseids.length == 0) { // 未添加课程
        hasCourse = false

        this.setData({
          hasCourse: hasCourse
        })

        return
      }

      console.log('courseids', courseids)
    } else if (arg == 2) {
      hasCourse = true
      console.log('test, 刷新')
      const evalProcessedIds = app.globalData.evalProcessedIds
      const processedCourseids = app.globalData.processedCourseids
      console.log("evalProcessedIds", evalProcessedIds)
      console.log("processedCourseids", processedCourseids)
      
      courseids = []
      for (var i = 0; i < processedCourseids.length; i++) {
        var flag = true
        for (var j = 0; j < evalProcessedIds.length; j++) {
          if (processedCourseids[i] == evalProcessedIds[j]) {
            flag = false
            continue
          }
        }
        if (flag) {
          courseids.push(processedCourseids[i])
        }
      }

      var newEvalProcessedIds = courseids.concat(evalProcessedIds)
      app.globalData.evalProcessedIds = newEvalProcessedIds
      console.log('courseids', courseids)
      console.log('newEvalProcessedIds', newEvalProcessedIds)
    }

    wx.showLoading({
      title: '加载中',
    })

    /**
     * 1、获得已过期互评的任务
     */
    let pastEvalCount = await this.getPastEvalCount(courseids, now)
    console.log('pastEvalCount', pastEvalCount)

    var pastEvalTasks = []
    for (var i = 0; i < pastEvalCount; i += 20) {
      let res = await this.getPastEvalSkip(courseids, now, i)
      pastEvalTasks = pastEvalTasks.concat(res)

      if (pastEvalTasks.length == pastEvalCount) {
        break
      }
    }

    var pastEvalTaskids = []
    for (var i = 0; i < pastEvalTasks.length; i++) {
      pastEvalTaskids.push(pastEvalTasks[i]._id)
    }

    console.log('pastEvalTasks', pastEvalTasks)
    console.log('pastEvalTaskids', pastEvalTaskids)

    // 获取对各个任务的评论数
    var evaledNum = 0
    var evaledTasks = []
    for (var i = 0; i < pastEvalTaskids.length; i += 20) {
      var res = this.getSkipList(pastEvalTaskids, i)
      let [num, data] = await this.getEvaledTasks(openid, res)
      evaledNum += num
      evaledTasks = evaledTasks.concat(data)

      if (i * 20 + res.length == pastEvalTaskids.length) {
        break
      }
    }

    console.log('evaledTasks', evaledTasks)
    console.log('evaledNum', evaledNum)

    // 获得已过期任务
    ygqETasks = []
    for (var i = 0; i < pastEvalTasks.length; i++) {
      var flag = true
      for (var j = 0; j < evaledTasks.length; j++) {
        if (pastEvalTasks[i]._id == evaledTasks[j]._id) {
          flag = false
          if (evaledTasks[j].num < 3) {
            ygqETasks.push(pastEvalTasks[i])
          }
        }
      }
      if (flag) {
        ygqETasks.push(pastEvalTasks[i])
      }
    }

    if (arg == 2) {
      ygqETasks = ygqETasks.concat(app.globalData.ygqETasks)
      console.log('ygqETasks', ygqETasks)
    }

    if (wwcTasks.length == 0 && ygqETasks.length == 0 && whpTasks.length == 0) {
      // 无任务
      wx.hideLoading()
      hasTask = false

      this.setData({
        hasTask: hasTask
      })

      return
    } else {
      hasTask = true
    }

    for (var i = 0; i < ygqETasks.length; i++) {
      // 排序
      for (var j = 0; j < ygqETasks.length - i - 1; j++) {
        if (ygqETasks[j].evaluatestart < ygqETasks[j + 1].evaluatestart) {
          var temp = ygqETasks[j]
          ygqETasks[j] = ygqETasks[j + 1]
          ygqETasks[j + 1] = temp
        }
      }
    }

    // 处理时间
    for (var i = 0; i < wwcTasks.length; i++) {
      wwcTasks[i].shengyu = this.getTimeBetween(now, wwcTasks[i].evaluateend)
    }

    for (var i = 0; i < whpTasks.length; i++) {
      whpTasks[i].shengyu = this.getTimeBetween(now, whpTasks[i].evaluateend)
    }

    for (var i = 0; i < ygqETasks.length; i++) {
      ygqETasks[i].zhouqi = dt.formatTime(ygqETasks[i].uploadstart) + " - " + dt.formatTime(ygqETasks[i].uploadend)
    }

    // 添加课程信息
    wwcTasks = this.addCourseInfo(wwcTasks)
    whpTasks = this.addCourseInfo(whpTasks)
    ygqETasks = this.addCourseInfo(ygqETasks)

    // 处理长字符串
    for (var i = 0; i < wwcTasks.length; i++) {
      wwcTasks[i].tasknameh = st.handleTaskName(wwcTasks[i].taskname)
      wwcTasks[i].coursenameh = st.handleCourseName(wwcTasks[i].coursename)
    }

    for (var i = 0; i < whpTasks.length; i++) {
      whpTasks[i].tasknameh = st.handleTaskName(whpTasks[i].taskname)
      whpTasks[i].coursenameh = st.handleCourseName(whpTasks[i].coursename)
    }

    for (var i = 0; i < ygqETasks.length; i++) {
      ygqETasks[i].tasknameh = st.handleTaskName(ygqETasks[i].taskname)
      ygqETasks[i].coursenameh = st.handleCourseName(ygqETasks[i].coursename)
    }

    // 更新数据
    if (arg == 1) {
      app.globalData.evalProcessedIds = app.globalData.indexProcessedIds
      console.log('test')
      console.log(app.globalData.evalProcessedIds)
      console.log(app.globalData.indexProcessedIds)
    } 
    // else if (arg == 2) {
    //   courseids = courseids.concat(app.globalData.evalProcessedIds)
    //   app.globalData.evalProcessedIds = courseids
    //   console.log('courseids', courseids)
    // }

    app.globalData.wwcTasks = wwcTasks
    app.globalData.whpTasks = whpTasks
    app.globalData.ygqETasks = ygqETasks
    app.globalData.storedEvalTasks = true
    console.log('未完成', wwcTasks)
    console.log('未互评', whpTasks)
    console.log('已过期', ygqETasks)

    var wwcShow = true
    var whpShow = true

    if (whpTasks.length == 0) {
      whpShow = false
    }

    if (wwcTasks.length == 0 && ygqETasks.length == 0) {
      wwcShow = false
    }

    this.setData({
      wwcTasks: wwcTasks,
      whpTasks: whpTasks,
      ygqETasks: ygqETasks,
      wwcShow: wwcShow,
      whpShow: whpShow,
      hasTask: hasTask,
      hasCourse: hasCourse,
      show: true
    })

    wx.hideLoading()
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
  clickwhp: function(e) {
    const taskid = e.currentTarget.dataset.taskid
    console.log('taskid', taskid)

    var inEvalTask = {
      taskid: taskid,
      status: false
    }

    app.globalData.inEvalTask = inEvalTask
    console.log('inEvalTask', inEvalTask)

    app.globalData.arg = '3'

    wx.navigateTo({
      url: '../details/details?data=' + taskid + '/3',
    })
  },
  clickwwc: function(e) {
    const taskid = e.currentTarget.dataset.taskid
    console.log('taskid', taskid)

    var inEvalTask = {
      taskid: taskid,
      status: false
    }

    app.globalData.inEvalTask = inEvalTask
    console.log('inEvalTask', inEvalTask)

    app.globalData.arg = '2'

    wx.navigateTo({
      url: '../details/details?data=' + taskid + '/2',
    })
  },
  getPastEvalCount: function(courseids, now) {
    return new Promise((resolve, reject) => {
      const db = wx.cloud.database()
      const _ = db.command

      db.collection('task')
        .where({
          _courseid: _.in(courseids),
          evaluateend: _.lt(now)
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
  getPastEvalSkip: function(courseids, now, skip) {
    return new Promise((resolve, reject) => {
      const db = wx.cloud.database()
      const _ = db.command

      db.collection('task')
        .where({
          _courseid: _.in(courseids),
          evaluateend: _.lt(now)
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
  getSkipList: function(list, skip) {
    const length = list.length
    const limit = 20
    var res = []
    var status = true

    for (var i = skip; i < skip + limit; i++) {
      if (!list[i]) {
        status = false
        break
      }
      res.push(list[i])
    }

    return res
  },
  getEvaledTasks: function(openid, pastedEvalTaskids) {
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
    const storedEvalTasks = app.globalData.storedEvalTasks
    console.log('onLoad执行了')

    if (storedEvalTasks) {
      const evalProcessedIds = app.globalData.evalProcessedIds
      const processedCourseids = app.globalData.processedCourseids

      if (evalProcessedIds.length < processedCourseids.length) { // 添加了新课程
        console.log("evalProcessedIds", evalProcessedIds)
        console.log("processedCourseids", processedCourseids)

        const arg = 2
        this.init(arg)

        return
      }

      const wwcTasks = app.globalData.wwcTasks
      const whpTasks = app.globalData.whpTasks
      const ygqETasks = app.globalData.ygqETasks
      const courseids = app.globalData.courseids

      if (courseids.length == 0) { // 未添加课程

        this.setData({
          hasCourse: false
        })

        return
      }

      if (wwcTasks.length == 0 && ygqETasks.length == 0 && whpTasks.length == 0) {

        this.setData({
          hasTask: false
        })

        return
      }

      var wwcShow = true
      var whpShow = true

      if (whpTasks.length == 0) {
        whpShow = false
      }

      if (wwcTasks.length == 0 && ygqETasks.length == 0) {
        wwcShow = false
      }

      this.setData({
        wwcTasks: wwcTasks,
        whpTasks: whpTasks,
        ygqETasks: ygqETasks,
        wwcShow: wwcShow,
        whpShow: whpShow,
        hasTask: true,
        hasCourse: true,
        show: true
      })

      return
    }
    const arg = 1
    this.init(arg)
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
    const storedEvalTasks = app.globalData.storedEvalTasks
    console.log('test, onShow执行了')

    if (storedEvalTasks) {
      const evalProcessedIds = app.globalData.evalProcessedIds
      const processedCourseids = app.globalData.processedCourseids

      if (evalProcessedIds.length < processedCourseids.length) { // 添加了新课程
        console.log("evalProcessedIds", evalProcessedIds)
        console.log("processedCourseids", processedCourseids)

        const arg = 2
        this.init(arg)

        return
      }

      var wwcTasks = app.globalData.wwcTasks
      const whpTasks = app.globalData.whpTasks
      const ygqETasks = app.globalData.ygqETasks
      const courseids = app.globalData.courseids
      var inEvalNum = app.globalData.inEvalNum

      var list = []
      for (var i = 0; i < wwcTasks.length; i++) {
        if (wwcTasks[i].evaledNum >= 3) {
          inEvalNum -= 1
          continue
        }
        list.push(wwcTasks[i])
      }

      wwcTasks = list
      app.globalData.wwcTasks = wwcTasks
      app.globalData.inEvalNum = inEvalNum
      console.log('inEvalNum', inEvalNum)
      console.log('wwcTasks', wwcTasks)

      if (courseids.length == 0) { // 未添加课程
        wx.hideLoading()

        this.setData({
          hasTask: false
        })

        return
      }

      if (wwcTasks.length == 0 && ygqETasks.length == 0 && whpTasks.length == 0) {
        // 无任务
        this.setData({
          hasTask: false
        })

        return
      }

      var wwcShow = true
      var whpShow = true

      if (whpTasks.length == 0) {
        whpShow = false
      }

      if (wwcTasks.length == 0 && ygqETasks.length == 0) {
        wwcShow = false
      }

      this.setData({
        wwcTasks: wwcTasks,
        whpTasks: whpTasks,
        ygqETasks: ygqETasks,
        wwcShow: wwcShow,
        whpShow: whpShow,
        hasTask: true,
        hasCourse: true,
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