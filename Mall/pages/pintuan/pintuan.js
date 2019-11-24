// pages/pintuan/pintuan.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    pintuanItems: [{
        title: null,
        store: null,
        total: null,
        currentPrice: null,
        originalPrice: null,
        thumb: "../../img/zhanwei.png"
      },
      {
        title: null,
        store: null,
        total: null,
        currentPrice: null,
        originalPrice: null,
        thumb: "../../img/zhanwei.png"
      },
      {
        title: null,
        store: null,
        total: null,
        currentPrice: null,
        originalPrice: null,
        thumb: "../../img/zhanwei.png"
      },
      {
        title: null,
        store: null,
        total: null,
        currentPrice: null,
        originalPrice: null,
        thumb: "../../img/zhanwei.png"
      },
    ]
  },
  init: function() {
    const pintuanItems = app.globalData.pintuanItems

    this.setData({
      pintuanItems: pintuanItems
    })
  },
  clickItem: function(e) {
    const id = e.currentTarget.dataset.id
    console.log(id)

    wx.navigateTo({
      url: '../xiangqing-ms/xiangqing-ms?id=' + id,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
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