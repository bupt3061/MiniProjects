// pages/datavis/datavis.js
const F2 = require("@antv/wx-f2")
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    onInitChart(F2, config) {
      const chart = new F2.Chart(config);
      const data = [
        { value: 63.4, city: 'New York', date: '2011-10-01' },
        { value: 62.7, city: 'Alaska', date: '2011-10-01' },
        { value: 72.2, city: 'Austin', date: '2011-10-01' },
        { value: 58, city: 'New York', date: '2011-10-02' },
        { value: 59.9, city: 'Alaska', date: '2011-10-02' },
        { value: 67.7, city: 'Austin', date: '2011-10-02' },
        { value: 53.3, city: 'New York', date: '2011-10-03' },
        { value: 59.1, city: 'Alaska', date: '2011-10-03' },
        { value: 69.4, city: 'Austin', date: '2011-10-03' },
      ];
      chart.source(data, {
        date: {
          range: [0, 1],
          type: 'timeCat',
          mask: 'MM-DD'
        },
        value: {
          max: 300,
          tickCount: 4
        }
      });
      chart.area().position('date*value').color('city').adjust('stack');
      chart.line().position('date*value').color('city').adjust('stack');
      chart.render();
      // 注意：需要把chart return 出来
      return chart;
    },
    selectedId: 'datavis',
  },
  /**
   * 初始函数
   */
  /**
   * 初始化函数
   */
  async init(courseid, taskid) {
    const openid = app.globalData.openid
    let stus

    // 获取所有选择该课的用户
    let stusCount = await this.getStusCount(openid, courseid)
    console.log(stusCount)

    stus = []
    for(var i = 0; i < stusCount; i += 20) {
      let res = await this.getStusSkip(openid, courseid, i)
      stus = stus.concat(res)

      if(stus.length == stusCount) {
        break
      }
    }
    console.log(stus)

    // 
    
  },
  /**
   * 其他函数
   */
  getStusCount: function (openid, courseid) {
    return new Promise((resolve, reject) => {
      const db = wx.cloud.database()
      const _ = db.command

      db.collection('user')
        .where({
          courses: courseid,
          _openid: _.nin([openid, ])
        })
        .count()
        .then(res => {
          const total = res.total
          resolve(total)
        })
        .catch(err => {
          console.log(err)
          reject(err)
        })
    })
  },
  getStusSkip: function (openid, courseid, skip) {
    return new Promise((resolve, reject) => {
      const db = wx.cloud.database()
      const _ = db.command

      db.collection('user')
        .where({
          courses: courseid,
          _openid: _.nin([openid,])
        })
        .skip(skip)
        .then(res => {
          const data = res.data
          resolve(data)
        })
        .catch(err => {
          console.log(err)
          reject(err)
        })
    })
  },
  tapDatavis: function() {
    this.setData({
      selectedId: 'datavis'
    })
  },
  tapWorks: function() {
    this.setData({
      selectedId: 'works'
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const list = options.data.split('/')
    const courseid = list[0]
    const taskid = list[1]
    console.log('courseid', courseid)
    console.log('taskid', taskid)

    this.init(courseid, taskid)
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