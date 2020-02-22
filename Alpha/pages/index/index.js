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
    inUploadNum: 0,
    inEvalNum: 0,
    hasCourse: true
  },
  /**
   * 初始化函数
   */
  async init() {

    // 显示加载
    wx.showLoading({
      title: '加载中',
    })

    /**
     * 1、获取用户信息并存储到全局
     * 2、若数据库中和不存在该用户则跳转到登陆界面
     */
    let openid = await this.getOpenid()
    let userInfo = await this.getUserInfo(openid)
    var type = null

    console.log('openid', openid)
    app.globalData.openid = openid

    if (!userInfo) {
      // 数据库中不存在该条记录
      wx.hideLoading()

      wx.redirectTo({
        url: '../login/login?openid=' + openid,
      })

      return
    } else {
      type = userInfo.type

      console.log('userInfo', userInfo)
      console.log('type', type)
      app.globalData.userInfo = userInfo
      app.globalData.type = type
    }

    /**
     * 1、获取课程信息
     * 2、若未添加课程则显示顶部提示
     */
    const courseids = userInfo.courses
    if (courseids.length == 0) {
      wx.hideLoading()
      console.log('尚未添加课程')

      this.setData({
        inUploadNum: 0,
        inEvalNum: 0,
        type: type,
        openid: openid,
        hasCourse: false
      })

      return
    } else {
      let courses = await this.getCourses(courseids)

      // 添加课程封面
      var coverCloudPaths = []
      for (var i = 0; i < courses.length; i++) {
        var temp = {
          fileID: courses[i].cover,
          maxAge: 60 * 60, // 一小时
        }
        coverCloudPaths.push(temp)
      }

      let coverPaths = await this.getCoverPaths(coverCloudPaths)

      for (let i = 0; i < courses.length; i++) {
        courses[i].coverPath = coverPaths[i].tempFileURL
      }

      // 设置数据
      console.log('courses', courses)
      console.log('courseids', courseids)
      app.globalData.courseids = courseids
      app.globalData.courses = courses
    }

    /**
     * 分别处理学生和教师的信息
     */
    if (type == 1) {
      // 学生端

      /**
       * 1、获得消息数目并设置提示红点
       * 2、消息数目 = 已过期任务数 - 已存在消息数
       */
      let pastedEvalTasksNum = await this.pastedEvalTasksNum(courseids)
      let msgNum = await this.getMsgNum(openid)

      const newMsgNum = pastedEvalTasksNum - msgNum
      console.log('pastedEvalTasksNum', pastedEvalTasksNum)
      console.log('msgNum', msgNum)
      console.log('newMsgNum', newMsgNum)

      if(newMsgNum > 0) {
        wx.showTabBarRedDot({
          index: 1,
          success: res => {
            console.log(res)
          },
          fail: err => {
            console.log(err)
          }
        })
      }

      /**
       * 1、获取所有待提交任务数并存储到全局
       * 2、需提交任务数 = 所有待提交 - 所有已提交
       * 3、获取未提交及可修改任务并存储到全局
       */
      var inUploadNum = 0
      var wtjTasks = []
      var kxgTasks = []

      let inUploadTasks = await this.getInUploadTasks(courseids) // 所有处在提交期的任务：未提交+可修改
      console.log('inUploadTasks', inUploadTasks)

      if (inUploadTasks.length != 0) { // 存在处在提交期的任务
        var inUploadTaskids = []
        for (var i = 0; i < inUploadTasks.length; i++) {
          inUploadTaskids.push(inUploadTasks[i]._id)
        }

        // 获得未提交数
        let uploadedTasks = await this.getUploadedTasks(openid, inUploadTaskids)
        console.log('uploadedTasks', uploadedTasks)

        inUploadNum = inUploadTasks.length - uploadedTasks.length

        for (var i = 0; i < inUploadTasks.length; i++) {
          // 可修改任务
          for (var j = 0; j < uploadedTasks.length; j++) {
            if (inUploadTasks[i]._id == uploadedTasks[j]._taskid) {
              kxgTasks.push(inUploadTasks[i])
              continue
            }
          }
        }

        for (var i = 0; i < inUploadTasks.length; i++) {
          // 未提交任务
          var flag = true
          for (var j = 0; j < uploadedTasks.length; j++) {
            if (inUploadTasks[i]._id == uploadedTasks[j]._taskid) {
              flag = false
            }
          }
          if (flag) {
            wtjTasks.push(inUploadTasks[i])
          }
        }
      }

      console.log('待提交', inUploadNum)
      console.log('可修改', kxgTasks)
      console.log('未提交', wtjTasks)
      app.globalData.inUploadNum = inUploadNum
      app.globalData.kxgTasks = kxgTasks
      app.globalData.wtjTasks = wtjTasks

      /**
       * 1、获取待互评任务数并存储到全局
       * 2、获得未互评及未完成互评任务并存储到全局
       */
      var inEvalNum = 0
      var whpTasks = []
      var wwcTasks = []

      let inEvalTasks = await this.getInEvalTasks(courseids)
      console.log('inEvalTasks', inEvalTasks)

      if (inEvalTasks.length != 0) { // 存在处在提交期的任务：未完成+未互评
        var inEvalTaskids = []
        for (var i = 0; i < inEvalTasks.length; i++) {
          inEvalTaskids.push(inEvalTasks[i]._id)
        }

        // 获得未互评数
        let [evaledTaskNum, evaledTasks] = await this.getEvaledTasks(openid, inEvalTaskids)
        inEvalNum = inEvalTasks.length - evaledTaskNum
        console.log('evaledTasks', evaledTasks)

        // 获取未互评及未完成任务并存储到全局
        for (var i = 0; i < inEvalTasks.length; i++) {
          var flag = true
          for (var j = 0; j < evaledTasks.length; j++) {
            if (inEvalTasks[i]._id == evaledTasks[j]._id) {
              flag = false

              if (evaledTasks[j].num < 3) {
                inEvalTasks[i].evaledNum = evaledTasks[j].num
                wwcTasks.push(inEvalTasks[i])
              }

              continue
            }
          }

          if (flag) {
            inEvalTasks[i].evaledNum = 0
            whpTasks.push(inEvalTasks[i])
          }
        }
      }

      console.log('待互评', inEvalNum)
      console.log('未完成', wwcTasks)
      console.log('未互评', whpTasks)
      app.globalData.inEvalNum = inEvalNum
      app.globalData.whpTasks = whpTasks
      app.globalData.wwcTasks = wwcTasks

      // 更新数据
      this.setData({
        inUploadNum: inUploadNum,
        inEvalNum: inEvalNum,
        type: type,
        openid: openid
      })

      wx.hideLoading()
    } else if (type == 2) {
      // 教师端
    }

  },
  /**
   * 页面其他函数
   */
  getInUploadTasks: function(courseids) {
    /**
     * 获取当前处在提交期的任务
     */
    return new Promise((resolve, reject) => {
      const db = wx.cloud.database()
      const _ = db.command
      const now = new Date()

      db.collection("task")
        .where({
          _courseid: _.in(courseids),
          uploadstart: _.lte(now),
          uploadend: _.gte(now)
        })
        .orderBy('uploadend', 'asc')
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
  getUploadedTasks: function(openid, inUploadTaskids) {
    /**
     * 获取已提交的任务数
     * 待提交任务数 = 所有提交任务数 - 已提交任务数（作品数）
     */
    return new Promise((resolve, reject) => {
      const db = wx.cloud.database()
      const _ = db.command

      db.collection('work')
        .where({
          _taskid: _.in(inUploadTaskids),
          _openid: openid
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
  getInEvalTasks: function(courseids) {
    /**
     * 获取当前处在互评期的任务
     */
    return new Promise((resolve, reject) => {
      const db = wx.cloud.database()
      const _ = db.command
      const now = new Date()

      db.collection("task")
        .where({
          _courseid: _.in(courseids),
          evaluatestart: _.lte(now),
          evaluateend: _.gte(now)
        })
        .orderBy('evaluateend', 'asc')
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
  getEvaledTasks: function(openid, inEvalTaskids) {
    return new Promise((resolve, reject) => {
      const db = wx.cloud.database()
      const _ = db.command
      const $ = _.aggregate

      db.collection('evaluate').aggregate()
        .match({
          _openid: openid,
          _taskid: _.in(inEvalTaskids)
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
  getCourses: function(courseids) {
    return new Promise((resolve, reject) => {
      const db = wx.cloud.database()
      const _ = db.command

      db.collection('course')
        .where({
          _id: _.in(courseids)
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
  getCoverPaths: function(covers) {
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
        name: 'getOpenid',
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
    /**
     * 判断该用户是否已注册并返回
     */
    return new Promise((resolve, reject) => {
      const db = wx.cloud.database()
      const user = db.collection('user')

      user.where({
          _openid: openid
        })
        .get()
        .then(res => {
          const item = res.data[0]
          resolve(item)
        })
        .catch(err => {
          console.log(err)
          reject('查询失败')
        })
    })
  },
  pastedEvalTasksNum: function(courseids) {
    return new Promise((resolve, reject) => {
      const now = new Date()
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
  getMsgNum: function (openid) {
    return new Promise((resolve, reject) => {
      const db = wx.cloud.database()
      const _ = db.command

      db.collection('msg')
        .where({
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
  toHomework: function() {
    wx.navigateTo({
      url: '../homework/homework',
    })
  },
  toMutualEval: function() {
    wx.navigateTo({
      url: '../mutualeval/mutualeval',
    })
  },
  /**
   * 生命周期函数--监听页面加载（1）
   * 页面加载完成，一个页面只会调用一次
   */
  onLoad: function() {
    this.init()
  },
  /**
   * 生命周期函数--监听页面初次渲染完成（3）
   * 页面渲染完成，一个页面只会调用一次
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示（2）
   * 页面打开一次就会显示
   */
  onShow: function() {
    const inUploadNum = app.globalData.inUploadNum
    const inEvalNum = app.globalData.inEvalNum
    const courseids = app.globalData.courseids
    const type = app.globalData.type
    const openid = app.globalData.openid

    if(type == 1) {
      // 学生
      var hasCourse = true
      if(courseids.length == 0) {
        hasCourse = false
      }

      this.setData({
        inUploadNum: inUploadNum,
        inEvalNum: inEvalNum,
        type: type,
        openid: openid,
        hasCourse: hasCourse
      })
    } else if(type == 2) {
      // 老师
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   * 当navigateTo或底部tab切换时调用
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   * 当使用重定向方法wx.redirectTo(OBJECT)或关闭当前页返回上一页wx.navigateBack的时候调用
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