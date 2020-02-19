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

    // 加载
    wx.showLoading({
      title: '加载中',
    })

    /**
     * 获取设备信息
     */
    const info = wx.getSystemInfoSync()
    const screenWidth = info.screenWidth

    console.log('screenWidth', screenWidth)
    app.globalData.screenWidth = screenWidth

    /**
     * 获取用户信息
     */
    let openid = await this.getOpenid()
    let userInfo = await this.existInUserlist(openid)
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
     * 处理课程
     */

    // 获取用户所有课程
    var courses = []

    for (let i = 0; i < userInfo.courses.length; i++) {
      let course = await this.getCourse(userInfo.courses[i])
      courses = courses.concat(course)
    }

    // 添加教师信息
    for(let i = 0; i < courses.length; i++) {
      let teacher = await this.getTeacherInfo(courses[i]._openid)
      courses[i].teacher = teacher
    }

    // 添加课程封面
    var covers = []
    for (let i = 0; i < courses.length; i++) {
      var temp = {
        fileID: courses[i].cover,
        maxAge: 60 * 60, // one hour
      }
      covers.push(temp)
    }

    let coverPaths = await this.getCoverPaths(covers)

    for (let i = 0; i < courses.length; i++) {
      courses[i].coverPath = coverPaths[i].tempFileURL
    }

    console.log('courses', courses)
    app.globalData.courses = courses

    /**
     * 处理任务
     * 
     * 状态 status：
     * 1：提交期
     * 2：互评期
     * 3：已过期
     * 
     * uploaded：
     * true：已提交
     * false：未提交
     * 
     * evaluated:
     * true: 已互评
     * false：未互评
     */
    // 获取用户所有任务
    const now = new Date()
    let tasks = []

    for (let i = 0; i < userInfo.courses.length; i++) {
      let res = await this.getTasks(userInfo.courses[i], now)
      tasks = tasks.concat(res)
    }

    // 添加课程信息
    for(var i = 0; i < tasks.length; i++) {
      for(var j = 0; j < courses.length; j++) {
        if(tasks[i]._courseid == courses[j]._id) {
          tasks[i].coursename = courses[j].coursename
          tasks[i].courseCover = courses[j].coverPath
        }
      }
    }

    var uploadNum = 0
    var evaluateNum = 0

    for (let i = 0; i < tasks.length; i++) {
      // 状态
      if (now > tasks[i].evaluateend) {
        tasks[i].status = 3
      } else if (now >= tasks[i].uploadstart && now <= tasks[i].uploadend) {
        tasks[i].status = 1
      } else {
        tasks[i].status = 2
      }

      // 是否提交
      let [work, uploaded] = await this.judgeUploaded(tasks[i]._id, openid)

      if (uploaded) {
        tasks[i].work = {
          workid: work[0]._id,
          path: work[0].path,
          title: work[0].title,
          describe: work[0].describe,
          uploadtime: work[0].uploadtime
        }
      }
      else {
        if (tasks[i].status == 1) {
          uploadNum += 1
        }
      }
      tasks[i].uploaded = uploaded

      // 是否互评
      let [evaluates, evaluated, total] = await this.judgeEvaluated(tasks[i]._id, openid)
      if(total > 0) {
        tasks[i].evaluates = evaluates
      }
      if(!evaluated && tasks[i].status == 2) {
        evaluateNum += 1
      }
      tasks[i].evaluated = evaluated
      tasks[i].total = total
    }

    console.log('tasks', tasks)
    console.log('uploadNum', uploadNum)
    console.log('evaluateNum', evaluateNum)

    app.globalData.tasks = tasks

    // 结束加载
    wx.hideLoading()

    // 设置数据
    this.setData({
      openid: openid,
      type: type,
      courses: courses,
      tasks: tasks,
      uploadNum: uploadNum,
      evaluateNum: evaluateNum
    })

    app.globalData.uploadNum = uploadNum
    app.globalData.evaluateNum = evaluateNum
  },
  /**
   * 页面其他函数
   */
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
  existInUserlist: function(openid) {
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
  getCourse: function(courseid) {
    return new Promise((resolve, reject) => {
      const db = wx.cloud.database()
      const course = db.collection('course')

      course.where({
          _id: courseid
        })
        .get()
        .then(res => {
          const course = res.data
          resolve(course)
        })
        .catch(err => {
          console.log(err)
          reject('获取失败')
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
  getTeacherInfo: function(openid) {
    return new Promise((resolve, reject) => {
      const user = wx.cloud.database().collection('user')

      user.where({
        _openid: openid
      })
      .get()
      .then(res => {
        const teacher = res.data[0]
        resolve(teacher)
      })
      .catch(err => {
        console.log(err)
        reject('获取失败')
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
    this.setData({
      uploadNum: app.globalData.uploadNum,
      evaluateNum: app.globalData.evaluateNum
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