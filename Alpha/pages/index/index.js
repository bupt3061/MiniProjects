//index.js

// 引入外部js
const stg = require('../../js/storage.js')

//获取应用实例
const app = getApp()

Page({
  data: {
    openid: null,
    type: null,
    taskNum: 0,
    mutualEvaluateNum: 0,
    courses: [],
    tasks: []
  },
  async init() {
    let courses = await this.getCourses(this.data.type, this.data.openid)
    
    var tasks = []
    for(var i = 0; i < courses.length; i++) {
      let task = await this.getTasks(courses[i])
      tasks = tasks.concat(task)
      console.log(tasks)
    }
    this.setData({
      tasks: tasks
    })
  },
  getCourses: function (type, openid) {
    return new Promise((resolve, reject) => {
      var collection = 'stu'
      if(type == 2) {
        collection = 'teach'
      }
      const db = wx.cloud.database({
        env: 'test-m3m5d'
      })
      db.collection(collection).where({
        _openid: openid
      })
        .get()
        .then(res => {
          var courses = res.data[0]['courses']
          this.setData({
            courses: courses
          })
          resolve(courses)
        })
        .catch(err => {
          console.log(err)
        })
    })
  },
  getTasks: function (courseid) {
    return new Promise((resolve, reject) => {
      const db = wx.cloud.database({
        env: 'test-m3m5d'
      })
      db.collection('task').where({
        _courseid: courseid
      })
      .get()
      .then(res => {
        resolve(res.data)
      })
      .catch(err => {
        console.log(err)
      })
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    this.init()
    this.setData({
      type: app.globalData.type,
      openid: app.globalData.openid
    })
    console.log(this.data)
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