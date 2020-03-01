// pages/loginNext/loginNext.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    show: false,
    cancelWithMask: true,
    actions: [{
      name: '学生',
      loading: false
    }, {
      name: '老师',
      loading: false
    }],
    cancelText: '取消',
    name: null,
    org: null,
    phone: null,
    type: null,
    nBorderColor: "#f1f1f1",
    tBorderColor: "#f1f1f1",
    color: "#808080",
    content: "请选择"
  },
  /**
   * 其他函数
   */
  openActionSheet() {
    this.setData({
      show: true,
      tBorderColor: "#f1f1f1"
    });
  },
  closeActionSheet() {
    this.setData({
      'show': false
    });
  },
  handleActionClick({ detail }) {
    // 获取被点击的按钮 index
    const { index } = detail;
    var type = null
    var content = null
    var color = "black"

    if(index == 0) {
      type = 1
      content = "学生"
    } else if(index == 1) {
      type = 2
      content = "老师"
    }

    this.setData({
      show: false,
      type: type,
      content: content,
      color: color
    })

    console.log(index)
  },
  inputName: function(e) {
    var name = e.detail.value
    console.log('name', name)

    this.setData({
      nBorderColor: "#f1f1f1",
      name: name
    })
  },
  checkName: function() {
    const name = this.data.name
    var flag = true

    if(!name || name == '') {
      flag = false
      this.setData({
        nBorderColor: "#e64240"
      })
    }

    return flag
  },
  checkType: function() {
    const type = this.data.type
    var flag = true

    if(!type || type == '') {
      flag = false
      this.setData({
        tBorderColor: "#e64240"
      })
    }

    return flag
  },
  addUser: function(data) {
    return new Promise((resolve, reject) => {
      const db = wx.cloud.database()

      db.collection('user')
        .add({
          data
        })
        .then(res => {
          console.log(res)
          resolve(res._id)
        })
        .catch(err => {
          console.log(err)
          reject('添加失败')
        })
    })
  },
  async comfirm (e) {
    // 验证姓名和身份
    var flag = true

    flag = this.checkName()
    if(!flag) {
      console.log('姓名为空')

      return
    }

    flag = this.checkType()
    if (!flag) {
      console.log('身份为空')
      
      return
    }

    // 获取用户信息并上传
    const userInfo = e.detail.userInfo
    console.log(userInfo)

    const nickname = userInfo.nickName
    const addr = userInfo.city + '/' + userInfo.province + '/' + userInfo.country
    const gender = userInfo.gender
    const avatarUrl = userInfo.avatarUrl
    const phone = this.data.phone
    const contribution = 0
    const courses = []
    const regtime = new Date()
    const org = this.data.org
    const type = this.data.type
    const name = this.data.name

    const data = {
      name: name,
      nickname: nickname,
      avatarUrl: avatarUrl,
      gender: gender,
      addr: addr,
      phone: phone,
      type: type,
      courses: courses,
      contribution: contribution,
      orgnization: org,
      regtime: regtime
    }

    let res = await this.addUser(data)
    console.log(res)

    // 更新全局数据
    app.globalData.userInfo = userInfo
    app.globalData.type = type

    wx.switchTab({
      url: '../index/index',
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const phone = "18810688942"

    this.setData({
      phone: phone
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})