// pages/tasklist/tasklist.js
const app = getApp()
const dt = require('../../utils/date.js')
const st = require('../../utils/string.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    courseid: null,
    tasks: null,
    show: false
  },
  /**
   * 初始化函数
   */
  async init(courseid) {
    const now = new Date()
    let tasks

    wx.showLoading({
      title: '加载中',
    })

    // 获取所有任务
    let tasksCount = await this.getTasksCount(courseid)
    console.log('tasksCount', tasksCount)

    if(tasksCount == 0) {
      var tasklist = app.globalData.tasklist
      tasklist[courseid] = []
      app.globalData.tasklist =tasklist
      console.log(tasklist)

      this.setData({
        show: true
      })

      return
    }

    tasks = []
    for(var i = 0; i < tasksCount; i += 20) {
      let res = await this.getTasksSkip(courseid, i)
      console.log(res)
      tasks = tasks.concat(res)

      if(tasks.length == tasksCount) {
        break
      }
    }
    console.log('tasks', tasks)

    /**
     * 获取状态
     * 1：未开始
     * 2：提交中
     * 3：互评中
     * 4：已过期
     */
    for(var i = 0; i < tasks.length; i++) {
      if(tasks[i].uploadstart > now) {
        tasks[i].state = '1'
      } else if (tasks[i].uploadstart <= now && now <= tasks[i].uploadend) {
        tasks[i].state = '2'
      } else if (tasks[i].evaluatestart <= now && now <= tasks[i].evaluateend) {
        tasks[i].state = '3'
      } else {
        tasks[i].state = '4'
      }
    }

    console.log('tasks', tasks)

    // 处理时间
    for (var i = 0; i < tasks.length; i++) {
      tasks[i].zhouqi = dt.formatTime(tasks[i].uploadstart) + '-' + dt.formatTime(tasks[i].evaluateend)
    }

    console.log('tasks', tasks)

    // 处理长字符串
    for (var i = 0; i < tasks.length; i++) {
      tasks[i].ttasknameh = st.handleTaskName(tasks[i].taskname)
    }

    console.log('tasks', tasks)

    // 更新全局数据
    var tasklist = app.globalData.tasklist
    tasklist[courseid] = tasks
    app.globalData.tasklist = tasklist
    console.log(tasklist)

    this.setData({
      courseid: courseid,
      tasks: tasks,
      show: true
    })

    wx.hideLoading()
  },
  /**
   * 其他函数
   */
  getTasksCount: function (courseid) {
    return new Promise((resolve, reject) => {
      const db = wx.cloud.database()
      const _ = db.command

      db.collection('task')
        .where({
          _courseid: courseid
        })
        .count()
        .then(res => {
          const total = res.total
          resolve(total)
        })
        .catch(err => {
          reject('获取失败')
          console.log(err)
        })
    })
  },
  getTasksSkip: function (courseid, skip) {
    return new Promise((resolve, reject) => {
      const db = wx.cloud.database()
      const _ = db.command

      db.collection('task')
        .where({
          _courseid: courseid
        })
        .orderBy('cretime', 'desc')
        .skip(skip)
        .get()
        .then(res => {
          const data = res.data
          resolve(data)
        })
        .catch(err => {
          reject('获取失败')
          console.log(err)
        })
    })
  },
  toAddTask: function() {
    const courseid = this.data.courseid

    wx.navigateTo({
      url: '../addtask/addtask?data=' + courseid + '/1',
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const courseid = options.courseid
    console.log('courseid')

    this.init(courseid)
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