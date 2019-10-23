//index.js

// 引入外部js
const stg = require('../../js/storage.js')
const dt = require('../../js/date.js')
const ct = require('../../js/collection.js')

//获取应用实例
const app = getApp()

Page({
  data: {
    userInfo: null,
    hasUserInfo: false,
    openid: null,
    hasOpenid: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
  },

  onLoad: function() {
    const _this = this

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
  getUserInfo: function(e) {
    // 获取userInfo
    console.log('获取userInfo(授权)', e.detail.userInfo)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })

    // 缓存数据到本地
    stg.setStorage('openid', this.data.openid)
    console.log(this.data.openid)

    // 上传到数据库

    var date = new Date()

    var user = wx.cloud.database({
      env: 'test-m3m5d'
    }).collection('user')

    try{
      user.where({
        _openid: this.openid
      }).get({
        success: res => {
          console.log(res.data)
        }
      })
    }
    catch(e) {
      console.log('不存在')
    }
   

    // var data = {
    //   openid: this.data.openid,
    //   gender: this.data.userInfo.gender,
    //   addr: this.data.userInfo.city + '/' + this.data.userInfo.province + '/' + this.data.userInfo.country,
    //   regtime: date,
    //   indentity: 1,
    //   title: 1,
    //   contribution: 0.5,
    // }

    // ct.add(user, data)
  }
})