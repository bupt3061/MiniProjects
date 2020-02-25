// pages/loginNext/loginNext.js
// 获取全局变量
const app = getApp()

// 引入外部js
const stg = require('../../utils/storage.js')

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
    duration: 1000,
    content: null,
    $zanui: {
      toptips: {
        show: false
      }
    },
    disabled: true
  },
  /**
   * 初始化函数
   */
  async init() {
    if (stg.getStorage('name')) {
      var name = stg.getStorage('name')
      console.log('name', name)
      this.setData({
        name: name
      })
    }

    if (stg.getStorage('phone')) {
      var phone = stg.getStorage('phone')
      console.log('phone', phone)
      this.setData({
        phone: phone
      })
    }

    if (stg.getStorage('organization')) {
      var organization = stg.getStorage('organization')
      console.log('organization', organization)
      this.setData({
        organization: organization
      })
    }
  },
  /**
   * 页面其他函数
   */
  confirm: function(e) {
    const _this = this

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
    user.add({
        data: data
      })
      .then(res => {
        console.log('上传成功:', res)
        // 跳转到首页
        wx.switchTab({
          url: '../index/index',
        })
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
    var name = e.detail.value
    var phone = this.data.phone

    if (name == '') {
      name = null
      this.customCallback('姓名为空')
    }

    if ((name != null) && (phone != null) && this.checkPhone(phone)) {
      this.setData({
        disabled: false
      })
    } else {
      this.setData({
        disabled: true
      })
    }

    this.setData({
      name: name
    })

    stg.setStorage('name', name)
  },
  handlePhone: function(e) {
    var phone = e.detail.value
    var name = this.data.name

    if (phone == '') {
      phone = null
      this.customCallback('电话号码为空')
    } else if (!this.checkPhone(phone)) {
      this.customCallback('电话号码输入错误')
    }

    if ((name != null) && (phone != null) && this.checkPhone(phone)) {
      this.setData({
        disabled: false
      })
    } else {
      this.setData({
        disabled: true
      })
    }

    this.setData({
      phone: phone
    })

    stg.setStorage('phone', phone)
  },
  handleOrganization: function(e) {
    var organization = e.detail.value
    var phone = this.data.phone
    var name = this.data.name

    // 其他输入
    if ((name != null) && (phone != null) && this.checkPhone(phone)) {
      this.setData({
        disabled: false
      })
    } else {
      this.setData({
        disabled: true
      })
    }

    // 输入为空
    if (organization == '') {
      organization = null
    }

    // 存储
    this.setData({
      organization: organization
    })

    stg.setStorage('organization', organization)
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
  addCourse: function(e) {
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
    this.setData({
      type: options.type
    })

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