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
    inEvalNum: 0
  },
  /**
   * 初始化函数
   */
  async init() {

    // 加载
    wx.showLoading({
      title: '加载中',
    })

    /**
     * 获取用户信息
     */
    let openid = await this.getOpenid()
    let userInfo = await this.getUserInfo(openid)
    var type = null

    console.log('openid', openid)
    app.globalData.openid = openid

    if (!userInfo) {
      // 数据库中不存在该条记录
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
     * 获取课程信息
     */

    // 获取用户所有课程
    const courseids = userInfo.courses
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

    /**
     * 分别处理学生和教师的信息
     */
    if (type == 1) {
      // 学生端
      var inUploadNum = null // 待提交任务数
      var inEvalNum = null // 待互评任务数

      /**
       * 获取待提交任务数
       */
      let inUploadTasks = await this.getInUploadTasks(courseids)

      var inUploadTaskids = []
      for (var i = 0; i < inUploadTasks.length; i++) {
        inUploadTaskids.push(inUploadTasks[i]._id)
      }

      let uploadedTasks = await this.getUploadedTasks(openid, inUploadTaskids)

      inUploadNum = inUploadTasks.length - uploadedTasks.length
      console.log('inUploadNum', inUploadNum)

      var wtjTasks = []
      var kxgTasks = []

      for (var i = 0; i < inUploadTasks.length; i++) {
        var flag = false
        for (var j = 0; j < uploadedTasks.length; j++) {
          if (inUploadTasks[i]._id == uploadedTasks[j].taskid) {
            flag = true
            continue
          }
        }
        if (flag) {
          kxgTasks.push(inUploadTasks[i])
        } else {
          wtjTasks.push(inUploadTasks[i])
        }
      }

      console.log('kxgTasks', kxgTasks)
      console.log('wtjTasks', wtjTasks)
      app.globalData.kxgTasks = kxgTasks
      app.globalData.wtjTasks = wtjTasks

      /**
       * 获取待互评任务数
       */
      let inEvalTasks = await this.getInEvalTasks(courseids)

      var inEvalTaskids = []
      for (var i = 0; i < inEvalTasks.length; i++) {
        inEvalTaskids.push(inEvalTasks[i]._id)
      }

      let evaledTaskNum = await this.getEvaledTaskNum(openid, inEvalTaskids)
      inEvalNum = inEvalTasks.length - evaledTaskNum

      console.log('inEvalNum', inEvalNum)

      // 更新数据
      app.globalData.openid = openid

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
     * 待提交任务数 = 所有提交任务数 - 已提交任务数
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
  getEvaledTaskNum: function(openid, inEvalTaskids) {
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
          resolve(num)
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
  getTasksCount: function(courseid, date) {
    return new Promise((resolve, reject) => {
      const db = wx.cloud.database()
      const _ = db.command
      const task = db.collection('task')

      task.where({
        _courseid: courseid,
        uploadstart: _.lte(date)
      }).count().then(res => {
        const total = res.total
        resolve(total);
      }).catch(err => {
        console.log(err)
        reject("查询失败")
      })
    })
  },
  getTasksIndexSkip: function(courseid, skip, date) {
    return new Promise((resolve, reject) => {
      const db = wx.cloud.database()
      const _ = db.command
      const task = db.collection('task')

      let statusList = []
      let selectPromise;

      selectPromise = task.where({
        _courseid: courseid,
        uploadstart: _.lte(date)
      }).skip(skip).get()

      selectPromise.then(res => {
        const data = res.data
        resolve(data);
      }).catch(err => {
        console.error(err)
        reject("查询失败!")
      })
    })
  },
  async getTasks(courseid, date) {
    let count = await this.getTasksCount(courseid, date)
    let list = []

    for (let i = 0; i < count; i += 10) {
      let res = await this.getTasksIndexSkip(courseid, i, date)
      list = list.concat(res)

      if (list.length == count) {
        return list
      }
    }
  },
  judgeUploaded: function(taskid, openid) {
    /**
     * 判断是否上传
     */
    return new Promise((resolve, reject) => {
      const work = wx.cloud.database().collection('work')

      work.where({
          _taskid: taskid,
          _openid: openid
        })
        .get()
        .then(res => {
          const work = res.data
          var uploaded = true

          if (work.length == 0) {
            uploaded = false
          }

          resolve([work, uploaded])
        })
        .catch(err => {
          console.log(err)
          reject('获取失败')
        })
    })
  },
  judgeEvaluated: function(taskid, openid) {
    /**
     * 判断是否已完成互评（3个）
     */
    return new Promise((resolve, reject) => {
      const evaluate = wx.cloud.database().collection('evaluate')

      evaluate.where({
          _taskid: taskid,
          _openid: openid
        }).get()
        .then(res => {
          const evaluates = res.data
          var evaluated = true
          const total = evaluates.length

          if (total < 3) {
            evaluated = false
          }

          resolve([evaluates, evaluated, total])
        })
        .catch(err => {
          console.log(err)
          reject('获取失败')
        })
    })
  },
  toHomework: function() {
    wx.navigateTo({
      url: '../homework/homework?uploadNum=' + this.data.uploadNum,
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
    this.setData({
      inUploadNum: app.globalData.inUploadNum,
      inEvalNum: app.globalData.inEvalNum
    })
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