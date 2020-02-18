//app.js

// 引入外部js

App({
  /**
   * 初始化函数
   */
  async init() {

    const code = await this.login() // 登陆

    if (await this.getSetting()) { // 获取头像、昵称等基本信息
      let basicInfo = await this.getBasicInfo()
      this.globalData.basicInfo = basicInfo
      console.log('basicInfo:', basicInfo)
    }

  },
  /**
   * 其他函数
   */
  login: function() {
    // 登陆以获取用户基本信息
    return new Promise((resolve, reject) => {
      wx.login({
        success: res => {
          // 发送 res.code 到后台换取 openId, sessionKey, unionId
          const code = res.code
          resolve(code)
        },
        fail: err => {
          console.log(err)
          reject('登陆失败')
        }
      })
    })
  },
  getSetting: function(resolve, reject) {
    // 获取授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
    return new Promise((resolve, reject) => {
      wx.getSetting({
        success: res => {
          if (res.authSetting['scope.userInfo']) {
            // 已经授权
            resolve(res.authSetting['scope.userInfo'])
          }
        },
        fail: err => {
          console.log(err)
          reject(err)
        }
      })
    })
  },
  getBasicInfo: function() {
    // 获取用户基本信息
    return new Promise((resolve, reject) => {
      wx.getUserInfo({
        success: res => {
          resolve(res.userInfo)
          // 可以将 res 发送给后台解码出 unionId
          this.globalData.userInfo = res.userInfo

          // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
          // 所以此处加入 callback 以防止这种情况
          if (this.userInfoReadyCallback) {
            this.userInfoReadyCallback(res)
          }
        },
        fail: err => {
          console.log(err)
          reject(err)
        }
      })
    })
  },

  onLaunch: function() {

    // 初始化云
    wx.cloud.init({
      env: 'test-m3m5d'
    })

    this.init()

  },
  globalData: {
    openid: null,
    userInfo: null,
    basicInfo: null,
    avatarIDs: ['cloud://test-m3m5d.7465-test-m3m5d-1300027116/avatar/stu.jpg', 'cloud://test-m3m5d.7465-test-m3m5d-1300027116/avatar/teach.jpg'],
    tasks: null,
    courses: null,
    type: null,
    screenWidth: 0,
  }
})