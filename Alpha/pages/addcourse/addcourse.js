// pages/addcourse/addcourse.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    notUse: ["hours", "minutes", "seconds"],
    format: "YYYY-MM-DD",
    coursename: null,
    starttime: null,
    endtime: null,
    coverPath: null,
    coverName: null,
    cover: null,
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
    console.log('endtime', starttime)

    this.setData({
      endtime: endtime
    })
  },
  preview: function (e) {
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
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const arg = options.arg
    console.log(arg)
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