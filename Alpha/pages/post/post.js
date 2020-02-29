// pages/post/post.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    hasCanvas: false,
    hidden: false,
    navigationHeight: null,
    screenWidth: null,
    windowHeight: null,
    courseid: null,
    state: null,
    show: false,
    coursename: null
  },
  /**
   * 初始化函数
   */
  async init() {
    let state = await this.createQRCode()
    console.log(state)

    this.setData({
      state: state
    })
  },
  /**
   * 其他函数
   */
  async drawCanvas() {
    const state = this.data.state
    const courseid = this.data.courseid
    const screenWidth = this.data.screenWidth
    const windowHeight = this.data.windowHeight
    const navigationHeight = this.data.navigationHeight
    const texts = [
      "长风破浪会有时",
      "梅花香自苦寒来",
      "劝君惜取少年时",
      "千里之行始于足下",
      "不鸣则已，一鸣惊人",
      "观千剑而后识器"
    ]

    let coursename
    let text
    let qrPath

    // 获取二维码地址
    if (state) {
      qrPath = await this.canvasToTempImage('qrCanvas')
      console.log(qrPath)
    }

    // 获取课程名
    const courses = app.globalData.courses

    for (var i = 0; i < courses.length; i++) {
      if (courses[i]._id == courseid) {
        coursename = courses[i].coursename
        break
      }
    }
    console.log(coursename)

    this.setData({
      coursename: coursename
    })

    // 获取随机文本
    var random = Math.floor(Math.random() * texts.length)
    text = texts[random]
    console.log(text)

    /**
     * 绘制canvas
     */
    // 创建上下文
    const ctx = wx.createCanvasContext('post')
    // 绘制背景矩形
    ctx.setFillStyle('#14d1b5')
    ctx.fillRect(0, 0, screenWidth, windowHeight + navigationHeight)
    // 绘制圆角矩形
    this.roundRectColor(ctx, 24, 48, screenWidth - 48, windowHeight + navigationHeight - 48 - 48, 24)
    // // 绘制下载图标
    // ctx.drawImage('../../img/download.png', screenWidth - 42, 18, 18, 18)
    // 绘制圆
    ctx.beginPath();
    ctx.arc(24, (windowHeight + navigationHeight) * 0.66, 8, 0 * Math.PI / 180, 360 * Math.PI / 180);
    ctx.arc(screenWidth - 24, (windowHeight + navigationHeight) * 0.66, 8, 0 * Math.PI / 180, 360 * Math.PI / 180);
    ctx.fillStyle = '#14d1b5';
    ctx.fill();
    // 绘制虚线
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#e1e1e1';
    ctx.beginPath();
    ctx.setLineDash([5, 10]);
    ctx.moveTo(42, (windowHeight + navigationHeight) * 0.66);
    ctx.lineTo(screenWidth - 24 - 16, (windowHeight + navigationHeight) * 0.66);
    ctx.stroke();
    // 绘制二维码
    ctx.drawImage(qrPath, screenWidth * 0.2, screenWidth * 0.2 + 24, screenWidth * 0.6, screenWidth * 0.6)
    // 绘制文本
    ctx.font = '18px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#000';
    ctx.fillText(coursename, screenWidth / 2, (windowHeight + navigationHeight) * 0.33 + (screenWidth * 0.4 + 8), screenWidth * 0.6);
    // 绘制文本
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#000';
    ctx.fillText(text, screenWidth / 2, (windowHeight + navigationHeight) * 0.8, screenWidth * 0.6);
    ctx.draw()

    this.setData({
      hidden: true,
      hasCanvas: true
    })
  },
  roundRectColor: function(context, x, y, w, h, r) { //绘制圆角矩形（纯色填充）
    context.save();
    context.setFillStyle("white");
    context.setStrokeStyle('white')
    context.setLineJoin('round'); //交点设置成圆角
    context.setLineWidth(r);
    context.strokeRect(x + r / 2, y + r / 2, w - r, h - r);
    context.fillRect(x + r, y + r, w - r * 2, h - r * 2);
    context.stroke();
    context.closePath();
  },
  createQRCode: function() {
    return new Promise((resolve, reject) => {
      const courseid = this.data.courseid
      const screenWidth = this.data.screenWidth
      const windowHeight = this.data.windowHeight
      const navigationHeight = this.data.navigationHeight
      const QRCode = require('weapp-qrcode')

      // 绘制二维码
      QRCode({
        width: screenWidth * 0.6,
        height: screenWidth * 0.6,
        canvasId: 'qrCanvas',
        text: courseid
      })

      resolve(true)
    })
  },
  canvasToTempImage: function(canvasId) {
    return new Promise((resolve, reject) => {
      //把当前画布指定区域的内容导出生成指定大小的图片，并返回文件路径。
      wx.canvasToTempFilePath({
        canvasId: canvasId,
        success: function(res) {
          var tempFilePath = res.tempFilePath;
          resolve(tempFilePath)
        },
        fail: function(res) {
          console.log(res);
        }
      });
    })
  },
  async download() {
    const that = this
    const coursename = this.data.coursename
    let postUrl

    postUrl = await this.canvasToTempImage("post")
    console.log(postUrl)
    console.log(postUrl + '/down?filename=' + encodeURI(coursename))

    wx.saveImageToPhotosAlbum({
      filePath: postUrl,
      success: res => {
        console.log(res)
        that.setData({
          show: true
        })

        setTimeout(function() {
          that.setData({
            show: false
          })
        }, 1000)
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const courseid = options.courseid
    const screenWidth = app.globalData.screenWidth
    const windowHeight = app.globalData.windowHeight
    const navigationHeight = app.globalData.navigationHeight

    this.setData({
      screenWidth: screenWidth,
      windowHeight: windowHeight,
      courseid: courseid,
      navigationHeight: navigationHeight
    })

    this.init()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    setTimeout(this.drawCanvas, 1000)
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