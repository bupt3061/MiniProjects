// pages/login/login.js

// app 实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    openid: null,
    type: 1,
    basicInfo: null,
    stuStyle: "primary",
    teachStyle: "zan-c-gray-dark",
    avatarStu: null,
    avatarTeach: null,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    loading: false
  },

  /**
   * 页面其他函数
   */
  toNext: function(e) {
    const _this = this

    // 获取userInfo
    console.log('获取basicInfo(授权)', e.detail.userInfo)
    this.setData({
      basicInfo: e.detail.userInfo
    })
    app.globalData.basicInfo = e.detail.userInfo
    app.globalData.type = this.data.type

    // 上传数据
    // var date = new Date()
    // var data = {
    //   gender: this.data.basicInfo.gender,
    //   addr: this.data.basicInfo.city + '/' + this.data.basicInfo.province + '/' + this.data.basicInfo.country,
    //   regtime: date,
    //   title: 1,
    //   contribution: 0.5,
    //   type: this.data.type,
    //   courses: []
    // }

    // const user = wx.cloud.database().collection('user')
    // user.where({
    //     _openid: this.data.openid
    //   })
    //   .get()
    //   .then(res => {
    //     if (res.data.length == 0) {
    //       console.log('上传该用户记录')
    //       user.add({
    //           data: data
    //         })
    //         .then(res => {
    //           console.log('上传成功:', res)
    //           _this.setData({
    //             loading: false
    //           })
    //         })
    //         .catch(err => {
    //           console.log(err)
    //         })
    //     }
    //   })
    //   .catch(err => {
    //     console.log(err)
    //   })

    // 跳转
    wx.navigateTo({
      url: '../loginNext/loginNext',
      success: res => {
        console.log('跳转到loginNext')
        console.log(this.data)
        console.log(app.globalData)
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

    if (app.globalData.openid) {
      this.setData({
        openid: app.globalData.openid
      })
    }

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
      },
      fail: err => {
        console.log(err)
      }
    })

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