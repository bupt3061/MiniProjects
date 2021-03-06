// pages/mine/mine.js
const app = getApp()
var QR = require("../../utils/qrcode.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    nickname: null,
    avtarUrl: null,
    rank: null,
    canvasHidden: false, //默认不让canvas二维码隐藏，否则不能生成二维码
    imagePath: "", //弹出框二维码显示图片地址
    inputValue: '',
    windowHeight: 0,
    windowWidth: 0,
    initUrl: 'ILoveKangqianqian'
  },
  /**
   * 页面初始函数
   */
  async init() {
    const openid = app.globalData.openid
    const type = app.globalData.type
    let userInfo = app.globalData.userInfo

    if (userInfo == null) {
      userInfo = await this.getUserInfo(openid)
    }

    var nickname = userInfo.nickname
    var avatarUrl = userInfo.avatarUrl
    var ctb = userInfo.contribution
    var rank = this.getRank(ctb)

    console.log(userInfo)
    console.log(nickname)
    console.log(avatarUrl)
    console.log(rank)

    this.setData({
      nickname: nickname,
      avatarUrl: avatarUrl,
      rank: rank,
      type: type
    })
  },
  /**
   * 其他函数
   */
  getUserInfo: function (openid) {
    return new Promise((resolve, reject) => {
      const db = wx.cloud.database()

      db.collection('user')
        .where({
          _openid: openid
        })
        .get()
        .then(res => {
          const data = res.data
          resolve(data)
        })
        .catch(err => {
          console.log(err)
          reject("获取失败")
        })
    })
  },
  toCollect: function() {
    app.globalData.wlArg = '2'
    
    wx.navigateTo({
      url: '../worklist/worklist',
    })
  },
  toCourse: function() {
    wx.navigateTo({
      url: '../course/course',
    })
  },
  toStore: function() {
    wx.navigateTo({
      url: '../store/store',
    })
  },
  getRank(ctb) {
    var rank = '../../img/'

    if (ctb <= 20) {
      rank += 'v1.png'
    } else if (ctb <= 100) {
      rank += 'v2.png'
    } else {
      rank += 'v3.png'
    }

    return rank
  },
  // async init() {
  //   var initUrl = this.data.initUrl
  //   let state = await this.createQrCode(initUrl, "qrCanvas", 60, 60)
  //   if (state) {
  //     let res = await this.canvasToTempImage()
  //     var qrPath = res
  //   }
  //   console.log(qrPath)

  //   try {
  //     const info = wx.getSystemInfoSync()
  //     var windowWidth = info.windowWidth
  //     var windowHeight = info.windowHeight
  //     this.setData({
  //       windowHeight: windowHeight,
  //       windowWidth: windowWidth
  //     })
  //   } catch (e) {
  //     // Do something when catch error
  //   }

  //   const ctx = wx.createCanvasContext('myCanvas')
  //   ctx.drawImage('../../img/post.jpg', 0, 0, windowWidth, windowHeight)
  //   ctx.rect(windowWidth - 85, windowHeight - 105, 60, 60)
  //   ctx.setFillStyle('red')
  //   ctx.fill()
  //   ctx.drawImage(qrPath, windowWidth - 85, windowHeight - 105, 60, 60)
  //   ctx.draw()
  // },
  // createQrCode: function (url, canvasId, cavW, cavH) {
  //   return new Promise((resolve, reject) => {
  //     //调用插件中的draw方法，绘制二维码图片
  //     QR.api.draw(url, canvasId, cavW, cavH);
  //     resolve(true)
  //   })
  // },
  /**
   * 获取临时缓存照片路径，存入data中
   */
  // canvasToTempImage: function () {
  //   return new Promise((resolve, reject) => {
  //     //把当前画布指定区域的内容导出生成指定大小的图片，并返回文件路径。
  //     wx.canvasToTempFilePath({
  //       canvasId: 'qrCanvas',
  //       success: function (res) {
  //         var tempFilePath = res.tempFilePath;
  //         resolve(tempFilePath)
  //       },
  //       fail: function (res) {
  //         console.log(res);
  //       }
  //     });
  //   })
  // },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('test, onLoad执行了')
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
    console.log('test, onLoad执行了')
    this.init()
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