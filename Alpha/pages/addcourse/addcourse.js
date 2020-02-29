// pages/addcourse/addcourse.js
const st = require('../../utils/string.js')
const app = getApp()

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
    arg: null,
    notUse: ["hours", "minutes", "seconds"],
    format: "YYYY-MM-DD",
    coursename: null,
    starttime: null,
    endtime: null,
    coverPath: null,
    coverName: null,
    hasCover: false
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
    const timestr = year + '/' + month + '/' + day + " 00:00:00"
    const endtime = new Date(timestr)
    console.log('date', date)
    console.log('endtime', endtime)

    this.setData({
      endtime: endtime
    })
  },
  preview: function (e) {
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
  chooseImg: function () {
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
      hasCover: false
    })
  },
  checkCoursename: function() {
    const coursename = this.data.coursename

    if(coursename == '' || coursename == null) {
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
  checkStarttime: function () {
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
  checkEndtime: function () {
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
  uploadCover: function() {
    return new Promise((resolve, reject) => {
      const coursename = this.data.coursename
      const coverPath = this.data.coverPath
      wx.cloud.uploadFile({
        cloudPath: 'courseCover/' + coursename,
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
    const now = new Date()
    const coursename = this.data.coursename
    const starttime = this.data.starttime
    const endtime = this.data.endtime
    let cover

    // 检查课程名
    flag = this.checkCoursename()
    if(!flag) {
      return 
    }

    // 检查课程开始时间
    flag = this.checkStarttime()
    if(!flag) {
      return
    }

    // 检查课程结束时间
    flag = this.checkEndtime()
    if(!flag) {
      return
    }

    // 检查是否有封面
    flag = this.data.hasCover
    if(!flag) {
      return
    }

    // 获取封面
    cover = await this.uploadCover()
    console.log(cover)

    // 上传数据
    wx.showLoading({
      title: '上传中',
    })

    const data = {
      coursename: coursename,
      cover: cover,
      starttime: starttime,
      endtime: endtime,
      cretime: now,
    } 

    const db = wx.cloud.database()
    db.collection('course')
    .add({
      data
    })
    .then(res => {
      console.log(res)
    })
    .catch(err => {
      console.log(err)
    })

    // 更新全局数据
    const tcoursenameh = st.handleCourseName2(coursename)
    const zhouqi = dt.formatTime(starttime) + '-' + dt.formatTime(endtime)
    const item = {
      coursename: coursename,
      cover: cover,
      coverPath: coverPath,
      cretime: now,
      starttime:starttime,
      endtime: endtime,
      tcoursenameh: tcoursenameh,
      zhouqi: zhouqi
    }
    var courses = app.globalData.courses
    courses = courses.unshift(item)
    app.globalData.courses = courses
    console.log(courses)

    wx.hideLoading()
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const arg = options.arg
    console.log(arg)

    this.setData({
      arg: arg
    })
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