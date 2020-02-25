// pages/loginNext/loginNext.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    show: false,
    cancelWithMask: true,
    actions: [{
      name: '学生',
      loading: false
    }, {
      name: '老师',
      loading: false
    }],
    cancelText: '取消',
    name: null,
    org: null,
    phone: null,
    type: null,
    nBorderColor: "#f1f1f1",
    tBorderColor: "#f1f1f1",
    oBorderColor: "#f1f1f1",
    sBorderColor: "#f1f1f1",
    content: "请选择",
    windowHeight: null,
    windowWidth: null,
    showPicker: false,
    color: "#808080"
  },
  /**
   * 初始化函数
   */
  init: function() {
    const res = wx.getSystemInfoSync()
    
    this.setData({
      windowWidth: res.windowWidth,
      windowHeight: res.windowHeight
    })
  },
  /**
   * 其他函数
   */
  openActionSheet() {
    this.setData({
      'show': true
    });
  },
  closeActionSheet() {
    this.setData({
      'show': false
    });
  },
  handleActionClick({ detail }) {
    // 获取被点击的按钮 index
    const { index } = detail;
    var type = null
    var content = null
    var color = "black"

    if(index == 0) {
      type = 1
      content = "学生"
    } else if(index == 1) {
      type = 2
      content = "老师"
    }

    this.setData({
      show: false,
      type: type,
      content: content,
      color: color
    })

    console.log(index)
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
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