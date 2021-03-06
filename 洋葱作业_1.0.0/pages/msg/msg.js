// pages/msg/msg.js
const app = getApp()
const dt = require('../../utils/date.js')
const st = require('../../utils/string.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    type: null,
    newMsg: null,
    existedMsg: null,
    hasCourse: true,
    hasMsg: true,
    show: false
  },
  /**
   * 初始化函数
   */
  async init(arg) {
    const openid = app.globalData.openid
    const type = app.globalData.type
    const now = new Date()
    let hasCourse
    let hasMsg
    let courseids
    let newMsg
    let existedMsg

    if(arg == 1) {
      // 初始加载
      console.log('test, 加载')

      courseids = app.globalData.courseids
      if (courseids.length == 0) {
        hasCourse = false

        this.setData({
          hasCourse: hasCourse
        })

        return
      } 

      hasCourse = true
      console.log("courseids", courseids)
    } else if(arg == 2) {
      // 刷新
      hasCourse = true

      console.log('test, 刷新')
      const processedCourseids = app.globalData.courseids
      const msgProcessedIds = app.globalData.msgProcessedIds
      console.log('processedCourseids', processedCourseids)
      console.log('msgProcessedIds', msgProcessedIds)

      courseids = []
      for(var i = 0; i < processedCourseids.length; i++) {
        var flag = true
        for(var j = 0; j < msgProcessedIds.length; j++) {
          if(processedCourseids[i] == msgProcessedIds[j]) {
            flag = false
            continue
          }
        }
        if(flag) {
          courseids.push(processedCourseids[i])
        }
      }

      var newMsgProcessedIds = courseids.concat(msgProcessedIds)
      app.globalData.msgProcessedIds = newMsgProcessedIds
      console.log('newMsgProcessedIds', newMsgProcessedIds)
      console.log("courseids", courseids)
    }

    wx.showLoading({
      title: '加载中',
    })

    // 获得所有已过期任务
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

    console.log('pastedEvalTasks', pastEvalTasks)
    console.log('pastedEvalTaskids', pastEvalTaskids)

    // 获得所有已获得信息
    let existedMsgCount = await this.getExistedMsgCount(pastEvalTaskids, openid)
    console.log('existedMsgCount', existedMsgCount)

    existedMsg = []
    for (var i = 0; i < existedMsgCount; i += 20) {
      let res = await this.getExistedMsgSkip(pastEvalTaskids, openid, i)
      existedMsg = existedMsg.concat(res)
    }

    console.log('existedMsg', existedMsg)

    // 获取需要处理的任务信息
    var needProcessTasks = []
    for (var i = 0; i < pastEvalCount; i++) {
      var flag = true
      for (var j = 0; j < existedMsgCount; j++) {
        if (pastEvalTasks[i]._id == existedMsg[j]._taskid) {
          flag = false
          continue
        }
      }
      if (flag) {
        needProcessTasks.push(pastEvalTasks[i])
      }
    }
    console.log('needProcessTasks', needProcessTasks)

    if(type == 2) {
      // 获取新消息列表
      newMsg = []
      for (var i = 0; i < needProcessTasks.length; i++) {
        var data = {}
        data._taskid = needProcessTasks[i]._id
        data._courseid = needProcessTasks[i]._courseid
        data.taskname = needProcessTasks[i].taskname
        data.endtime = needProcessTasks[i].evaluateend
        data.uploadtime = now
        data.totalscore = 0

        newMsg.push(data)
      }
      console.log('newMsg', newMsg)
    } else if(type == 1) {
      // 获取需处理任务的全部作品
      var needProcessTaskids = []
      for (var i = 0; i < needProcessTasks.length; i++) {
        needProcessTaskids.push(needProcessTasks[i]._id)
      }

      let works = await this.getWorks(needProcessTaskids, openid)

      var workids = []
      for (var i = 0; i < works.length; i++) {
        workids.push(works[i]._id)
      }
      console.log('works', works)
      console.log('workids', workids)

      // 获取全部互评信息
      let [num, evaledTasks] = await this.getEvaledTasks(openid, needProcessTaskids)
      console.log('evaledTasks', evaledTasks)

      // 获取作品的全部评价
      let evals = await this.getEvals(workids)
      console.log('evals', evals)

      // 整合数据
      for (var i = 0; i < works.length; i++) {
        var temp = []
        for (var j = 0; j < evals.length; j++) {
          if (works[i]._id == evals[j]._workid) {
            temp.push(evals[j])
          }
        }
        works[i].evals = temp
      }

      console.log('works', works)

      for (var i = 0; i < needProcessTasks.length; i++) {
        var temp = null
        for (var j = 0; j < works.length; j++) {
          if (needProcessTasks[i]._id == works[j]._taskid) {
            temp = works[j]
            continue
          }
        }
        needProcessTasks[i].work = temp
      }

      for (var i = 0; i < needProcessTasks.length; i++) {
        var evaledNum = 0
        for (var j = 0; j < evaledTasks.length; j++) {
          if (needProcessTasks[i]._id == evaledTasks[j]._id) {
            evaledNum = evaledTasks[j].num
            continue
          }
        }
        needProcessTasks[i].evaledNum = evaledNum
      }

      console.log('needProcessTasks', needProcessTasks)

      // 计算成绩
      for (var i = 0; i < needProcessTasks.length; i++) {
        // 互评成绩
        if (!needProcessTasks[i].evaledNum || needProcessTasks[i].evaledNum == 0) {
          needProcessTasks[i].evalScore = 0
          continue
        }
        var temp = needProcessTasks[i].evaledNum / 3
        if (temp >= 1) {
          temp = 1
        }

        var evalScore = Math.round(temp * 10 * 10) / 10
        needProcessTasks[i].evalScore = evalScore
      }

      console.log('needProcessTasks', needProcessTasks)

      for (var i = 0; i < needProcessTasks.length; i++) {
        // 作业成绩
        if (needProcessTasks[i].work == null) {  // 没交作业
          needProcessTasks[i].workScore = 0
          continue
        }

        if (needProcessTasks[i].work.evals.length == 0) {  // 无人评价
          needProcessTasks[i].workScore = 6.5
          continue
        }

        var ctb = []
        var totals = []
        var evalList = needProcessTasks[i].work.evals
        for (var j = 0; j < evalList.length; j++) {
          ctb.push(evalList[j].contribution)
          totals.push(evalList[j].totalscore)
        }

        var muls = []
        var ctb_sum = 0
        for (var m = 0; m < ctb.length; m++) {
          var temp = ctb[m] * totals[m]
          muls.push(temp)
          ctb_sum += ctb[m]
        }

        var muls_sum = 0
        for (var n = 0; n < muls.length; n++) {
          muls_sum += muls[n]
        }

        var workScore = muls_sum / ctb_sum
        workScore = Math.round(workScore * 10) / 10

        needProcessTasks[i].workScore = workScore
      }

      console.log('needProcessTasks', needProcessTasks)

      for (var i = 0; i < needProcessTasks.length; i++) {
        // 总成绩
        var workScore = needProcessTasks[i].workScore
        var evalScore = needProcessTasks[i].evalScore

        var totalScore = workScore * 0.7 + evalScore * 0.3
        totalScore = Math.round(totalScore * 10) / 10

        needProcessTasks[i].totalScore = totalScore
      }

      console.log('needProcessTasks', needProcessTasks)

      // 获取新消息列表
      newMsg = []
      for (var i = 0; i < needProcessTasks.length; i++) {
        var data = {}
        data._taskid = needProcessTasks[i]._id
        data._courseid = needProcessTasks[i]._courseid
        data.taskname = needProcessTasks[i].taskname
        data.totalscore = needProcessTasks[i].totalScore
        data.endtime = needProcessTasks[i].evaluateend

        if (needProcessTasks[i].work) {
          data.uploadtime = needProcessTasks[i].work.uploadtime
        } else {
          data.uploadtime = '未提交'
        }

        newMsg.push(data)
      }
    }

    // 上传数据
    for (var i = 0; i < newMsg.length; i++) {
      var data = newMsg[i]

      const db = wx.cloud.database()

      db.collection('msg')
        .add({
          data
        })
        .then(res => {
          console.log(res)
        })
        .catch(err => {
          console.log(err)
        })
    }

    // 处理时间
    for (var i = 0; i < newMsg.length; i++) {
      if (newMsg[i].uploadtime != '未提交') {
        newMsg[i].uploadtime = dt.formatTime(newMsg[i].uploadtime)
      }
      newMsg[i].endtime = dt.formatTime(newMsg[i].endtime)
    }

    for (var i = 0; i < existedMsg.length; i++) {
      if (existedMsg[i].uploadtime != '未提交') {
        existedMsg[i].uploadtime = dt.formatTime(existedMsg[i].uploadtime)
      }
      existedMsg[i].endtime = dt.formatTime(existedMsg[i].endtime)
    }

    // 处理长字符串
    for (var i = 0; i < newMsg.length; i++) {
      newMsg[i].tasknameh = st.handleTaskName(newMsg[i].taskname)
    }

    for (var i = 0; i < existedMsg.length; i++) {
      existedMsg[i].tasknameh = st.handleTaskName(existedMsg[i].taskname)
    }

    // 更新数据
    if(arg == 2) {
      newMsg = newMsg.concat(app.globalData.newMsg)
      existedMsg = existedMsg.concat(app.globalData.existedMsg)
    }

    for (var i = 0; i < newMsg.length; i++) {
      // 排序
      for (var j = 0; j < newMsg.length - i - 1; j++) {
        if (newMsg[j].endtime < newMsg[j + 1].endtime) {
          var temp = newMsg[j]
          newMsg[j] = newMsg[j + 1]
          newMsg[j + 1] = temp
        }
      }
    }

    for (var j = 0; j < existedMsg.length - i - 1; j++) {
      // 排序
      if (existedMsg[j].endtime < existedMsg[j + 1].endtime) {
        var temp = existedMsg[j]
        existedMsg[j] = existedMsg[j + 1]
        existedMsg[j + 1] = temp
      }
    }
    
    // 更新数据
    if (newMsg.length == 0 && existedMsg.length == 0) {
      hasMsg = false
    } else {
      hasMsg = true
    }
    
    app.globalData.existedMsg = existedMsg
    app.globalData.newMsg = newMsg
    app.globalData.storedMsg = true
    console.log('existedMsg', existedMsg)
    console.log('newMsg', newMsg)
    

    this.setData({
      type: type,
      newMsg: newMsg,
      existedMsg: existedMsg,
      hasMsg: hasMsg,
      hasCourse: hasCourse,
      show: true
    })

    wx.hideLoading()

  },
  /**
   * 其他函数
   */
  getPastEvalCount: function(courseids, now) {
    return new Promise((resolve, reject) => {
      const db = wx.cloud.database()
      const _ = db.command

      db.collection('task')
        .where({
          evaluateend: _.lt(now),
          _courseid: _.in(courseids)
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
          evaluateend: _.lt(now),
          _courseid: _.in(courseids)
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
  getExistedMsgCount: function(pastEvalTaskids, openid) {
    return new Promise((resolve, reject) => {
      const db = wx.cloud.database()
      const _ = db.command

      db.collection('msg')
        .where({
          _openid: openid,
          _taskid: _.in(pastEvalTaskids)
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
  getExistedMsgSkip: function(pastEvalTaskids, openid, skip) {
    return new Promise((resolve, reject) => {
      const db = wx.cloud.database()
      const _ = db.command

      db.collection('msg')
        .where({
          _openid: openid,
          _taskid: _.in(pastEvalTaskids)
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
  getWorks: function(needProcessTaskids, openid) {
    return new Promise((resolve, reject) => {
      const db = wx.cloud.database()
      const _ = db.command

      db.collection("work")
        .where({
          _openid: openid,
          _taskid: _.in(needProcessTaskids)
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
  getEvals: function(workids) {
    return new Promise((resolve, reject) => {
      const db = wx.cloud.database()
      const _ = db.command

      db.collection('evaluate')
        .where({
          _workid: _.in(workids)
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
  getEvaledTasks: function(openid, needProcessTaskids) {
    return new Promise((resolve, reject) => {
      const db = wx.cloud.database()
      const _ = db.command
      const $ = _.aggregate

      db.collection('evaluate')
        .aggregate()
        .match({
          _openid: openid,
          _taskid: _.in(needProcessTaskids)
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
  clickmsg: function(e) {
    const taskid = e.currentTarget.dataset.taskid
    console.log(taskid)

    app.globalData.arg = '1'

    wx.navigateTo({
      url: '../details/details?data=' + taskid + '/1',
    })
  },
  clicktmsg: function (e) {
    const taskid = e.currentTarget.dataset.taskid
    const courseid = e.currentTarget.dataset.courseid

    console.log(e)

    wx.navigateTo({
      url: '../datavis/datavis?data=' + courseid + '/' + taskid,
    })
  },
  addCourse: function() {
    wx.navigateTo({
      url: '../course/course?arg=' + '3',
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log('otest, nLoad执行了')

    const processedCourseids = app.globalData.processedCourseids
    const msgProcessedIds = app.globalData.msgProcessedIds

    if (msgProcessedIds.length < processedCourseids.length) {
      console.log("processedCourseids", processedCourseids)
      console.log("msgProcessedIds", msgProcessedIds)

      const arg = 2
      this.init(arg)

      return
    }

    const arg = 1
    this.init(1)
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
    const storedMsg = app.globalData.storedMsg

    if(storedMsg) {
      const processedCourseids = app.globalData.processedCourseids
      const msgProcessedIds = app.globalData.msgProcessedIds

      console.log('onShow执行了')

      if (msgProcessedIds.length < processedCourseids.length) {
        console.log("processedCourseids", processedCourseids)
        console.log("msgProcessedIds", msgProcessedIds)

        const arg = 2
        this.init(arg)
      } else {
        const existedMsg = app.globalData.existedMsg
        const newMsg = app.globalData.newMsg
        const courseids = app.globalData.courseids

        if (courseids.length == 0) {
          this.setData({
            hasCourse: false
          })

          return
        }

        if (existedMsg.length == 0 && newMsg.length == 0) {
          this.setData({
            hasMsg: false
          })

          return
        }

        this.setData({
          newMsg: newMsg,
          existedMsg: existedMsg,
          hasCourse: true,
          hasMsg: true,
          show: true
        })
      }
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