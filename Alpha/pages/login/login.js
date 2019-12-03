// pages/login/login.js

// app 实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    type: 1,
    stuStyle: "primary",
    teachStyle: "zan-c-gray-dark",
    avatarStu: null,
    avatarTeach: null,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
  },
  /**
   * 初始化函数
   */
  async init() {
    let res = await this.getAvatars()
    console.log(res)
  },
  getAvatars: function() {
    return new Promise((resolve, reject) => {
      // 从云端下载头像
      wx.cloud.getTempFileURL({
        fileList: app.globalData.avatarIDs,
        success: res => {
          var avatarStu = res.fileList[0].tempFileURL
          var avatarTeach = res.fileList[1].tempFileURL

          this.setData({
            avatarStu,
            avatarTeach
          })

          resolve('success')
        },
        fail: err => {
          console.log(err)
          reject('faile')
        }
      })
    })
  },
  /**
   * 页面其他函数
   */
  toNext: function(e) {
    // 跳转到loginNext
    wx.navigateTo({
      url: '../loginNext/loginNext?type=' + this.data.type,
      success: res => {
        console.log('跳转到loginNext')
      },
      fial: err => {
        console.log(err)
      }
    })
  },
  clickStu: function() {
    // 选择学生身份
    this.setData({
      type: 1,
      stuStyle: "primary",
      teachStyle: "zan-c-gray-dark"
    })
    console.log(this.data.type)
  },
  clickTeach: function() {
    // 选择教师身份
    this.setData({
      type: 2,
      stuStyle: "zan-c-gray-dark",
      teachStyle: "primary"
    })
    console.log(this.data.type)
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
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