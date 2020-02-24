// pages/login/login.js
const app = getApp()
const zhenzisms = require('../../utils/zhenzisms.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    phone: null,
    code: null,
    icon: 'password-view',
    content: '发送验证码',
    time: 60
  },
  /**
   * 其他函数
   */
  inputPhone: function(e) {
    var res = e.detail.value
    var phone = ''
    var list = res.split(' ')

    for (var i = 0; i < list.length; i++) {
      phone += list[i]
    }

    if (phone.length > 3 && phone.length <= 7) {
      phone = phone.slice(0, 3) + ' ' + phone.slice(3, phone.length)
    } else if (phone.length > 7) {
      phone = phone.slice(0, 3) + ' ' + phone.slice(3, 7) + ' ' + phone.slice(7, phone.length)
    }

    console.log(phone)

    this.setData({
      phone: phone
    })
  },
  sendCode: function() {
    this.setData({
      status: false
    })
    this.timer()
    // const apiUrl = "https://sms_developer.zhenzikj.com"
    // const appId = "104606"
    // const appSecret = "1b219489-86f2-4119-8032-a0c8d2ef6105"

    // // 获取电话
    // var list = this.data.phone.split(' ')
    // var phone = ''
    // for(var i = 0; i < list.length; i++) {
    //   phone += list[i]
    // }
    // console.log(phone)

    // // 获取验证码
    // const code = this.rand(1000, 9999)
    // console.log(code)

    // // 发送验证码
    // zhenzisms.client.init(apiUrl, appId, appSecret);

    // var params = {};
    // params.number = phone;
    // params.message = '您的验证码为:{' + code + '}，如非本人操作请忽略此短信';
    // params.seconds = 60 * 5;
    // params.length = 4;

    // zhenzisms.client.sendCode(res => {
    //   console.log(res.data)
    // }, params);

    // zhenzisms.client.balance(res => {
    //   console.log(res.data)
    // });
  },
  rand: function(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  },
  timer: function() {
    var time = this.data.time
    time -= 1

    if(time == 0) {
      return
    }

    this.setData({
      time: time
    })

    setTimeout(this.timer(), 1000)

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