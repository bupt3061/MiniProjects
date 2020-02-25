// pages/msg/msg.js
const app = getApp()
const dt = require('../../utils/date.js')
const st = require('../../utils/string.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    newMsg: null,
    existedMsg: null,
    show: false
  },
  /**
   * 初始化函数
   */
  async init() {
    const openid = app.globalData.openid
    const courseids = app.globalData.courseids
    const now = new Date()

    wx.showLoading({
      title: '加载中',
    })

    // 获得所有已过期任务
    let pastEvalCount = await this.getPastEvalCount(courseids, now)
    console.log('pastEvalCount', pastEvalCount)

    var pastEvalTasks = []
    for(var i = 0; i < pastEvalCount; i += 20) {
      let res = await this.getPastEvalSkip(courseids, now, i)
      pastEvalTasks = pastEvalTasks.concat(res)

      if(pastEvalTasks.length == pastEvalCount) {
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

    var existedMsg = []
    for (var i = 0; i < existedMsgCount; i += 20) {
      let res = await this.getExistedMsgSkip(pastEvalTaskids, openid, i)
      existedMsg = existedMsg.concat(res)
    }

    console.log('existedMsg', existedMsg)

    // 获取需要处理的任务信息
    var needProcessTasks = []
    for (var i = 0; i < pastEvalCount; i++) {
      var flag = true
      for(var j = 0; j < existedMsgCount; j++) {
        if(pastEvalTasks[i]._id == existedMsg[j]._taskid) {
          flag = false
          continue
        }
      }
      if(flag) {
        needProcessTasks.push(pastEvalTasks[i])
      }
    }
    console.log('needProcessTasks', needProcessTasks)

    // 获取需处理任务的全部作品
    var needProcessTaskids = []
    for(var i = 0; i < needProcessTasks.length; i++) {
      needProcessTaskids.push(needProcessTasks[i]._id)
    }

    let works = await this.getWorks(needProcessTaskids, openid)

    var workids = []
    for(var i = 0; i < works.length; i++) {
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
    for(var i = 0; i < works.length; i++) {
      var temp = []
      for(var j = 0; j < evals.length; j++) {
        if(works[i]._id == evals[j]._workid) {
          temp.push(evals[j])
        }
      }
      works[i].evals = temp
    }

    console.log('works', works)

    for(var i = 0; i < needProcessTasks.length; i++) {
      for(var j = 0; j < works.length; j++) {
        if(needProcessTasks[i]._id == works[j]._taskid) {
          needProcessTasks[i].work = works[j]
          continue
        }
      }
    }

    for (var i = 0; i < needProcessTasks.length; i++) {
      for (var j = 0; j < evaledTasks.length; j++) {
        if (needProcessTasks[i]._id == evaledTasks[j]._id) {
          needProcessTasks[i].evaledNum = evaledTasks[j].num
          continue
        }
      }
    }

    console.log('needProcessTasks', needProcessTasks)

    // 计算成绩
    for(var i = 0; i < needProcessTasks.length; i++) {
      // 互评成绩
      if(!needProcessTasks[i].evaledNum) {
        needProcessTasks[i].evalScore = 0
        continue
      }
      var temp = needProcessTasks[i].evaledNum / 3
      if(temp >= 1) {
        temp = 1
      }
      var evalScore = temp * 10
      evalScore = Math.round(evalScore * 10) / 10
      needProcessTasks[i].evalScore = evalScore
    }

    console.log('needProcessTasks', needProcessTasks)

    for(var i = 0; i < needProcessTasks.length; i++) {
      // 作业成绩
      if(!needProcessTasks[i].work) {
        needProcessTasks[i].workScore = 0
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
      for(var m = 0; m < ctb.length; m++) {
        var temp = ctb[m] * totals[m]
        muls.push(temp)
        ctb_sum += ctb[m]
      }

      var muls_sum = 0
      for(var n = 0; n < muls.length; n++) {
        muls_sum += muls[n]
      }

      var workScore = muls_sum / ctb_sum
      workScore = Math.round(workScore * 10) / 10

      needProcessTasks[i].workScore = workScore
    }

    console.log('needProcessTasks', needProcessTasks)

    for(var i = 0; i < needProcessTasks.length; i++) {
      // 总成绩
      var workScore = needProcessTasks[i].workScore
      var evalScore = needProcessTasks[i].evalScore

      var totalScore = workScore * 0.7 + evalScore * 0.3
      totalScore = Math.round(totalScore * 10) / 10

      needProcessTasks[i].totalScore = totalScore
    }

    console.log('needProcessTasks', needProcessTasks)

    // 获取新消息列表
    var newMsgList = []
    for(var i = 0; i < needProcessTasks.length; i++) {
      var data = {}
      data._taskid = needProcessTasks[i]._id
      data.taskname = needProcessTasks[i].taskname
      data.totalscore = needProcessTasks[i].totalScore
      data.endtime = needProcessTasks[i].evaluateend

      if(needProcessTasks[i].work) {
        data.uploadtime = needProcessTasks[i].work.uploadtime
      } else {
        data.uploadtime = '未提交'
      }

      newMsgList = newMsgList.concat(data)
    }

    for (var i = 0; i < newMsgList.length; i++) {
      // 排序
      for (var j = 0; j < newMsgList.length - i - 1; j++) {
        if (newMsgList[j].endtime < newMsgList[j + 1].endtime) {
          var temp = newMsgList[j]
          newMsgList[j] = newMsgList[j + 1]
          newMsgList[j + 1] = temp
        }
      }
    }

    console.log('newMsgList', newMsgList)

    // 上传数据
    for(var i = 0; i < newMsgList.length; i++) {
      var data = newMsgList[i]

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
    for (var j = 0; j < existedMsg.length - i - 1; j++) {
      // 排序
      if (existedMsg[j].endtime < existedMsg[j + 1].endtime) {
        var temp = existedMsg[j]
        existedMsg[j] = existedMsg[j + 1]
        existedMsg[j + 1] = temp
      }
    }

    for(var i = 0; i < newMsgList.length; i++) {
      if(newMsgList[i].uploadtime != '未提交') {
        newMsgList[i].uploadtime = dt.formatTime(newMsgList[i].uploadtime)
      }
    }
    
    for(var i = 0; i < existedMsg.length; i++) {
      if(existedMsg[i].uploadtime != '未提交') {
        existedMsg[i].uploadtime = dt.formatTime(existedMsg[i].uploadtime)
      }
    }
    
    // 处理长字符串
    for(var i = 0; i < newMsgList.length; i++) {
      newMsgList[i].tasknameh = st.handleTaskName(newMsgList[i].taskname)
    }

    for (var i = 0; i < existedMsg.length; i++) {
      existedMsg[i].tasknameh = st.handleTaskName(existedMsg[i].taskname)
    }

    // 更新数据
    app.globalData.existedMsg = existedMsg
    app.globalData.newMsg = newMsgList
    console.log('existedMsg', existedMsg)
    console.log('newMsg', newMsgList)

    this.setData({
      newMsg: newMsgList,
      existedMsg: existedMsg,
      show: true
    })

    wx.hideLoading()
    
  },
  /**
   * 其他函数
   */
  getPastEvalCount: function (courseids, now) {
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
  getPastEvalSkip: function (courseids, now, skip) {
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
  getExistedMsgCount: function (pastEvalTaskids, openid) {
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
  getExistedMsgSkip: function (pastEvalTaskids, openid, skip) {
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
  getWorks: function (needProcessTaskids, openid) {
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
  getEvals: function (workids) {
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
  getEvaledTasks: function (openid, needProcessTaskids) {
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
    const existedMsg = app.globalData.existedMsg
    const newMsg = app.globalData.newMsg

    this.setData({
      newMsg: newMsg,
      existedMsg: existedMsg,
      show: true
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