// pages/login/login.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    phone: null,
    code: null,
    icon: 'password-view'
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
  getFocused: function() {
    this.setData({
      icon: "password-not-view"
    })
  },
  sendCode: function() {
    const code = this.rand(1000, 9999)
    console.log(code)
  },
  rand: function(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
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