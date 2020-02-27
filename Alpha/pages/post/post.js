// pages/post/post.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    navigationHeight: null,
    screenWidth: null,
    windowHeight: null,
    courseid: null
  },
  /**
   * 初始化函数
   */
  async init() {
    const courseid = this.data.courseid
    const screenWidth = this.data.screenWidth
    const windowHeight = this.data.windowHeight
    const navigationHeight = this.data.navigationHeight
    // 绘制二维码
    const QRCode = require('weapp-qrcode')

    // // 获取课程名
    const courses = app.globalData.courses

    var coursename = null
    for(var i = 0; i < courses.length; i++) {
      if(courses[i]._id == courseid) {
        coursename = courses[i].coursename
        break
      }
    }
    console.log(coursename)

    // 绘制背景矩形
    const ctx = wx.createCanvasContext('post')
    ctx.setFillStyle('#14d1b5')
    // 绘制圆角矩形
    ctx.fillRect(0, 0, screenWidth, windowHeight + navigationHeight)
    this.roundRectColor(ctx, 24, 24, screenWidth - 48, windowHeight + navigationHeight - 48, 24)
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
    // 绘制文本
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#000';
    ctx.fillText(coursename, screenWidth / 2, (windowHeight + navigationHeight) * 0.66 - 32, screenWidth * 0.6);
    ctx.draw()

    QRCode({
      width: screenWidth * 0.6,
      height: screenWidth * 0.6,
      canvasId: 'qrcode',
      text: courseid
    })
  },
  /**
   * 其他函数
   */
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