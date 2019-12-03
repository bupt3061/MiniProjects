// pages/qiche/qiche.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    qicheItems: null,
  },
  async init() {
    wx.showLoading({
      title: '加载中',
      icon: 'loading',
      duration: 10000
    })

    var qicheItems = await this.getQicheItems()
    for (var i = 0; i < qicheItems.length; i++) {
      qicheItems[i].thumb = await this.getTempFileURL(qicheItems[i].thumb)
    }

    console.lo

    this.setData({
      qicheItems: qicheItems
    })

    wx.hideLoading()
  },
  getQicheItems: function() {
    // 获取swiperItems
    return new Promise((resolve, reject) => {
      const db = wx.cloud.database({
        env: "test-m3m5d"
      })
      db.collection('mqiche')
        .get()
        .then(res => {
          resolve(res.data)
        })
        .catch(err => {
          console.log(err)
          reject(err)
        })
    })
  },
  getTempFileURL: function(value) {
    // 用fileID换取临时文件地址
    return new Promise((resolve, reject) => {
      wx.cloud.getTempFileURL({
        fileList: [{
          fileID: value,
          maxAge: 60 * 60, // one hour
        }]
      }).then(res => {
        // get temp file URL
        resolve(res.fileList[0].tempFileURL)
      }).catch(err => {
        console.log(err)
        reject(err)
      })
    })
  },
  clickQiche: function(e) {
    const id = e.currentTarget.dataset.id
    console.log(id)

    wx.navigateTo({
      url: '../blank/blank?id=' + id,
    })
  },
  toBlank: function() {
    wx.navigateTo({
      url: '../blank/blank',
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