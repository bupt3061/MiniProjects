// pages/comment/comment.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    duration: 1000,
    content: null,
    $zanui: {
      toptips: {
        show: false
      }
    },
    arg: null,
    taskid: null,
    workid: null,
    standard: null,
    standardKeys: null,
    scores: [],
    min: 0,
    max: 10,
    step: 0.5,
    selectedColor: "#14d1b5",
    blockSize: 24,
    maxlength: 200,
    poslen: 0,
    naglen: 0,
    postext: null,
    nagtext: null,
    posFocus: false,
    nagFocus: false
  },
  /**
   * 页面其他函数
   */
  posInput: function(e) {
    const text = e.detail.value
    const poslen = text.length

    console.log('text', text)
    console.log('poslen', poslen)

    this.setData({
      postext: text,
      poslen: poslen
    })
  },
  nagInput: function(e) {
    const text = e.detail.value
    const naglen = text.length

    console.log('text', text)
    console.log('naglen', naglen)

    this.setData({
      nagtext: text,
      naglen: naglen
    })
  },
  changeValue: function(e) {
    const value = e.detail.value
    const idx = e.target.dataset.index

    console.log('value', value)
    console.log('index', idx)

    // 更新数据
    this.data.scores[idx] = value
  },
  comment: function() {
    const now = new Date()
    const arg = this.data.arg
    const workid = this.data.workid
    const taskid = this.data.taskid
    const postext = this.data.postext
    const nagtext = this.data.nagtext
    const scores = this.data.scores
    const standard = this.data.standard
    const standardKeys = this.data.standardKeys
    const contribution = app.globalData.userInfo.contribution
    const openid = app.globalData.openid
    var wwcTasks = app.globalData.wwcTasks
    var whpTasks = app.globalData.whpTasks

    wx.showLoading({
      title: '上传中',
    })

    // 空值处理
    if (scores.length != standardKeys.length) {
      // 没打分
      this.setData({
        $zanui: {
          toptips: {
            show: true,
          }
        },
        content: '请打分'
      });

      setTimeout(() => {
        this.setData({
          $zanui: {
            toptips: {
              show: false
            }
          }
        })
      }, this.data.duration)

      return
    }

    if (postext == null || postext == '') {
      // 没输入正面评价
      console.log('postext', postext)
      this.setData({
        $zanui: {
          toptips: {
            show: true
          }
        },
        content: '请评价',
        posFocus: true,
        nagFocus: false
      })

      setTimeout(() => {
        this.setData({
          $zanui: {
            toptips: {
              show: false
            }
          }
        })
      }, this.data.duration)

      return
    }

    if (nagtext == null || nagtext == '') {
      // 没输入负面评价
      this.setData({
        $zanui: {
          toptips: {
            show: true
          }
        },
        content: '请评价',
        posFocus: false,
        nagFocus: true
      });

      setTimeout(() => {
        this.setData({
          $zanui: {
            toptips: {
              show: false
            }
          }
        })
      }, this.data.duration)

      return
    }

    // 获取总分
    var total = 0
    for (var i = 0; i < scores.length; i++) {
      var temp = standardKeys[i]
      total += scores[i] * standard[temp]
    }

    total = Math.floor(total * 10) / 10 // 保留一位小数

    console.log('总分', total)

    // 上传数据
    var data = {
      _workid: workid,
      _taskid: taskid,
      evaltime: now,
      contribution: contribution,
      positive: postext,
      nagtive: nagtext,
      totalscore: total,
      scores: scores,
      standardKeys: standardKeys
    }

    const db = wx.cloud.database()
    const _ = db.command

    db.collection('evaluate')
      .add({
        data
      })
      .then(res => {
        console.log(res)
      })
      .catch(err => {
        console.log(err)
      })

    // 增加贡献值
    db.collection('user')
      .where({
        _openid: openid
      })
      .update({
        data: {
          contribution: _.inc(1)
        }
      })
      .then(res => {
        console.log(res)
      })
      .catch(err => {
        console.log(err)
      })
    
    // 更新全局数据
    if(arg == '2') {
      for(var i = 0; i < wwcTasks.length; i++) {
        if(wwcTasks[i]._id == taskid) {
          wwcTasks[i].idx += 1
          wwcTasks[i].evaledNum += 1
        }
      }

      console.log('未完成', wwcTasks)
      app.globalData.wwcTasks = wwcTasks
    } else if(arg == '3') {
      var list = []
      var item = null
      for(var i = 0; i < whpTasks.length; i++) {
        if(whpTasks[i]._id == taskid) {
          item = whpTasks[i]
          continue
        }
      }
    }

    wx.hideLoading()
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const list = options.data.split('/')
    const workid = list[0]
    const taskid = list[1]
    const arg = list[2]
    const standard = app.globalData.standard
    const standardKeys = app.globalData.standardKeys

    console.log('workid', workid)
    console.log('taskid', taskid)
    console.log('arg', arg)
    console.log('standard', standard)
    console.log('standardKeys', standardKeys)

    this.setData({
      arg: arg,
      workid: workid,
      taskid: taskid,
      standard: standard,
      standardKeys: standardKeys
    })
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