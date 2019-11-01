//index.js

// 引入外部js
const stg = require('../../js/storage.js')

//获取应用实例
const app = getApp()

Page({
  data: {
    openid: null,
    type: null,
    courses: null,
    tasks: null,
    uploadNum: 0,
    evaluateNum: 0
  },
  async init() {
    // 获取用户基本信息
    let openid = await this.getOpenid() // 获取openid
    console.log('openid:', openid)
    let userInfo = await this.getUserInfo(openid) // 从数据库获取该用户信息
    console.log('userInfo:', userInfo)

    if(!userInfo) {
      wx.redirectTo({
        url: '../login/login',
      })

      return 
    }

    // 获取用户所有任务
    var temp = []
    for (var i = 0; i < userInfo.courses.length; i++) {
      let res = await this.getTasks(userInfo.courses[i])
      temp = temp.concat(res)
    }
    let [tasks, uploadNum, evaluateNum] = await this.processTasks(openid, temp)
    console.log('tasks:', tasks)
    console.log('uploadNum', uploadNum)
    console.log('evaluateNum', evaluateNum)

    // 设置数据
    this.setData({
      openid: openid,
      type: userInfo.type,
      courses: userInfo.courses,
      tasks: tasks,
      uploadNum: uploadNum,
      evaluateNum: evaluateNum
    })

    const app = getApp()
    app.globalData.openid = openid
    app.globalData.userInfo = userInfo
    app.globalData.tasks = tasks

  },
  getOpenid: function () {
    return new Promise((resolve, reject) => {
      // 获取openid
      wx.cloud.callFunction({
        name: 'getInfo',
        data: {},
        success: res => {
          resolve(res.result.OPENID)
        },
        fail: err => {
          console.log(err)
          reject(err)
        }
      })
    })
  },
  getUserInfo: function (openid) {
    // 从数据库中获取该用户记录
    return new Promise((resolve, reject) => {
      const db = wx.cloud.database()

      db.collection('user').where({
        _openid: openid
      })
        .get()
        .then(res => {
          resolve(res.data[0])
        })
        .catch(err => {
          console.log(err)
          reject(err)
        })
    })
  },
  getTasks: function (courseid) {
    return new Promise((resolve, reject) => {
      const db = wx.cloud.database()

      db.collection('task').where({
        _courseid: courseid
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
  processTasks: function (openid, tasks) {
    // 处理任务数据
    return new Promise((resolve, reject) => {
      var date = new Date()
      var uploadNum = 0
      var evaluateNum = 0

      for (var i = 0; i < tasks.length; i++) {
        var upload = true // 默认已交作业
        var uploadDisplay = false // 默认不用显示未交作业
        var evaluate = true // 默认已互评
        var evaluateDisplay = false // 默认不用显示未互评

        // 判断是否已上传
        if (!tasks[i].uploaded.includes(openid)) {
          upload = false

          if (date >= tasks[i].uploadstart && date <= tasks[i].uploadend) {
            uploadDisplay = true
            uploadNum = uploadNum + 1
          }
        }

        // 判断是否完成互评任务
        if (!tasks[i].evaluated.includes(openid)) {
          evaluate = false

          if (date >= tasks[i].evaluatestart && date <= tasks[i].evaluateend) {
            evaluateDisplay = true
            evaluateNum = evaluateNum + 1
          }
        }

        tasks[i]['upload'] = upload
        tasks[i]['evaluate'] = evaluate
        tasks[i]['uploadDisplay'] = uploadDisplay
        tasks[i]['evaluateDisplay'] = evaluateDisplay
      }

      // resolve({ 'tasks': tasks, 'uploadNum': uploadNum, 'evaluateNum': evaluateNum})
      resolve([tasks,  uploadNum, evaluateNum])
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function() {
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