// pages/addcourse/addcourse.js
const st = require('../../utils/string.js')
const dt = require('../../utils/date.js')
const app = getApp()
const Dialog = require('../../dist/dialog/dialog');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    duration: 1000,
    content: null,
    $zanui: {
      toptips: {
        show: false
      }
    },
    backgroundColor: "#FAAD14",
    upLoading: false,
    delLoading: false,
    addLoading: false,
    arg: null,
    notUse: ["hours", "minutes", "seconds"],
    format: "YYYY-MM-DD",
    coursename: null,
    courseid: null,
    starttime: null,
    endtime: null,
    startPlaceHolder: "选择时间",
    endPlaceHolder: "选择时间",
    cover: null,
    coverPath: null,
    coverName: null,
    hasCover: false,
    course: null
  },
  /**
   * 初始化函数
   */
  async init(courseid) {
    const courses = app.globalData.courses
    let course
    let coursename
    let endtime
    let starttime
    let coverPath
    let cover
    let startPlaceHolder
    let endPlaceHolder

    // 获取课程
    for (var i = 0; i < courses.length; i++) {
      if (courses[i]._id == courseid) {
        course = courses[i]
      }
    }
    coursename = course.coursename
    coverPath = course.coverPath
    starttime = course.starttime
    endtime = course.endtime
    cover = course.cover
    console.log(course)
    console.log(coursename)
    console.log(coverPath)
    console.log(starttime)
    console.log(endtime)
    console.log(courseid)
    console.log(cover)

    // 处理时间
    var syear = starttime.getFullYear()
    var smonth = starttime.getMonth() + 1
    var sday = starttime.getDate()
    startPlaceHolder = syear + '-' + smonth + '-' + sday

    var eyear = endtime.getFullYear()
    var emonth = endtime.getMonth() + 1
    var eday = endtime.getDate()
    endPlaceHolder = eyear + '-' + emonth + '-' + eday

    // 设置数据
    this.setData({
      coursename: coursename,
      coverPath: coverPath,
      starttime: starttime,
      endtime: endtime,
      courseid: courseid,
      cover: cover,
      hasCover: true,
      endPlaceHolder: endPlaceHolder,
      startPlaceHolder: startPlaceHolder,
      course: course
    })
  },
  /**
   * 其他函数
   */
  inputCoursename: function(e) {
    const coursename = e.detail.value
    console.log("coursename", coursename)

    this.setData({
      coursename: coursename
    })
  },
  startDate: function(e) {
    const date = e.detail.value
    const year = date[0]
    const month = date[1]
    const day = date[2]
    const timestr = year + '/' + month + '/' + day + " 00:00:00"
    const starttime = new Date(timestr)
    console.log('date', date)
    console.log('starttime', starttime)

    this.setData({
      starttime: starttime
    })
  },
  endDate: function(e) {
    const date = e.detail.value
    const year = date[0]
    const month = date[1]
    const day = date[2]
    const timestr = year + '/' + month + '/' + day + " 23:59:59"
    const endtime = new Date(timestr)
    console.log('date', date)
    console.log('endtime', endtime)

    this.setData({
      endtime: endtime
    })
  },
  preview: function(e) {
    wx.previewImage({
      current: this.data.coverPath, //当前预览的图片
      urls: [this.data.coverPath, ], //所有要预览的图片
    })
  },
  async addCover() {
    let imgSrc = await this.chooseImg()
    console.log(imgSrc)

    if (imgSrc.length != 0) {
      this.setData({
        hasCover: true,
        coverPath: imgSrc.path,
        coverName: imgSrc.name
      })
    }
  },
  chooseImg: function() {
    return new Promise((resolve, reject) => {
      wx.chooseMessageFile({
        count: 1,
        type: 'image',
        success(res) {
          // tempFilePath可以作为img标签的src属性显示图片
          resolve(res.tempFiles[0])
        },
        fail: err => {
          reject('获取失败')
          console.log(err)
        }
      })
    })
  },
  deleteCover: function() {
    this.setData({
      hasCover: false,
      coverPath: null
    })
  },
  checkCoursename: function() {
    const coursename = this.data.coursename

    if (coursename == '' || coursename == null) {
      this.setData({
        $zanui: {
          toptips: {
            show: true
          }
        },
        content: '请填写课程名'
      })

      setTimeout(() => {
        this.setData({
          $zanui: {
            toptips: {
              show: false
            }
          }
        })
      }, this.data.duration);

      return false
    }

    return true
  },
  checkStarttime: function() {
    const starttime = this.data.starttime

    if (starttime == null) {
      this.setData({
        $zanui: {
          toptips: {
            show: true
          }
        },
        content: '请选择开课时间'
      })

      setTimeout(() => {
        this.setData({
          $zanui: {
            toptips: {
              show: false
            }
          }
        })
      }, this.data.duration);

      return false
    }

    return true
  },
  checkEndtime: function() {
    const endtime = this.data.endtime

    if (endtime == null) {
      this.setData({
        $zanui: {
          toptips: {
            show: true
          }
        },
        content: '请选择结课时间'
      })

      setTimeout(() => {
        this.setData({
          $zanui: {
            toptips: {
              show: false
            }
          }
        })
      }, this.data.duration);

      return false
    }

    return true
  },
  checkTime: function() {
    const starttime = this.data.starttime
    const endtime = this.data.endtime

    if (endtime <= starttime) {
      this.setData({
        $zanui: {
          toptips: {
            show: true
          }
        },
        content: '请正确设置时间'
      })

      setTimeout(() => {
        this.setData({
          $zanui: {
            toptips: {
              show: false
            }
          }
        })
      }, this.data.duration);

      return false
    }

    return true
  },
  checkCover: function() {
    const hasCover = this.data.hasCover

    if (!hasCover) {
      this.setData({
        $zanui: {
          toptips: {
            show: true
          }
        },
        content: '请添加课程封面'
      })

      setTimeout(() => {
        this.setData({
          $zanui: {
            toptips: {
              show: false
            }
          }
        })
      }, this.data.duration);

      return false
    }

    return true
  },
  uploadCover: function() {
    return new Promise((resolve, reject) => {
      const coverName = this.data.coverName
      const coverPath = this.data.coverPath
      wx.cloud.uploadFile({
        cloudPath: 'courseCover/' + coverName,
        filePath: coverPath, // 文件路径
      }).then(res => {
        // get resource ID
        const cloudPath = res.fileID
        resolve(cloudPath)
      }).catch(err => {
        // handle error
        reject('获取失败')
        console.log(err)
      })
    })
  },
  async summit() {
    var flag = true
    const openid = app.globalData.openid
    const now = new Date()
    const coursename = this.data.coursename
    const starttime = this.data.starttime
    const endtime = this.data.endtime
    const coverPath = this.data.coverPath
    let cover

    // 上传数据
    // wx.showLoading({
    //   title: '上传中',
    // })

    this.setData({
      addLoading: true
    })

    setTimeout(function() {}, 2000)

    // 检查课程名
    flag = this.checkCoursename()
    if (!flag) {
      return
    }

    // 检查课程开始时间
    flag = this.checkStarttime()
    if (!flag) {
      return
    }

    // 检查课程结束时间
    flag = this.checkEndtime()
    if (!flag) {
      return
    }

    // 检查时间
    flag = this.checkTime()
    if (!flag) {
      return
    }

    // 检查是否有封面
    flag = this.checkCover()
    if (!flag) {
      return
    }

    // 获取封面
    cover = await this.uploadCover()
    console.log(cover)

    const data = {
      coursename: coursename,
      cover: cover,
      starttime: starttime,
      endtime: endtime,
      cretime: now,
    }

    let courseid = await this.addCourse(data)
    console.log(courseid)

    // 更新数据
    const db = wx.cloud.database()
    const _ = db.command

    db.collection('user')
      .where({
        _openid: openid
      })
      .update({
        data: {
          courses: _.push([courseid, ])
        }
      })
      .then(res => {
        console.log(res)
      })
      .catch(err => {
        console.log(err)
      })

    const tcoursenameh = st.handleCourseName2(coursename)
    const zhouqi = dt.formatTime(starttime) + '-' + dt.formatTime(endtime)
    const item = {
      _id: courseid,
      coursename: coursename,
      cover: cover,
      coverPath: coverPath,
      cretime: now,
      starttime: starttime,
      endtime: endtime,
      tcoursenameh: tcoursenameh,
      zhouqi: zhouqi
    }
    var courses = app.globalData.courses
    var temp = [item, ]
    for (var i = 0; i < courses.length; i++) {
      temp.push(courses[i])
    }
    courses = temp
    app.globalData.courses = courses
    console.log(courses)

    this.setData({
      addLoading: false
    })

    wx.showToast({
      title: '已添加',
    })

    setTimeout(function() {
      // wx.switchTab({
      //   url: '../index/index',
      // })
      wx.navigateBack({
        
      })
    }, 2000)

    // wx.hideLoading()
  },
  addCourse: function(data) {
    return new Promise((resolve, reject) => {
      const db = wx.cloud.database()
      db.collection('course')
        .add({
          data
        })
        .then(res => {
          resolve(res._id)
        })
        .catch(err => {
          console.log(err)
          reject('获取失败')
        })
    })
  },
  async update() {
    var flag = true
    var course = this.data.course
    const courseid = this.data.courseid
    const coursename = this.data.coursename
    const starttime = this.data.starttime
    const endtime = this.data.endtime
    const coverPath = this.data.coverPath
    const coverName = this.data.coverName
    let cover

    this.setData({
      upLoading: true
    })

    setTimeout(function () { }, 2000)

    // 检查课程名
    flag = this.checkCoursename()
    if (!flag) {
      return
    }

    // 检查课程开始时间
    flag = this.checkStarttime()
    if (!flag) {
      return
    }

    // 检查课程结束时间
    flag = this.checkEndtime()
    if (!flag) {
      return
    }

    // 检查时间
    flag = this.checkTime()
    if (!flag) {
      return
    }

    // 检查是否有封面
    flag = this.checkCover()
    if (!flag) {
      return
    }

    if (coverName != null) { // 更新了图片
      // 获取封面
      cover = await this.uploadCover()
      console.log(cover)
    } else {
      cover = this.data.course.cover
    }

    // 上传数据
    var data = {
      coursename: coursename,
      cover: cover,
      starttime: starttime,
      endtime: endtime
    }

    const db = wx.cloud.database()

    db.collection('course')
      .where({
        _id: courseid
      })
      .update({
        data
      })
      .then(res => {
        console.log(res)
      })
      .catch(err => {
        console.log(err)
      })

    // 更新全局数据
    course._id = courseid
    course.coursename = coursename
    course.tcoursenameh = st.handleCourseName2(coursename)
    course.cover = cover
    course.coverPath = coverPath
    course.starttime = starttime
    course.endtime = endtime
    course.zhouqi = dt.formatTime(starttime) + '-' + dt.formatTime(endtime)

    var courses = app.globalData.courses
    for (var i = 0; i < courses.length; i++) {
      if (courses[i]._id == courseid) {
        courses[i] = course
      }
    }
    app.globalData.courses = courses
    console.log(courses)

    wx.showToast({
      title: '已更新',
    })

    this.setData({
      upLoading: false
    })

  },
  handleDialog: function() {
    return new Promise((resolve, reject) => {
      Dialog({
          title: "确认删除",
          buttons: [{
              text: '取消',
              type: 'cancel'
            },
            {
              text: '确认',
              color: '#e64240',
              type: 'confirm'
            }
          ]
        })
        .then(({
          type,
          hasOpenDataPromise,
          openDataPromise
        }) => {
          // type 可以用于判断具体是哪一个按钮被点击
          console.log('=== dialog with custom buttons ===', `type: ${type}`);

          if (type == 'confirm') {
            resolve(true)
          }

          resolve(false)

          if (hasOpenDataPromise) {
            openDataPromise.then((data) => {
              console.log('成功获取信息', data);
            }).catch((data) => {
              console.log('获取信息失败', data);
            });
          }
        })
        .catch(err => {
          console.log(err)
          reject('获取失败')
        })
    })
  },
  async tapDelete() {
    let confirm = await this.handleDialog()
    console.log(confirm)

    if (confirm) {
      this.setData({
        delLoading: true
      })

      const db = wx.cloud.database()
      const _ = db.command
      const courseid = this.data.courseid
      const openid = app.globalData.openid

      // 删除课程
      db.collection('course')
        .where({
          _id: courseid
        })
        .remove()
        .then(res => {
          console.log(res)
        })
        .catch(err => {
          reject('获取失败')
        })

      // 删除用户信息中的id
      var courses = app.globalData.courses

      var temp = []
      var courseids = []
      for(var i = 0; i < courses.length; i++) {
        if(courses[i]._id == courseid) {
          continue
        }
        temp.push(courses[i])
        courseids.push(courses[i]._id)
      }
      courses = temp
      console.log(courseids)
      console.log(courses)

      db.collection('user')
      .where({
        _openid: openid
      })
      .update({
        data: {
          courses: courseids
        }
      })
      .then(res => {
        console.log(res)
      })
      .catch(err => {
        console.log(err)
      })

      // 更新全局数据
      app.globalData.courses = courses

      this.setData({
        delLoading: false
      })

      wx.showToast({
        title: '已删除',
      })

      setTimeout(function() {
        wx.navigateBack({

        })
      }, 2000)
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const list = options.data.split('/')
    const arg = list[list.length - 1]
    console.log(arg)

    if (arg == '2') {
      const courseid = list[0]
      console.log(courseid)
      this.setData({
        courseid: courseid
      })

      this.init(courseid)
    }

    this.setData({
      arg: arg
    })
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