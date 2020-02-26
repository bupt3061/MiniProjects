// pages/course/course.js
const app = getApp()
const dt = require('../../utils/date.js')
const st = require('../../utils/string.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    hasCourse: true,
    courses: null,
    duration: 2000,
    content: null,
    $zanui: {
      toptips: {
        show: false
      }
    }
  },
  /**
   * 初始化函数
   */
  async init(courseids, arg) {
    const gCourses = app.globalData.courses
    const gCourseids = app.globalData.courseids
    const openid = app.globalData.openid
    var courses = null
    const now = new Date()

    if (arg == 1) {
      // 初始加载
      courses = gCourses
    } else if (arg == 2) {
      /**
       * 1、判断是否添加过课程
       * 2、判断课程是否存在
       * 3、添加课程
       */
      for (var i = 0; i < gCourseids.length; i++) {
        if (courseids[0] == gCourseids[i]) { // 已存在
          console.log('课程已添加')
          this.setData({
            $zanui: {
              toptips: {
                show: true
              }
            },
            content: "课程已添加"
          });

          setTimeout(() => {
            this.setData({
              $zanui: {
                toptips: {
                  show: false
                }
              }
            })
          }, this.data.duration);

          return
        }
      }

      let exit = await this.judgeCourseExist(courseids[0])
      console.log('exit', exit)

      if (!exit) { // 课程不存在
        console.log('课程不存在')
        this.setData({
          $zanui: {
            toptips: {
              show: true
            }
          },
          content: "课程不存在"
        });

        setTimeout(() => {
          this.setData({
            $zanui: {
              toptips: {
                show: false
              }
            }
          })
        }, this.data.duration);

        return
      }

      wx.showLoading({
        title: '加载中',
      })

      // 添加课程
      const db = wx.cloud.database()
      const _ = db.command

      db.collection('user')
        .where({
          _openid: openid
        })
        .update({
          data: {
            courses: _.push(courseids[0])
          }
        })
        .then(res => {
          console.log(res)
        })
        .catch(err => {
          console.log(err)
        })

      let res = await this.getCourse(courseids[0])
      courses = res
      console.log('courses', courses)
    }

    // 处理时间
    for (var i = 0; i < courses.length; i++) {
      courses[i].shengyu = this.getTimeBetween(now, courses[i].endtime)
    }

    // 获得任务并处理、分组
    let tasksCount = await this.getTasksCount(courseids)
    console.log('tasksCount', tasksCount)

    var tasks = []
    for (var i = 0; i < tasksCount; i++) {
      let res = await this.getTasksSkip(courseids, i)
      tasks = tasks.concat(res)

      if (tasks.length == tasksCount) {
        break
      }
    }

    for (var i = 0; i < tasksCount; i++) {
      // 降序排序
      for (var j = 0; j < tasksCount - i - 1; j++) {
        if (tasks[j].uploadstart < tasks[j + 1].uploadstart) {
          var temp = tasks[j]
          tasks[j] = tasks[j + 1]
          tasks[j + 1] = temp
        }
      }
    }

    for (var i = 0; i < tasks.length; i++) {
      var status = true
      
      if (tasks[i].evaluateend > now) {
        status = false
      }
      tasks[i].status = status
    }

    console.log('tasks', tasks)

    for (var i = 0; i < courses.length; i++) {
      // 分组
      var temp = []
      for (var j = 0; j < tasks.length; j++) {
        if (courses[i]._id == tasks[j]._courseid) {
          temp.push(tasks[j])
        }
      }
      courses[i].tasks = temp
    }

    // 课程逆序排列
    var length = courseids.length

    var temp = []
    for (var i = 0; i < length; i++) {
      temp.push(courseids.pop())
    }

    courseids = temp
    console.log('temp', temp)
    console.log('courseids', courseids)

    var list = []
    for (var i = 0; i < courseids.length; i++) {
      for (var j = 0; j < courses.length; j++) {
        if (courseids[i] == courses[j]._id) {
          list.push(courses[j])
          break
        }
      }
    }

    courses = list
    console.log('list', list)
    console.log('courses', courses)

    if (arg == 1) {
      for (var i = 0; i < courses.length; i++) {
        if (i == 0) {
          courses[i].status = true
          courses[i].btn = "../../img/up.png"
        } else {
          courses[i].status = false
          courses[i].btn = "../../img/down.png"
        }

        for (var j = 0; j < courses[i].tasks.length; j++) {
          courses[i].tasks[j].tasknameh = st.handleListTaskName(courses[i].tasks[j].taskname)
        }
      }

      console.log('courses', courses)
      console.log('courseids', courseids)
      app.globalData.courses = courses
      app.globalData.courseids = courseids
      app.globalData.processedCourses = true

      this.setData({
        courses: courses,
        hasCourse: true
      })
    } else if (arg == 2) {
      // 添加课程封面
      var coverCloudPaths = []
      for (var i = 0; i < courses.length; i++) {
        var temp = {
          fileID: list[i].cover,
          maxAge: 60 * 60, // 一小时
        }
        coverCloudPaths.push(temp)
      }

      let coverPaths = await this.getCoverPaths(coverCloudPaths)

      for (let i = 0; i < courses.length; i++) {
        courses[i].coverPath = coverPaths[i].tempFileURL
      }

      for (var i = 0; i < courses.length; i++) {
        if (i == 0) {
          courses[i].status = false
          courses[i].btn = "../../img/down.png"
          courses[i].coursenameh = st.handleTaskName(courses[i].coursename)
        }

        for (var j = 0; j < courses[i].tasks.length; j++) {
          courses[i].tasks[j].tasknameh = st.handleListTaskName(list[i].tasks[j].taskname)
        }
      }

      var processedId = courseids[0]
      console.log('processedId', processedId)
      app.globalData.processedCourseids.push(processedId)

      courses = courses.concat(gCourses)
      courseids = courseids.concat(gCourseids)

      console.log('courses', courses)
      console.log('courseids', courseids)
      app.globalData.courses = courses
      app.globalData.courseids = courseids

      this.setData({
        courses: courses,
        hasCourse: true
      })
    }

    wx.hideLoading()
  },
  /**
   * 其他函数
   */
  judgeCourseExist: function(courseid) {
    return new Promise((resolve, reject) => {
      const db = wx.cloud.database()
      const _ = db.command

      db.collection('course')
        .where({
          _id: courseid
        })
        .count()
        .then(res => {
          var exit = true
          const total = res.total
          if (total == 0) {
            exit = false
          }
          resolve(exit)
        })
        .catch(err => {
          console.log(err)
          reject('获取失败')
        })
    })
  },
  getCourse: function(courseid) {
    return new Promise((resolve, reject) => {
      const db = wx.cloud.database()
      const _ = db.command

      db.collection('course')
        .where({
          _id: courseid
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
  getTasksSkip: function(courseids, skip) {
    return new Promise((resolve, reject) => {
      const db = wx.cloud.database()
      const _ = db.command

      db.collection('task')
        .where({
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
  getTasksCount: function(courseids) {
    return new Promise((resolve, reject) => {
      const db = wx.cloud.database()
      const _ = db.command

      db.collection('task')
        .where({
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
  getTimeBetween: function(startDate, endDate) {
    var days = (endDate - startDate) / (1 * 24 * 60 * 60 * 1000)
    var timeString = null

    if (days < 0) {
      timeString = "已过期"
    } else if (days >= 365) {
      var years = days / 365
      timeString = "剩余学时：" + Math.floor(years).toString() + "年"
    } else if (days > 30 && days < 365) {
      var months = days / 30
      timeString = "剩余学时：" + Math.floor(months).toString() + "个月"
    } else if (days >= 7 && days < 30) {
      var weeks = days / 7
      timeString = "剩余学时：" + Math.floor(weeks).toString() + "周"
    } else if (days >= 1 && days < 7) {
      timeString = "剩余学时：" + Math.floor(days).toString() + "天"
    } else if (days < 1) {
      var hours = days * 24
      timeString = "剩余学时：" + Math.floor(hours).toString() + "小时"

      if (hours < 1) {
        var mins = hours * 60
        timeString = "剩余学时：" + Math.floor(mins).toString() + "分钟"
      }
    }

    return timeString
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
  clickCourse: function(e) {
    var courses = this.data.courses
    const courseid = e.currentTarget.dataset.courseid

    for (var i = 0; i < courses.length; i++) {
      if (courses[i]._id == courseid) {
        if (courses[i].status) {
          courses[i].status = false
          courses[i].btn = "../../img/down.png"
        } else {
          courses[i].status = true
          courses[i].btn = "../../img/up.png"
        }
      }
    }

    // 更新数据
    app.globalData.courses = courses
    console.log("courses", courses)

    this.setData({
      courses: courses
    })
  },
  clickTask: function(e) {
    const taskid = e.currentTarget.dataset.taskid
    const courseid = e.currentTarget.dataset.courseid
    const courses = app.globalData.courses
    const now = new Date()

    console.log(taskid)
    console.log(e)
  },
  addCourse: function() {
    const that = this

    wx.scanCode({
      success: res => {
        const courseid = res.result
        const arg = 2

        that.init([courseid, ], arg)
      },
      fail: err => {
        console.log(err)
      }

    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const processedCourses = app.globalData.processedCourses
    const courseids = app.globalData.courseids
    const arg = 1

    if(options.arg == '3') {
      this.addCourse()

      return
    }

    if (courseids.length == 0) {
      this.setData({
        hasCourse: false
      })

      return
    }

    if (processedCourses) {
      const courses = app.globalData.courses
      this.setData({
        courses: courses
      })

      return
    }
    this.init(courseids, arg)
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
    const processedCourses = app.globalData.processedCourses

    if (processedCourses) {
      const courses = app.globalData.courses
      this.setData({
        courses: courses
      })

      return
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