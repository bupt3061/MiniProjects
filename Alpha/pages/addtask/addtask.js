// pages/addtask/addtask.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    stepper: {
      // 当前 stepper 数字
      stepper: 0,
      // 最小可到的数字
      min: 0,
      // 最大可到的数字
      max: 1,
      // 尺寸
      size: 'small'
    },
    taskname: null,
    uploadstart: null,
    uploadend: null,
    evaluatestart: null,
    evaluateend: null,
    startUpPlaceHolder: "选择时间",
    endUpPlaceHolder: "选择时间",
    startEvalPlaceHolder: "选择时间",
    endEvalPlaceHolder: "选择时间"
  },
  /**
   * 初始化函数
   */

  /**
   * 其他函数
   */
  inputTaskname: function(e) {
    const taskname = e.detail.value
    console.log("taskname", taskname)

    this.setData({
      taskname: taskname
    })
  },
  startUpTime: function(e) {
    const date = e.detail.value
    const year = date[0]
    const month = date[1]
    const day = date[2]
    const hour = date[3]
    const min = date[4]
    const sec = date[5]
    const timestr = year + '/' + month + '/' + day + " " + hour + ":" + min + ":" + sec
    const uploadstart = new Date(timestr)
    console.log('date', date)
    console.log('uploadstart', uploadstart)

    this.setData({
      uploadstart: uploadstart
    })
  },
  endUpTime: function (e) {
    const date = e.detail.value
    const year = date[0]
    const month = date[1]
    const day = date[2]
    const hour = date[3]
    const min = date[4]
    const sec = date[5]
    const timestr = year + '/' + month + '/' + day + " " + hour + ":" + min + ":" + sec
    const uploadend = new Date(timestr)
    console.log('date', date)
    console.log('uploadend', uploadend)

    this.setData({
      uploadend: uploadend
    })
  },
  startEvalTime: function (e) {
    const date = e.detail.value
    const year = date[0]
    const month = date[1]
    const day = date[2]
    const hour = date[3]
    const min = date[4]
    const sec = date[5]
    const timestr = year + '/' + month + '/' + day + " " + hour + ":" + min + ":" + sec
    const evaluatestart = new Date(timestr)
    console.log('date', date)
    console.log('evaluatestart', evaluatestart)

    this.setData({
      evaluatestart: evaluatestart
    })
  },
  endEvalTime: function (e) {
    const date = e.detail.value
    const year = date[0]
    const month = date[1]
    const day = date[2]
    const hour = date[3]
    const min = date[4]
    const sec = date[5]
    const timestr = year + '/' + month + '/' + day + " " + hour + ":" + min + ":" + sec
    const evaluateend = new Date(timestr)
    console.log('date', date)
    console.log('evaluateend', evaluateend)

    this.setData({
      evaluateend: evaluateend
    })
  },
  handleStepper: function(e) {
    console.log(e)
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const list = options.data.split('/')
    const courseid = list[0]
    const arg = list[1]

    this.setData({
      courseid: courseid,
      arg: arg
    })
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