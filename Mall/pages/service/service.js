// pages/service/service.js
// 获取全局变量
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    fuwuItems: null
  },
  init: function() {
    const fuwuItems = app.globalData.fuwuItems

    this.setData({
      fuwuItems: fuwuItems
    })
  },
  clickFuwu: function (e) {
    const id = e.currentTarget.dataset.id
    console.log(id)

    var qiche_id = "bf01ac72-bd35-4208-bf7d-d325c0e90dd5"

    if (id == qiche_id) {
      wx.navigateTo({
        url: '../qiche/qiche',
      })
    }
    else {
      wx.navigateTo({
        url: '../blank/blank?id=' + id,
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.init()
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