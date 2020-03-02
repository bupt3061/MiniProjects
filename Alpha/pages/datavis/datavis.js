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
    let stus // 所有选课学生
    let uploadedWorks // 所有已交作业
    let evals // 所有评论
    let standard // 评价标准
    let standardKeys // 评价标准的键值

    // 获取所有选择该课的学生
    let stusCount = await this.getStusCount(openid, courseid)
    console.log(stusCount)

    stus = []
    for (var i = 0; i < stusCount; i += 20) {
      let res = await this.getStusSkip(openid, courseid, i)
      stus = stus.concat(res)

      if (stus.length == stusCount) {
        break
      }
    }
    console.log('stus', stus)

    // 获取所有已提交作业
    let uploadedWorksCount = await this.getUploadedWorksCount(taskid)
    console.log('uploadedStusCount', uploadedStusCount)

    uploadedWorks = []
    for (var i = 0; i < uploadedWorksCount; i += 20) {
      let res = await this.getUploadedWorksSkip(taskid, i)
      uploadedWorks = uploadedWorks.concat(res)

      if (uploadedWorks.length == uploadedWorksCount) {
        break
      }
    }
    console.log('uploadedWorks', uploadedWorks)

    // 获得所有互评
    var uploadedWorkids = []
    for (var i = 0; i < uploadedWorks.length; i++) {
      uploadedWorkids.push(uploadedWorks[i]._id)
    }
    console.log('uploadedWorkids', uploadedWorkids)

    let evalsCount = await this.getEvalsCount(uploadedWorkids)
    console.log("evalsCount", evalsCount)

    evals = []
    for (var i = 0; i < evalsCount; i += 20) {
      let res = await this.getEvalsSkip(uploadedWorkids, i)
      evals = evals.concat(res)

      if (evals.length == evalsCount) {
        break
      }
    }
    console.log('evals', evals)

    // 整合数据
    for (var i = 0; i < uploadedWorks.length; i++) {
      var temp = []
      for (var j = 0; j < evals.length; j++) {
        if (uploadedWorks[i]._id == evals[j]._workid) {
          temp.push(evals[j])
        }
      }
      uploadedWorks[i].evals = temp
    }
    console.log('uploadedWorks', uploadedWorks)

    for (var i = 0; i < stus.length; i++) {
      var temp = null
      for (var j = 0; j < uploadedWorks.length; j++) {
        if (stus[i]._openid == uploadedWorks[j]._openid) {
          temp = uploadedWorks[j]
          continue
        }
      }
      stus[i].work = temp
    }
    console.log('stus', stus)

    // 获得评分维度
    const tasks = app.globalData.tasklist[courseid]
    for (var i = 0; i < tasks.length; i++) {
      if (tasks[i]._id == taskid) {
        standard = tasks[i].satndard
      }
    }
    standardKeys = Object.keys(standard)
    console.log('standard', standard)
    console.log('standardKeys', standardKeys)

    // 获取总分及各项评分
    for (var i = 0; i < stus.length; i++) {
      if (stus[i].work == null) {
        // 未交作业，作业总分为0，细项得分为0
        stus[i].workscore = 0
        for (var j = 0; j < standardKeys.length; j++) {
          stus[i].standardKeys[j] = 0
        }
        continue
      }
      var wevals = stus[i].work.evals
      if (wevals.length == 0) {
        // 没有人互评
        stus[i].workscore = 6.5
        for (var j = 0; j < standardKeys.length; j++) {
          stus[i].standardKeys[j] = 6.5
        }
        continue
      }

      var totalscores = []
      var eachscores = []
      var ctbs = []
      for (var m = 0; m < wevals.length; m++) {
        totalscores.push(wevals[m].totalscore)
        eachscores.push(wevals[m].scores)
        ctbs.push(evals[m].contribution)
      }

      const workscore = this.getWorkScore(totalscores, ctbs)
      const eachscore = this.getEachscore(eachscores, ctbs)

      for (var n = 0; n < standardKeys.length; n++) {
        stus[i].standardKeys[n] = eachscore[n]
      }
      stus[i].workscore = workscore
    }
    console.log('stus', stus)
  },
  /**
   * 其他函数
   */
  getWorkScore: function(totalscores, ctbs) {
    var ctbs_sum = 0
    var processed_totalscores= []
    for (var i = 0; i < ctbs.length; i++) {
      ctbs_sum += ctbs[i]
      processed_totalscores.push(totalscores[i] * ctbs[i])
    }

    var processed_totalscores_sum = 0
    for (var j = 0; j < processed_totalscores.length; j++) {
      processed_totalscores_sum += processed_totalscores[j]
    }

    var workscore = processed_totalscores_sum / ctbs_sum
    workscore = Math.round(workscore * 10 * 10) / 10

    return workscore
  },
  getEachscore: function(eachscores, ctbs) {
    var ctbs_sum = 0
    for (var i = 0; i < ctbs.length; i++) {
      ctbs_sum += ctbs[i]
      for(var j = 0; j < eachscores.length; j++) {
        eachscores[j][i] *= ctbs[i]
      }
    }

    var sum_eachscores = []
    for(var i = 0; i < ctbs.length; i++) {
      var temp = 0
      for(var j = 0; j < eachscores.length; j++) {
        temp += eachscores[j][i]
      }
      sum_eachscores.push(temp)
    }

    var eachscore = []
    for(var i = 0; i < sum_eachscores.length; i++) {
      var temp = sum_eachscores[i] / ctbs_sum
      temp = Math.round(temp * 10 * 10) / 10
      eachscore.push(temp)
    }

    return eachscore
  },
  getStusCount: function(openid, courseid) {
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
  getStusSkip: function(openid, courseid, skip) {
    return new Promise((resolve, reject) => {
      const db = wx.cloud.database()
      const _ = db.command

      db.collection('user')
        .where({
          courses: courseid,
          _openid: _.nin([openid, ])
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
  getUploadedWorksCount: function(taskid) {
    return new Promise((resolve, reject) => {
      const db = wx.cloud.database

      db.collection('work')
        .where({
          _taskid: taskid
        })
        .count()
        .then(res => {
          const total = res.total
          resolve(total)
        })
        .catch(err => {
          reject('查询失败')
          console.log(err)
        })
    })
  },
  getUploadedWorksSkip: function(taskid, skip) {
    return new Promise((resolve, reject) => {
      const db = wx.cloud.database

      db.collection('work')
        .where({
          _taskid: taskid
        })
        .skip(skip)
        .then(res => {
          const data = res.data
          resolve(data)
        })
        .catch(err => {
          reject('查询失败')
          console.log(err)
        })
    })
  },
  getEvalsCount: function(uploadedWorkids) {
    return new Promise((resolve, reject) => {
      const db = wx.cloud.database()
      const _ = db.command

      db.collection('evaluate')
        .where({
          _workid: _.in(uploadedWorkids)
        })
        .count()
        .then(res => {
          const total = res.total
          resolve(total)
        })
        .catch(err => {
          reject('查询失败')
          console.log(err)
        })
    })
  },
  getEvalsSkip: function(uploadedWorkids, skip) {
    return new Promise((resolve, reject) => {
      const db = wx.cloud.database()
      const _ = db.command

      db.collection('evaluate')
        .where({
          _workid: _.in(uploadedWorkids)
        })
        .skip()
        .then(res => {
          const data = res.data
          resolve(data)
        })
        .catch(err => {
          reject('查询失败')
          console.log(err)
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