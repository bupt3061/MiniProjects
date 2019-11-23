// pages/mine/mine.js
//获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    motto: 'Hello World',
    userInfo: {
      avatarUrl: "../../img/zhanwei.png"
    },
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    fuwuItems: [{
        icon: "../../img/kefu.png",
        name: "客服",
        url: null
      },
      {
        icon: "../../img/jiankang.png",
        name: "家庭健康",
        url: null,
      },
      {
        icon: "../../img/weixiu.png",
        name: "家电维修",
        url: null
      },
      {
        icon: "../../img/yuezican.png",
        name: "营养餐",
        url: null
      },
      {
        icon: "../../img/qiche.png",
        name: "汽车服务",
        url: null
      },
      {
        icon: "../../img/youhui.png",
        name: "优惠",
        url: null
      },
      {
        icon: "../../img/quanqiu.png",
        name: "全球采购",
        url: null
      },
      {
        icon: "../../img/tongcheng.png",
        name: "同城服务",
        url: null
      },
      {
        icon: "../../img/yundong.png",
        name: "运动健身",
        url: null
      },
    ],
    dingdanItems: [{
        icon: "../../img/daifukuan.png",
        name: "待付款",
        url: null
      },
      {
        icon: "../../img/daishouhuo.png",
        name: "待收货",
        url: null,
      },
      {
        icon: "../../img/yiwancheng.png",
        name: "已完成",
        url: null
      },
      {
        icon: "../../img/tuihuanhuo.png",
        name: "退换货",
        url: null
      },
    ]
  },
  //事件处理函数
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  clickFuwu: function(e) {
    console.log(e.currentTarget.dataset.url)

    wx.navigateTo({
      url: '../blank/blank',
    })
  },
  toDingdan: function() {
    wx.navigateTo({
      url: '../blank/blank',
    })
  },
  toFuwu: function() {
    wx.navigateTo({
      url: '../blank/blank',
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
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