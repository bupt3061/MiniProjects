// pages/msg/msg.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },
  /**
   * 初始化函数
   */
  async init() {
    const openid = app.globalData.openid
    const courseids = app.globalData.courseids
    const now = new Date()

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
          needProcessTasks[i].evaledNum = works[j].num
          continue
        }
      }
    }

    console.log('needProcessTasks', needProcessTasks)
    
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