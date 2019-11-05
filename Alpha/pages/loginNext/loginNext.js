// pages/loginNext/loginNext.js

// 外部js
const stg = require('../../utils/storage.js')

const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    openid: null,
    type: null,
    name: null,
    phone: null,
    organization: null,
    courses: [],
    loading: false
  },
  async init() {

    let openid = await this.getOpenid()
    let type = await this.getType()
    var name = stg.getStorage('name')
    var phone = stg.getStorage('phone')
    var organization = stg.getStorage('organization')

    if(!name && !phone && !organization) {
      name = null
      phone = null
      organization = null
    }

    app.globalData.openid = openid
    this.setData({
      openid: openid,
      type: type,
      name: name,
      phone: phone,
      organization: organization
    })

  },
  getOpenid: function() {
    return new Promise((resolve, reject) => {
      // 获取openid
      wx.cloud.callFunction({
        name: 'getInfo',
        data: {},
        success: res => {
          resolve(res.result.OPENID)
        },
        fail: err => {
          console.log(err)
          reject(err)
        }
      })
    })
  },
  getType: function() {
    return new Promise((resolve, reject) => {
      const app = getApp()
      var type = app.globalData.type
      if (type) {
        resolve(type)
      }
    })
  },
  confirm: function(e) {
    const _this = this

    // 显示加载
    this.setData({
      loading: true
    })

    // 获取basicInfo
    var basicInfo = e.detail.userInfo
    console.log('获取basicInfo(授权)', basicInfo)
    app.globalData.basicInfo = e.detail.userInfo

    // 上传数据
    var data = {
      addr: basicInfo.city + '/' + basicInfo.province + '/' + basicInfo.country,
      gender: basicInfo.gender,
      type: this.data.type,
      courses: this.data.courses,
      phone: this.data.phone,
      name: this.data.name,
      organization: this.data.organization,
      regtime: new Date(),
      title: 1,
      contribution: 0.5
    }

    const user = wx.cloud.database().collection('user')
    user.where({
        _openid: this.data.openid
      })
      .get()
      .then(res => {
        if (res.data.length == 0) {
          console.log('上传该用户记录')
          user.add({
              data: data
            })
            .then(res => {
              console.log('上传成功:', res)
              _this.setData({
                loading: false
              })
              // 跳转到首页
              wx.switchTab({
                url: '../index/index',
              })
            })
            .catch(err => {
              console.log(err)
            })
        }
      })
      .catch(err => {
        console.log(err)
      })

  },
  goBack: function() {
    // 缓存
    stg.setStorage('name', this.data.name)
    stg.setStorage('phone', this.data.phone)
    stg.setStorage('organization', this.data.organization)

    // 返回上一届面
    wx.navigateBack({
      delta: 1
    })
  },
  handleName: function(e) {
    console.log(e.detail.value)
  },
  handlePhone: function (e) {
    console.log(e.detail.value)
  },
  handleOrganization: function (e) {
    console.log(e.detail.value)
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