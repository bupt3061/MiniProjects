// pages/mine/mine.js

var QR = require("../../utils/qrcode.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    canvasHidden: false, //默认不让canvas二维码隐藏，否则不能生成二维码
    imagePath: "", //弹出框二维码显示图片地址
    inputValue: '',
    windowHeight: 0,
    windowWidth: 0,
    initUrl: 'ILoveKangqianqian'
  },
  async init() {
    var initUrl = this.data.initUrl
    let state = await this.createQrCode(initUrl, "qrCanvas", 60, 60)
    if (state) {
      let res = await this.canvasToTempImage()
      var qrPath = res
    }
    console.log(qrPath)

    try {
      const info = wx.getSystemInfoSync()
      var windowWidth = info.windowWidth
      var windowHeight = info.windowHeight
      this.setData({
        windowHeight: windowHeight,
        windowWidth: windowWidth
      })
    } catch (e) {
      // Do something when catch error
    }

    const ctx = wx.createCanvasContext('myCanvas')
    ctx.drawImage('../../img/post.jpg', 0, 0, windowWidth, windowHeight)
    ctx.rect(windowWidth - 85, windowHeight - 105, 60, 60)
    ctx.setFillStyle('red')
    ctx.fill()
    ctx.drawImage(qrPath, windowWidth - 85, windowHeight - 105, 60, 60)
    ctx.draw()
  },
  createQrCode: function (url, canvasId, cavW, cavH) {
    return new Promise((resolve, reject) => {
      //调用插件中的draw方法，绘制二维码图片
      QR.api.draw(url, canvasId, cavW, cavH);
      resolve(true)
    })
  },
  /**
   * 获取临时缓存照片路径，存入data中
   */
  canvasToTempImage: function () {
    return new Promise((resolve, reject) => {
      //把当前画布指定区域的内容导出生成指定大小的图片，并返回文件路径。
      wx.canvasToTempFilePath({
        canvasId: 'qrCanvas',
        success: function (res) {
          var tempFilePath = res.tempFilePath;
          resolve(tempFilePath)
        },
        fail: function (res) {
          console.log(res);
        }
      });
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.init()
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