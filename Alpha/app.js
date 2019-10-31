//app.js

// 引入外部js
const stg = require('./js/storage.js')
const upd = require('./js/update.js')
const hs = require('./js/hash.js')
const dt = require('./js/date.js')

upd.updateApp()

// console.log('hash', hs.hash('设计心理学/2019/10/27 09:11:27'))
// var date1 = new Date('10 27, 2019 10:42:53')  
// console.log(date1)
// console.log(dt.formatTime(date1))
// console.log(date1.getTime())


App({
  async init() {
    // 初始化

    let openid = await this.getOpenid() // 获取openid
    let item = await this.getUserItem(openid) // 从数据库获取用户信息
    this.login()
    if (await this.getSetting()) {
      let res = await this.getUserInfo()
      var userInfo = res
    }
    var tasks = []
    for(var i = 0; i < item.courses.length; i++) {
      let res = await this.getTasks(item.courses[i])
      tasks = tasks.concat(res)
    }
    console.log('tasks:', tasks)
  },
  getOpenid: function() {
    return new Promise((resolve, reject) => {
      // 获取openid
      wx.cloud.callFunction({
        name: 'getInfo',
        data: {},
        success: res => {
          console.log('openid:', res.result.OPENID)
          resolve(res.result.OPENID)
        },
        fail: err => {
          console.log(err)
          reject(err)
        }
      })
    })
  },
  getUserItem: function(openid) {
    // 从数据库中获取该用户记录
    return new Promise((resolve, reject) => {
      const db = wx.cloud.database()

      db.collection('user').where({
          _openid: openid
        })
        .get()
        .then(res => {
          console.log('item:', res.data[0])
          resolve(res.data[0])
        })
        .catch(err => {
          console.log(err)
          reject(err)
        })
    })
  },
  login: function() {
    // 登陆以获取用户基本信息
    return new Promise((resolve, reject) => {
      wx.login({
        success: res => {
          // 发送 res.code 到后台换取 openId, sessionKey, unionId
          console.log('code:', res.code)
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
  getUserInfo: function() {
    // 获取用户基本信息
    return new Promise((resolve, reject) => {
      wx.getUserInfo({
        success: res => {
          console.log('userInfo:', res.userInfo)
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
  getTasks: function(courseid) {
    return new Promise((resolve, reject) => {
      const db = wx.cloud.database()

      db.collection('task').where({
          _courseid: courseid
        })
        .get()
        .then(res => {
          resolve(res.data)
        })
        .catch(err => {
          console.log(err)
          reject(err)
        })
    })
  },
  toLogin: function() {
    // 判断该用户是否登陆过，若无则跳转到login界面
    
  },
  onLaunch: function() {
    const _this = this

    // 初始化云
    wx.cloud.init({
      env: 'test-m3m5d'
    })

    this.init()

    // 若未注册，则跳转到登陆界面
    if (!stg.getStorage('registered')) {
      console.log('跳转')
      wx.redirectTo({
        url: 'pages/login/login'
      })
    }

    // 获取用户openid
    var openid = stg.getStorage('openid')
    if (openid) {
      this.globalData.openid = openid
    }

    // 获取用户类型
    var type = stg.getStorage('type')
    if (type) {
      this.globalData.type = type
    }

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        const code = res.code
      },
      fail: err => {
        console.log(err)
      }
    })

    // 获取用户信息(授权后)
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
    courses: [],
    tasks: []
  }
})