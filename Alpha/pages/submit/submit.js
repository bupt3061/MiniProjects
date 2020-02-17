// pages/submit/submit.js
const app = getApp()

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
    margin: 0
  },
  /**
   * 初始化函数
   */
  init: function() {
    
  },
  /**
   * 页面其他函数
   */
  delete: function(e) {
    const name = e.currentTarget.dataset.name
    var files = this.data.files
    var temp = []

    for(var i = 0; i < files.length; i++) {
      if(files[i].name != name) {
        temp.push(files[i])
      }
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

    for(var i = 0; i < files.length; i++) {
      paths.push(files[i].path)
      if(files[i].path == path) {
        idx = i
      }
    }

    wx.previewImage({
      current: paths[idx],  //当前预览的图片
      urls: paths,  //所有要预览的图片
    })
  },
  async addfile() {
    let filesSrc = await this.chooseFile()
    console.log(filesSrc)

    this.setData({
      files: this.data.files.concat(filesSrc)
    })
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
  descinput: function (e) {
    this.setData({
      desc: e.detail.value,
      desc_len: e.detail.value.length
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var taskid = options.taskid
    var placeholder = null
    var width = app.globalData.screenWidth * 0.8 / 3
    var margin = app.globalData.screenWidth * 0.05
    var screenWidth = app.globalData.screenWidth
    var wtj_tasks = app.globalData.wtj_tasks

    for(var i = 0; i < wtj_tasks.length; i++) {
      if(wtj_tasks[i]._id == taskid) {
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