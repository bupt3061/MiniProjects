//index.js

// 引入外部js
const stg = require('../../js/storage.js')

//获取应用实例
const app = getApp()

Page({
  data: {
    type: null,
    taskNum: 0,
    mutualEvaluateNum: 0,
    courses: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function() {
    this.setData({
      type: app.globalData.type
    })

    const _this = this

    const db = wx.cloud.database({
      env: 'test-m3m5d'
    })
    const _ = db.command
    const $ = db.command.aggregate

    // 查询所选课程
    var tasks = []
    var courses = []
    db.collection('stu').where({
      _openid: app.globalData.openid
    })
      .get()
      .then(res => {
        // 设置页面数据
        courses = res.data[0]['courses']
        _this.setData({
          courses: courses
        })

        // 查询未提交作业
        for (var i = 0; i < courses.length; i++) {
          db.collection('task').where({
            _courseid: courses[i]
          }).get()
            .then(res => {
              console.log(res.data)
              var temp = res.data
              for (var j = 0; j < res.data.length; j++) {
                tasks.push(temp[j])
              }
            })
            .catch(err => {
              console.log(err)
            })
        }
      })
      .catch(err => {
        console.log(err)
      })

      console.log(tasks)
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