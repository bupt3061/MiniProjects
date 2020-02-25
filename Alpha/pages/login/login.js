// pages/login/login.js
const app = getApp()
const zhenzisms = require('../../utils/zhenzisms.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    phone: null,
    sysCode: null,
    code: null,
    icon: 'password-view',
    content: '发送验证码',
    time: 60,
    idx: null,
    flag: false,
    status: true,
    pBorderColor: "#f1f1f1",
    cBorderColor: "#f1f1f1"
  },
  /**
   * 其他函数
   */
  inputPhone: function(e) {
    var res = e.detail.value
    var phone = this.getPhone(res)
    phone = this.processPhone(phone)

    console.log('phone', phone)

    this.setData({
      phone: phone
    })
  },
  focusPhone: function() {
    this.setData({
      pBorderColor: "#14d1b5"
    })
  },
  blurPhone: function() {
    this.setData({
      pBorderColor: "#f1f1f1"
    })
  },
  inputCode: function(e) {
    const code = e.detail.value
    console.log('code', code)

    if(code.length != 0) {
      this.setData({
        code: code,
        icon: "password-not-view"
      })
    } else {
      this.setData({
        icon: "password-view"
      })
    }
  },
  focusCode: function () {
    this.setData({
      cBorderColor: "#14d1b5"
    })
  },
  blurCode: function() {
    this.setData({
      cBorderColor: "#f1f1f1"
    })
  },
  sendCode: function() {
    const that = this

    // 获取并验证电话
    var phone = this.data.phone
    phone = this.getPhone(phone)

    var flag = this.checkPhone(phone)
    console.log(flag)

    if (!flag) {
      console.log("电话号码错误")

      return
    }

    console.log("phone", phone)

    // 倒计时
    this.setData({
      status: false
    })

    this.timer()

    // 获取验证码
    const sysCode = this.rand(1000, 9999)
    console.log("sysCode", sysCode)

    this.setData({
      sysCode: sysCode
    })

    // 发送短信
    const apiUrl = "https://sms_developer.zhenzikj.com"
    const appId = "104606"
    const appSecret = "1b219489-86f2-4119-8032-a0c8d2ef6105"

    // 发送验证码
    zhenzisms.client.init(apiUrl, appId, appSecret);

    var params = {};
    params.number = phone;
    params.message = '您的验证码为:{' + sysCode + '}，如非本人操作请忽略此短信';
    params.seconds = 60 * 5;
    params.length = 4;

    zhenzisms.client.sendCode(res => {
      console.log(res.data)
    }, params);

    zhenzisms.client.balance(res => {
      console.log(res.data)
    });
  },
  rand: function(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  },
  timer: function() {
    const flag = this.data.flag
    var time = this.data.time

    // 设置计时器并存储到全局
    var idx = setTimeout(this.timer, 1000)

    if(!flag) {
      this.setData({
        idx: idx,
        flag: false
      })
    }

    // 到时重新启用
    if (time == 0) {
      const idx = this.data.idx

      this.setData({
        status: true,
        flag: false,
        content: "重新发送",
        time: 60
      })

      clearTimeout(idx)
    } else {
      time = time - 1
      this.setData({
        time: time
      })
    }
  },
  processPhone: function(phone) {
    if (phone.length > 3 && phone.length <= 7) {
      phone = phone.slice(0, 3) + ' ' + phone.slice(3, phone.length)
    } else if (phone.length > 7) {
      phone = phone.slice(0, 3) + ' ' + phone.slice(3, 7) + ' ' + phone.slice(7, phone.length)
    }

    return phone
  },
  getPhone: function(phone) {
    if(!phone) {
      return ''
    }

    var res = ''
    var list = phone.split(' ')

    for(var i = 0; i < list.length; i++) {
      res += list[i]
    }

    return res
  },
  checkPhone: function(phone) {
    var res = null
    let reg = /^1(3[0-9]|4[5,7]|5[0,1,2,3,5,6,7,8,9]|6[2,5,6,7]|7[0,1,7,8]|8[0-9]|9[1,8,9])\d{8}$/;

    if(!phone || phone == '') {
      res = false
    } else {
      res = reg.test(phone)
    }

    if(!res) {
      this.setData({
        pBorderColor: "#e64240"
      })
    }

    return res
  },
  checkCode: function() {
    const code = this.data.code
    const sysCode = this.data.sysCode
    var flag = null

    if(!code && !sysCode) {
      flag = false
    }

    if(code != sysCode) {
      flag = false
    }

    if(!flag) {
      this.setData({
        cBorderColor: "#e64240"
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

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