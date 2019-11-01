//app.js

// 引入外部js
const stg = require('./js/storage.js')
const upd = require('./js/update.js')
const hs = require('./js/hash.js')
const dt = require('./js/date.js')

upd.updateApp()

// console.log('hash', hs.hash('设计心理学/2019/10/27 09:11:27'))
// var date1 = new Date('10 27, 2019 10:42:53')  
// var date2 = new Date()
// console.log(date2 >= date1)
// console.log(date1)
// console.log(dt.formatTime(date1))
// console.log(date1.getTime())


App({
  async init() {
    // 初始化

    // 判断是否注册
    // if(!stg.getStorage('registered')) {
    //   let openid = await this.getOpenid() // 获取openid
    //   let userInfo = await this.getUserInfo(openid) // 从数据库获取该用户信息

    //   if (!userInfo) {
    //     this.toLogin()
    //     return
    //   }
    // }
    let openid = await this.getOpenid()
    this.globalData.openid = openid

    this.login() // 登陆
    if (await this.getSetting()) { // 获取头像、昵称等基本信息
      let res = await this.getBasicInfo()
      var basicInfo = res
      this.globalData.basicInfo = basicInfo
      console.log('basicInfo:', basicInfo)
    }

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
  // getUserInfo: function(openid) {
  //   // 从数据库中获取该用户记录
  //   return new Promise((resolve, reject) => {
  //     const db = wx.cloud.database()

  //     db.collection('user').where({
  //         _openid: openid
  //       })
  //       .get()
  //       .then(res => {
  //         resolve(res.data[0])
  //       })
  //       .catch(err => {
  //         console.log(err)
  //         reject(err)
  //       })
  //   })
  // },
  login: function() {
    // 登陆以获取用户基本信息
    return new Promise((resolve, reject) => {
      wx.login({
        success: res => {
          // 发送 res.code 到后台换取 openId, sessionKey, unionId
          resolve(res.code)
        },
        fail: err => {
          console.log(err)
          reject(err)
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
  // toLogin: function() {
  //   // 判断该用户是否登陆过，若无则跳转到login界面
  //   return new Promise((resolve, reject) => {
  //     wx.redirectTo({
  //       url: '../login/login'
  //     })
  //   })
  // },

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
    tasks: null
  }
})