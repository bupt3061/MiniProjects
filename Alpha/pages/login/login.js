// pages/login/login.js

// 引入外部js
const stg = require('../../js/storage.js')
const ct = require('../../js/collection.js')

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
    userInfo: null,
    hasUserInfo: false,
    openid: null,
    hasOpenid: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    loading: false
  },

  /**
   * 页面其他函数
   */
  toTeach: function() {
    wx.navigateTo({
      url: '../loginTeach/loginTeach?type=' + this.data.type,
      success: res => {
        console.log(res)
      }
    })
  },
  getUserInfo: function(e) {
    const _this = this

    // 显示加载
    this.setData({
      loading: true
    })

    // 获取userInfo
    console.log('获取userInfo(授权)', e.detail.userInfo)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })

    // 缓存数据到本地
    stg.setStorage('openid', this.data.openid)
    stg.setStorage('type', this.data.type)
    stg.setStorage('registered', true)

    // 上传到数据库

    var date = new Date()

    var stu = wx.cloud.database({
      env: 'test-m3m5d'
    }).collection('stu')

    var data = {
      openid: this.data.openid,
      gender: this.data.userInfo.gender,
      addr: this.data.userInfo.city + '/' + this.data.userInfo.province + '/' + this.data.userInfo.country,
      regtime: date,
      type: 1,
      title: 1,
      contribution: 0.5,
    }

    try {
      stu.where({
        _openid: this.data.openid
      }).get({
        success: res => {
          if (res.data.length == 0) {
            ct.add(stu, data)
          } else {
            console.log('记录已存在')
          }

          _this.setData({
            loading: false
          })

          wx.switchTab({
            url: "../index/index",
            success: res => {
              console.log('跳转到index')
            },
            fial: err => {
              console.log(err)
            }
          })
        },
        fail: err => {
          console.log(err)
        }
      })
    } catch (err) {
      console.log(err)
    }

    // 跳转到首页
  },
  confirmStu: function() {
    stg.setStorage('type', this.data.type)
    stg.setStorage('registered', true)
  },
  clickStu: function() {
    this.setData({
      type: 1,
      stuStyle: "primary",
      teachStyle: "zan-c-gray-dark"
    })
    console.log(this.data.type)
  },
  clickTeach: function() {
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
    const _this = this

    // 从云端下载默认头像
    wx.cloud.getTempFileURL({
      fileList: app.globalData.avatarIDs,
      success: res => {
        var avatarStu = res.fileList[0].tempFileURL
        var avatarTeach = res.fileList[1].tempFileURL

        _this.setData({
          avatarStu,
          avatarTeach
        })
      },
      fail: err => {
        console.log(err)
      }
    })

    // 获取openid
    if (app.globalData.openid) {
      this.setData({
        openid: app.globalData.openid,
        hasOpenid: true
      })
    } else {
      wx.cloud.callFunction({
        name: 'getInfo',
        data: {},
        success: res => {
          console.log('获取openid(云函数):', res.result.OPENID)
          app.globalData.openid = res.result.OPENID
          _this.setData({
            openid: res.result.OPENID,
            hasOpenid: true
          })
        }
      })
    }

    // 获取userInfo
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }

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