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
    interval1: null,
    currentPrice: null,
    originalPrice: null,
    title: null,
    store: null,
    total: null,
    userItems: null,
    id: 4
  },
  setInfo: function (id) {
    var data = null
    const pintuanItems = app.globalData.pintuanItems

    for (var i = 0; i < pintuanItems.length; i++) {
      if (pintuanItems[i]._id == id) {
        data = pintuanItems[i]
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
  async init() {
    const _this = this

    var userItems = await this.getUserItems()
    for (var i = 0; i < userItems.length; i++) {
      userItems[i].avatarUrl = await this.getTempFileURL(userItems[i].avatarUrl)
    }

    console.log(userItems)

    var length = userItems.length
    var id = this.data.id

    var interval1 = setInterval(function () {
      if (id == length - 1) {
        id = 0
      }
      else {
        id++
      }
      _this.setData({
        id: id
      })
    }, 1000)

    this.setData({
      userItems: userItems,
      interval1: interval1
    })
  },
  getUserItems: function () {
    // 获取swiperItems
    return new Promise((resolve, reject) => {
      const db = wx.cloud.database({
        env: "test-m3m5d"
      })
      db.collection('mptuser')
        .get()
        .then(res => {
          resolve(res.data)
        })
        .catch(err => {
          console.log(err)
          reject(err)
        })
    })
  },
  getTempFileURL: function (value) {
    // 用fileID换取临时文件地址
    return new Promise((resolve, reject) => {
      wx.cloud.getTempFileURL({
        fileList: [{
          fileID: value,
          maxAge: 60 * 60, // one hour
        }]
      }).then(res => {
        // get temp file URL
        resolve(res.fileList[0].tempFileURL)
      }).catch(err => {
        console.log(err)
        reject(err)
      })
    })
  },
  toStore: function () {
    wx.navigateTo({
      url: '../blank/blank',
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const id = options.id

    this.setInfo(id)
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
    clearInterval(this.data.interval)
    clearInterval(this.data.interval1)
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    clearInterval(this.data.interval)
    clearInterval(this.data.interval1)
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