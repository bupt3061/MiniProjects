//app.js

// 引入外部js
const stg = require('./js/storage.js')
const upd = require('./js/update.js')
upd.updateApp()

App({
  onLaunch: function () {
    const _this = this

    // 初始化云
    wx.cloud.init({
      env: 'test-m3m5d'
    })

    // 获取本地缓存
    if (stg.getStorage('openid')) {
      // 获取openid
      console.log('获取openid(缓存):', stg.getStorage('openid'))
      this.globalData.openid = stg.getStorage('openid')
    }

    if(stg.getStorage('type')) {
      // 获取type
      console.log('获取type(缓存):', stg.getStorage('type'))
      this.globalData.type = stg.getStorage('type')
    }

    console.log('获取registered(缓存):', stg.getStorage('registered'))
    if (!stg.getStorage('registered')) {
      // 若未注册，则跳转到登陆界面
      console.log('跳转')
      wx.redirectTo({
        url: 'pages/login/login'
      })
    }

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        const code = res.code
        console.log('code:', res.code)
      }
    })

    // 获取用户信息(授权后)
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              console.log('获取userInfo(已授权):', res.userInfo)

              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },
  globalData: {
    openid: null,
    type: null,
    userInfo: null,
    avatarIDs: ['cloud://test-m3m5d.7465-test-m3m5d-1300027116/avatar/stu.jpg', 'cloud://test-m3m5d.7465-test-m3m5d-1300027116/avatar/teach.jpg']
  }
})