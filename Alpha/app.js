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
    // px转换到rpx的比例
    const pxToRpxScale = 750 / info.windowWidth;
    // 导航栏的高度
    const navigationHeight = 44
   
    const screenWidth = info.screenWidth
    const screenHeight = info.screenHeight
    const windowHeight = info.windowHeight

    console.log('navigationHeight', navigationHeight)
    this.globalData.navigationHeight = navigationHeight
    console.log('screenWidth', screenWidth)
    this.globalData.screenWidth = screenWidth
    console.log('screenHeight', screenHeight)
    this.globalData.screenHeight = screenHeight
    console.log('windowHeight', windowHeight)
    this.globalData.windowHeight = windowHeight

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
    tasks: null,
    wtjTasks: [],
    ytjTasks: [],
    ygqTasks: [],
    kxgTasks: [],
    whpTasks: [],
    wwcTasks: [],
    ygqETasks: [],
    courses: [],
    courseids: [],
    inUploadNum: 0,
    inEvalNum: 0,
    inEvalTask: null,
    screenWidth: null,
    screenHeight: null,
    windowHeight: null,
    navigationHeight: null,
    standard: null,
    standardKeys: null,
    storedUploadTasks: false,
    storedEvalTasks: false,
    storedMsg: false,
    existedMsg: [],
    newMsg: [],
    arg: null,
    wlArg: null,
    wlTaskid: null,
    wlWorkid: null,
    processedCourseids: [],
    indexProcessedIds: [],
    msgProcessedIds: [],
    workProcessedIds: [],
    evalProcessedIds: [],
    worksList: {},
    markedWorksList: [],
    newAddedCourseids: [],
    processedAddedIds: []
  }
})