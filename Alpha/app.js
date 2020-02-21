//app.js

// 引入外部js

App({
  /**
   * 小程序初始化函数-全局仅触发一次
   */
  onLaunch: function() {

    // 初始化云
    wx.cloud.init({
      env: 'test-m3m5d'
    })

    // 获取设备信息
    const info = wx.getSystemInfoSync()
    const screenWidth = info.screenWidth

    console.log('screenWidth', screenWidth)
    this.globalData.screenWidth = screenWidth

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })

    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
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
    avatarIDs: ['cloud://test-m3m5d.7465-test-m3m5d-1300027116/avatar/stu.jpg', 'cloud://test-m3m5d.7465-test-m3m5d-1300027116/avatar/teach.jpg'],
    tasks: null,
    wtjTasks: [],
    ytjTasks: [],
    ygqTasks: [],
    kxgTasks: [],
    whpTasks: [],
    wwcTasks: [],
    ygqETasks: [],
    yhpTasks: [],
    courses: null,
    courseids: null,
    users: null,
    inUploadNum: null,
    inEvalNum: null,
    screenWidth: null,
    standard: null,
    standardKeys: null,
    storedUploadTasks: false,
    storedEvalTasks: false
  }
})