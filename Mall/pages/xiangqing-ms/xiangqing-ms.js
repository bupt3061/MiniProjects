// pages/xiangqing-ms/xiangqing-ms.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    autoplay: true,
    circular: true,
    indicatorDots: true,
    indicatorColor: "rgba(255, 255, 255, .3)",
    indicatorActiveColor: "#ffffff",
    swiperItems: [{
        img: "../../img/sp1.jpg"
      },
      {
        img: "../../img/sp2.jpg"
      },
      {
        img: "../../img/sp3.jpg"
      },
      {
        img: "../../img/sp4.jpg"
      },
      {
        img: "../../img/sp5.jpg"
      }
    ],
    min: 59,
    sec: 49,
    interval: null,
    currentPrice: null,
    originalPrice: null,
    title: null,
    store: null,
    total: null
  },
  setTime: function() {
    const _this = this
    var sec = this.data.sec
    var min = this.data.min

    const interval = setInterval(function () {
      sec--
      if (sec == 0) {
        sec = 59
        min--
        if (min == 0) {
          clearInterval(_this.data.interval)
        }
      }
      _this.setData({
        sec: sec,
        min: min
      })
    }, 1000)

    this.setData({
      interval: interval
    })
  },
  init: function(id) {
    var data = null
    const miaoshaItems = app.globalData.miaoshaItems

    for(var i = 0; i < miaoshaItems.length; i++) {
      if(miaoshaItems[i]._id == id) {
        data = miaoshaItems[i]
      }
    }

    this.setData({
      currentPrice: data.currentPrice,
      originalPrice: data.originalPrice,
      title: data.title,
      store: data.store,
      total: data.total
    })
  },
  toStore: function() {
    wx.navigateTo({
      url: '../blank/blank',
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const id = options.id

    this.setTime()
    this.init(id)
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
    clearInterval(this.data.interval)
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    clearInterval(this.data.interval)
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