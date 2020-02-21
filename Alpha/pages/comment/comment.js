// pages/comment/comment.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    workid: null,
    standard: null,
    standardKeys: null,
    scores: [],
    min: 0,
    max: 10,
    step: 0.5,
    selectedColor: "#14d1b5",
    blockSize: 24
  },
  /**
   * 页面其他函数
   */
  changeValue: function(e) {
    const value = e.detail.value
    const idx = e.target.dataset.index

    console.log('value', value)
    console.log('index', idx)

    // 更新数据
    this.data.scores[idx] = value
  },
  comment: function() {
    
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const workid = options.workid
    const standard = app.globalData.standard
    const standardKeys = app.globalData.standardKeys

    console.log('workid', workid)
    console.log('standard', standard)
    console.log('standardKeys', standardKeys)

    this.setData({
      workid: workid,
      standard: standard,
      standardKeys: standardKeys
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