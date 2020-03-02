// pages/datavis/datavis.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    selectedId: 'datavis',
    onInitChart(F2, config) {
      const chart = new F2.Chart(config);
      const data = [{
          value: 63.4,
          city: 'New York',
          date: '2011-10-01'
        },
        {
          value: 62.7,
          city: 'Alaska',
          date: '2011-10-01'
        },
        {
          value: 72.2,
          city: 'Austin',
          date: '2011-10-01'
        },
        {
          value: 58,
          city: 'New York',
          date: '2011-10-02'
        },
        {
          value: 59.9,
          city: 'Alaska',
          date: '2011-10-02'
        },
        {
          value: 67.7,
          city: 'Austin',
          date: '2011-10-02'
        },
        {
          value: 53.3,
          city: 'New York',
          date: '2011-10-03'
        },
        {
          value: 59.1,
          city: 'Alaska',
          date: '2011-10-03'
        },
        {
          value: 69.4,
          city: 'Austin',
          date: '2011-10-03'
        },
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
},
/**
 * 初始函数
 */
/**
 * 初始化函数
 */
async init() {
  // 
},
/**
 * 其他函数
 */
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
  const taskid = options.taskid
  console.log('taskid', taskid)

  this.init(taskid)
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