//index.js
//获取应用实例
const app = getApp()
const templatesJS = require("../../templates/templates.js")

Page({
  data: {
    autoplay: true,
    circular: true,
    indicatorDots: true,
    indicatorColor: "rgba(255, 255, 255, .3)",
    indicatorActiveColor: "#ffffff",
    swiperHeight: null,
    swiperItems: null,
    itemWidth: null,
    sItemWidth: null,
    miaoshaItems: [{
        thumb: "../../img/zhanwei.png"
      },
      {
        thumb: "../../img/zhanwei.png"
      },
      {
        thumb: "../../img/zhanwei.png"
      },
    ],
    pintuanItems: [{
        thumb: "../../img/zhanwei.png"
      },
      {
        thumb: "../../img/zhanwei.png"
      },
      {
        thumb: "../../img/zhanwei.png"
      },
    ],
    fuwuItems: [{
        cover: "../../img/zhanwei.png"
      },
      {
        cover: "../../img/zhanwei.png"
      },
      {
        cover: "../../img/zhanwei.png"
      },
    ]
  },
  //事件处理函数
  async init() {
    wx.showLoading({
      title: '加载中',
      icon: 'loading',
      duration: 10000
    })

    // 获取尺寸
    this.getSysInfo()

    // 获取并处理swiperItems
    var swiperItems = await this.getSwiperItems()
    for (var i = 0; i < swiperItems.length; i++) {
      swiperItems[i].path = await this.getTempFileURL(swiperItems[i].path)
    }

    // 获取miaoshaItems
    var miaoshaItems = await this.getMiaoshaItems()
    for (var i = 0; i < miaoshaItems.length; i++) {
      miaoshaItems[i].thumb = await this.getTempFileURL(miaoshaItems[i].thumb)
    }
    app.globalData.miaoshaItems = miaoshaItems

    // 获取pintuanItems
    var pintuanItems = await this.getPintuanItems()
    for (var i = 0; i < pintuanItems.length; i++) {
      pintuanItems[i].thumb = await this.getTempFileURL(pintuanItems[i].thumb)
    }
    app.globalData.pintuanItems = pintuanItems 

    // 获取fuwuItems
    var fuwuItems = await this.getFuwuItems()
    for (var i = 0; i < fuwuItems.length; i++) {
      fuwuItems[i].cover = await this.getTempFileURL(fuwuItems[i].cover)
    }
    app.globalData.fuwuItems = fuwuItems

    this.setData({
      swiperItems: swiperItems,
      miaoshaItems: miaoshaItems.slice(0, 3),
      pintuanItems: pintuanItems.slice(0, 3),
      fuwuItems: fuwuItems.slice(0, 3)
    })

    wx.hideLoading()
  },
  getMiaoshaItems: function() {
    // 获取swiperItems
    return new Promise((resolve, reject) => {
      const db = wx.cloud.database({
        env: "test-m3m5d"
      })
      db.collection('mmiaosha')
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
  getPintuanItems: function() {
    // 获取swiperItems
    return new Promise((resolve, reject) => {
      const db = wx.cloud.database({
        env: "test-m3m5d"
      })
      db.collection('mpintuan')
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
  getFuwuItems: function() {
    return new Promise((resolve, reject) => {
      const db = wx.cloud.database({
        env: "test-m3m5d"
      })
      db.collection('mfuwu')
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
  getSwiperItems: function() {
    // 获取swiperItems
    return new Promise((resolve, reject) => {
      const db = wx.cloud.database({
        env: "test-m3m5d"
      })
      db.collection('mbanner').limit(5)
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
  getTempFileURL: function(value) {
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
  getSysInfo: function() {
    var res = wx.getSystemInfoSync()
    var screenHeight = res.screenHeight
    var screenWidth = res.screenWidth
    var windowHeight = res.windowHeight

    app.globalData.screenHeight = screenHeight
    app.globalData.screenWidth = screenWidth
    app.globalData.windowHeight = windowHeight

    this.setData({
      swiperHeight: screenHeight * 0.2,
      itemWidth: (screenWidth - 32) / 3,
      sItemWidth: (screenWidth - 24) / 2
    })
  },
  clickSearch: function() {
    templatesJS.clickSearch()
  },
  clickSwiperItem: function(e) {
    var index = e.currentTarget.dataset.index
    wx.navigateTo({
      url: this.data.swiperItems[index].url,
      success: res => {
        console.log(res)
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  clickMiaoshaItem: function(e) {
    console.log(e.currentTarget.dataset.detail)
  },
  clickPintuanItem: function(e) {
    console.log(e.currentTarget.dataset.detail)
  },
  clickFuwu: function(e) {
    console.log(e.currentTarget.dataset.detail)
  },
  toMiaosha: function() {
    wx.navigateTo({
      url: '../miaosha/miaosha',
    })
  },
  toFuwu: function() {
    wx.switchTab({
      url: '../service/service',
    })
  },
  toPintuan: function() {
    wx.navigateTo({
      url: '../pintuan/pintuan',
    })
  },
  onLoad: function() {
    this.init()
  }
})