// pages/success/success.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    wtj_tasks: null,
    wtjNum: 0
  },
  /**
   * 其他函数
   */
  clickwtj: function (e) {
    const taskid = e.currentTarget.dataset.taskid
    console.log(taskid)

    wx.redirectTo({
      url: '../submit/submit?taskid=' + taskid,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var wtj_tasks = app.globalData.wtj_tasks

    this.setData({
      wtj_tasks: wtj_tasks,
      wtjNum: wtj_tasks.length
    })
    console.log(wtj_tasks)
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