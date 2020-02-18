// pages/submit/submit.js
const app = getApp()

const dt = require('../../utils/date.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    taskid: null,
    title: null,
    placeholder: null,
    describe: null,
    files: [],
    title_len: 0,
    desc_len: 0,
    screenWidth: 0,
    width: 0,
    margin: 0,
    disabled: true
  },
  /**
   * 初始化函数
   */
  init: function() {

  },
  /**
   * 页面其他函数
   */
  async submit() {
    const openid = app.globalData.openid
    const title = this.data.title
    const taskid = this.data.taskid
    const describe = this.data.describe
    const date = dt.formatTimeFull(new Date())
    const files = this.data.files
    const db = wx.cloud.database()
    const _ = db.command
    var paths = []
    var names = []
    var cloudPaths = []

    // 上传到云端
    wx.showLoading({
      title: '上传中',
    })

    for (var i = 0; i < files.length; i++) {
      paths.push(files[i].path)
      names.push(files[i].name)
    }

    var temp = null
    for (var i = 0; i < paths.length; i++) {
      let temp = await this.uploadFile(names[i], paths[i])
      cloudPaths.push(temp)
    }

    console.log(cloudPaths)

    // 上传到数据库
    const data = {
      _taskid: taskid,
      uploadtime: date,
      title: title,
      describe: describe,
      path: cloudPaths
    }
    const work = db.collection('work')

    work.add({
        data
      })
      .then(res => {
        console.log(res)
        wx.hideLoading()
      })
      .catch(err => {
        console.log(err)
      })
      
    // 更新全局数据
    var wtj_tasks = app.globalData.wtj_tasks
    var temp = []

    for (var i = 0; i < wtj_tasks.length; i++) {
      if (wtj_tasks[i]._id != taskid) {
        temp.push(wtj_tasks[i])
      }
    }

    app.globalData.wtj_tasks = temp

    // 跳转
    wx.redirectTo({
      url: '../success/success',
    })
  },
  uploadFile: function(name, path) {
    return new Promise((resolve, reject) => {
      wx.cloud.uploadFile({
        cloudPath: 'work/' + name,
        filePath: path, // 文件路径
      }).then(res => {
        const fileID = res.fileID
        resolve(fileID)
      }).catch(error => {
        // handle error
        console.log(error)
        reject(error)
      })
    })
  },
  delete: function(e) {
    const name = e.currentTarget.dataset.name
    var files = this.data.files
    var temp = []

    for (var i = 0; i < files.length; i++) {
      if (files[i].name != name) {
        temp.push(files[i])
      }
    }

    if (temp.length == 0) {
      this.setData({
        disabled: true
      })
    }

    this.setData({
      files: temp
    })
  },
  preview: function(e) {
    const path = e.currentTarget.dataset.path
    var files = this.data.files
    var idx = 0
    var paths = []

    for (var i = 0; i < files.length; i++) {
      paths.push(files[i].path)
      if (files[i].path == path) {
        idx = i
      }
    }

    wx.previewImage({
      current: paths[idx], //当前预览的图片
      urls: paths, //所有要预览的图片
    })
  },
  async addfile() {
    let filesSrc = await this.chooseFile()
    console.log(filesSrc)

    if (filesSrc.length != 0) {
      this.setData({
        disabled: false,
        files: this.data.files.concat(filesSrc)
      })
    }
  },
  chooseFile: function() {
    return new Promise((resolve, reject) => {
      wx.chooseMessageFile({
        count: 10,
        type: 'image',
        success(res) {
          // tempFilePath可以作为img标签的src属性显示图片
          resolve(res.tempFiles)
        }
      })
    })
  },
  titleinput: function(e) {
    this.setData({
      title: e.detail.value,
      title_len: e.detail.value.length
    })
  },
  descinput: function(e) {
    this.setData({
      desc: e.detail.value,
      desc_len: e.detail.value.length
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var taskid = options.taskid
    var placeholder = null
    var width = app.globalData.screenWidth * 0.8 / 3
    var margin = app.globalData.screenWidth * 0.05
    var screenWidth = app.globalData.screenWidth
    var wtj_tasks = app.globalData.wtj_tasks

    for (var i = 0; i < wtj_tasks.length; i++) {
      if (wtj_tasks[i]._id == taskid) {
        placeholder = wtj_tasks[i].taskname
      }
    }

    // 存储
    console.log(taskid)
    console.log(placeholder)
    console.log(width)
    console.log(margin)
    console.log(screenWidth)
    this.setData({
      taskid: taskid,
      placeholder: placeholder,
      title: placeholder,
      width: width,
      margin: margin,
      screenWidth: screenWidth
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