// pages/store/store.js
//获取应用实例
const app = getApp()
const templatesJS = require("../../templates/templates.js")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    windowHeight: null,
    windowWidth: null,
    activeNav: "fuzhaung",
    navList: [{
        name: "服装",
        cat: "fuzhuang",
        active: true
      },
      {
        name: "家电",
        cat: "jiadian",
        active: false
      },
      {
        name: "餐饮",
        cat: "canyin",
        active: false
      },
      {
        name: "娱乐",
        cat: "yule",
        active: false
      },
      {
        name: "其他",
        cat: "other",
        active: false
      }
    ],
    storeItems: null,
    showItems: null,
  },
  async init() {
    wx.showLoading({
      title: '加载中',
      icon: 'loading',
      duration: 10000
    })

    // 获取店铺列表
    const storeItems = await this.getStoreItems()
    var showItems = []

    for (var i = 0; i < storeItems.length; i++) {
      storeItems[i].thumb = await this.getTempFileURL(storeItems[i].thumb)
      if(storeItems[i].cat == "fuzhuang") {
        showItems.push(storeItems[i])
      }
    }

    this.setData({
      storeItems: storeItems,
      showItems: showItems,
    })

    wx.hideLoading()
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
  getStoreItems: function() {
    return new Promise((resolve, reject) => {
      const db = wx.cloud.database({
        env: "test-m3m5d"
      })
      db.collection('mstore')
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
  setHeight: function() {
    const windowHeight = app.globalData.windowHeight
    const windowWidth = app.globalData.screenWidth

    this.setData({
      windowHeight: windowHeight,
      windowWidth: windowWidth
    })
  },
  clickStore: function(e) {
    console.log(e.currentTarget.dataset.home)

    wx.navigateTo({
      url: '../blank/blank?' + e.currentTarget.dataset.home,
    })
  },
  clickSearch: function() {
    templatesJS.clickSearch()
  },
  clickNav: function(e) {
    const select = e.currentTarget.dataset.cat
    const navList = this.data.navList

    if(select == this.data.activeNav) {
      return
    }

    for (var i = 0; i < navList.length; i++) {
      if (navList[i].cat == select) {
        navList[i].active = true
      } else {
        navList[i].active = false
      }
    }

    const storeItems = this.data.storeItems
    var showItems = []
    for(var i = 0; i < storeItems.length; i++) {
      if(storeItems[i].cat == select) {
        showItems.push(storeItems[i])
      }
    }

    this.setData({
      navList: navList,
      activeNav: select,
      showItems: showItems
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setHeight()
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