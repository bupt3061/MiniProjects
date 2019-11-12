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
    type: 1,
    name: null,
    phone: null,
    organization: null,
    courses: [],
    loading: false,
    duration: 1000,
    content: null,
    $zanui: {
      toptips: {
        show: false
      }
    }
  },
  async init() {

    let openid = await this.getOpenid()
    let type = await this.getType()
    if (stg.getStorage('name')) {
      var name = stg.getStorage('name')
    }
    if (stg.getStorage('phone')) {
      var phone = stg.getStorage('phone')
    }
    if (stg.getStorage('organization')) {
      var organization = stg.getStorage('organization')
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
  getCourses: function() {
    // 获取所有课程信息
    
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
    this.setData({
      name: e.detail.value
    })
  },
  handlePhone: function(e) {
    console.log(e.detail.value)
    if (e.detail.value == '') {
      this.customCallback('电话号码为空')
    } else {
      if (!this.checkPhone(e.detail.value)) {
        this.customCallback('电话号码输入错误')
      } else {
        this.setData({
          phone: e.detail.value,
        })
      }
    }
  },
  handleOrganization: function(e) {
    console.log(e.detail.value)
    this.setData({
      organization: e.detail.value
    })
  },
  checkPhone: function(phone) {
    var myreg = /^[1][3,4,5,7,8][0-9]{9}$/;
    if (!myreg.test(phone)) {
      return false
    } else {
      return true
    }
  },
  customCallback: function(content) {
    // 显示顶部提示
    this.setData({
      $zanui: {
        toptips: {
          show: true
        }
      },
      content: content
    });

    // 1秒钟后隐藏
    setTimeout(() => {
      this.setData({
        $zanui: {
          toptips: {
            show: false
          }
        }
      })
    }, this.data.duration);
  },
  addCourse: function (e) {
    const _this = this
    wx.scanCode({
      success(res) {
        console.log(res.result)
        _this.data.courses.push(res.result)
        console.log(_this.data.courses)
      }
    })
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