// pages/msg/msg.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },
  /**
   * 初始化函数
   */
  async init() {
    const openid = app.globalData.openid
    const courseids = app.globalData.courseids

    // 获得所有已过期任务
    let pastedEvalTasks = await this.getPastedEvalTasks(courseids)

    var pastedEvalTaskids = []
    for (var i = 0; i < pastedEvalTasks.length; i++) {
      pastedEvalTaskids.push(pastedEvalTasks[i]._id)
    }

    console.log('pastedEvalTasks', pastedEvalTasks)
    console.log('pastedEvalTaskids', pastedEvalTaskids)

    // 获得所有已获得信息
    const db = wx.cloud.database()
    const _ = db.command

    db.collection('msg')
      .where({
        _openid: openid,
        _taskid: _.in(pastedEvalTaskids)
      })
      .get()
      .then(res => {
        const data = res.data
        console.log(data)
      })
      .catch(err => {
        console.log(err)
      })
  },
  /**
   * 其他函数
   */
  getPastedEvalTasks: function(courseids) {
    return new Promise((resolve, reject) => {
      const db = wx.cloud.database()
      const _ = db.command
      const now = new Date()

      db.collection('task')
        .where({
          evaluateend: _.lt(now),
          _courseid: _.in(courseids)
        })
        .get()
        .then(res => {
          const data = res.data
          resolve(data)
        })
        .catch(err => {
          console.log(err)
          reject('获取失败')
        })

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