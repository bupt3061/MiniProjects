//index.js

// 获取全局变量
const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    openid: null,
    type: null,
    courses: null,
    tasks: null,
    uploadNum: 0,
    evaluateNum: 0,
    content: '添加课程 >>',
    $zanui: {
      toptips: {
        show: true
      }
    }
  },
  /**
   * 初始化函数
   */
  async init() {
    const app = getApp()
    const date = new Date()

    // 加载
    wx.showLoading({
      title: '加载中',
    })

    // 获取设备信息
    var info = wx.getSystemInfoSync()
    var screenWidth = info.screenWidth

    // 从数据库获取该用户信息
    let openid = await this.getOpenid()
    let userInfo = await this.getUserInfo(openid)
    console.log('userInfo:', userInfo)
    app.globalData.openid = openid

    if (!userInfo) {
      // 数据库中不存在该条记录
      wx.redirectTo({
        url: '../login/login?openid=' + openid,
      })

      return
    }

    // 获取用户所有任务
    var temp = []
    for (var i = 0; i < userInfo.courses.length; i++) {
      let res = await this.getTasks(userInfo.courses[i])
      temp = temp.concat(res)
    }

    var new_temp = []
    for (var i = 0; i < temp.length; i++) {
      if (date >= new Date(temp[i].uploadstart)) {
        new_temp.push(temp[i])
      }
    }

    let [tasks, uploadNum, evaluateNum] = await this.processTasks(openid, new_temp)
    console.log('tasks:', tasks)
    console.log('uploadNum', uploadNum)
    console.log('evaluateNum', evaluateNum)

    // 获取用户所有课程
    var courses = []
    for (var i = 0; i < userInfo.courses.length; i++) {
      let res = await this.getCourse(userInfo.courses[i])
      courses = courses.concat(res)
    }

    // 获得课程封面
    var coverids = []
    for (var i = 0; i < courses.length; i++) {
      var temp = {
        fileID: courses[i].cover,
        maxAge: 60 * 60, // one hour
      }
      coverids.push(temp)
    }

    let covers = await this.get_covers(coverids)

    for (var i = 0; i < courses.length; i++) {
      courses[i].tempFileURL = covers[i].tempFileURL
    }

    console.log('courses:', courses)

    // 结束加载
    wx.hideLoading()

    // 设置数据
    this.setData({
      openid: openid,
      type: userInfo.type,
      courses: courses,
      tasks: tasks,
      uploadNum: uploadNum,
      evaluateNum: evaluateNum
    })

    app.globalData.userInfo = userInfo
    app.globalData.tasks = tasks
    app.globalData.courses = courses
    app.globalData.type = userInfo.type
    app.globalData.screenWidth = screenWidth
  },
  /**
   * 页面其他函数
   */
  get_covers: function(covers) {
    return new Promise((resolve, reject) => {
      wx.cloud.getTempFileURL({
        fileList: covers
      }).then(res => {
        // get temp file URL
        resolve(res.fileList)
      }).catch(error => {
        // handle error
        console.log(error)
      })
    })
  },
  getOpenid: function() {
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
  getUserInfo: function(openid) {
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
  getTasks: function(courseid) {
    return new Promise((resolve, reject) => {
      const db = wx.cloud.database()
      const _ = db.command

      var date = new Date()

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
  getCourse: function(courseid) {
    return new Promise((resolve, reject) => {
      const db = wx.cloud.database()

      db.collection('course').where({
          _id: courseid
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
  processTasks: function(openid, tasks) {
    // 处理任务数据
    return new Promise((resolve, reject) => {
      var date = new Date()
      var uploadNum = 0
      var evaluateNum = 0

      for (var i = 0; i < tasks.length; i++) {
        var upload = true // 默认已交作业
        var evaluate = true // 默认已互评

        var past_upload = false // 默认提交未过期
        var past_evaluate = false // 默认互评未过期

        // 判断是否提交
        if (!tasks[i].uploaded.includes(openid)) {
          upload = false

          if (date >= new Date(tasks[i].uploadstart) && date <= new Date(tasks[i].uploadend)) {
            uploadNum += 1
          }
        }

        if (!tasks[i].evaluated.includes(openid)) {
          evaluate = false

          if (date >= new Date(tasks[i].evaluatestart) && date <= new Date(tasks[i].evaluateend)) {
            evaluateNum += 1
          }
        }

        // 判断是否过期
        if (date > new Date(tasks[i].evaluateend)) {
          past_upload = true
          past_evaluate = true
        } else if (date > new Date(tasks[i].uploadend)) {
          past_upload = true
        }

        tasks[i]['upload'] = upload
        tasks[i]['evaluate'] = evaluate
        tasks[i]['past_upload'] = past_upload
        tasks[i]['past_evaluate'] = past_evaluate
      }
      resolve([tasks, uploadNum, evaluateNum])
    })
  },
  toMyCourse: function() {
    wx.switchTab({
      url: '../mine/mine',
    })
  },
  toHomework: function() {
    wx.navigateTo({
      url: '../homework/homework?uploadNum=' + this.data.uploadNum,
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