// pages/datavis/datavis.js
const F2 = require("@antv/wx-f2")
const app = getApp()
const st = require('../../utils/string.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    optsBar: {
      onInit: () => { }
    },
    optsRadar: {
      onInit: () => { }
    },
    selectedId: 'datavis',
    stus: null,
    totalscoresGroup: null,
    avgs: null,
    row: null,
    studata: null,
    taskname: null,
    show: false
  },
  /**
   * 初始函数
   */
  /**
   * 初始化函数
   */
  async init(courseid, taskid) {
    const now = new Date()
    const openid = app.globalData.openid
    let stus // 所有选课学生
    let totalscoresGroup // 总成绩分组
    let avgs // 各细项均值
    let uploadedWorks // 所有已交作业
    let evals // 所有评论
    let standard // 评价标准
    let standardKeys // 评价标准的键值
    let barChart
    let row
    let studata
    let taskname

    wx.showLoading({
      title: '加载中',
    })

    // 获得评分维度
    const tasks = app.globalData.tasklist[courseid]

    if(tasks == null) {
      let theTask = await this.getTaskInfo(taskid)
      taskname = theTask.taskname
      standard = theTask.standard
      console.log('standard', theTask)
      standardKeys = Object.keys(standard)
    } else {
      for (var i = 0; i < tasks.length; i++) {
        if (tasks[i]._id == taskid) {
          standard = tasks[i].standard
          standardKeys = Object.keys(standard)
          taskname = tasks[i].taskname
          break
        }
      }
    }
    
    console.log('standard', standard)
    console.log('standardKeys', standardKeys)
    console.log('taskname', taskname)

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
    console.log('uploadedWorksCount', uploadedWorksCount)

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
    for (var i = 0; i < stus.length; i++) {
      var temp = 0
      for (var j = 0; j < evals.length; j++) {
        if (stus[i]._openid == evals[j]._openid) {
          temp += 1
        }
      }
      stus[i].evalNum = temp
    }
    console.log('stus', stus)

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

    // 获取总分及各项评分
    for (var i = 0; i < stus.length; i++) {
      if (stus[i].work == null) {
        // 未交作业，作业总分为0，细项得分为0
        stus[i].workscore = 0
        for (var j = 0; j < standardKeys.length; j++) {
          stus[i][standardKeys[j]] = 0
        }
        continue
      }

      var wevals = stus[i].work.evals
      if (wevals.length == 0) {
        // 没有人互评
        stus[i].workscore = 6.5
        for (var j = 0; j < standardKeys.length; j++) {
          stus[i][standardKeys[j]] = 6.5
        }
        continue
      }

      var totalscores = []
      var eachscores = []
      var ctbs = []
      for (var m = 0; m < wevals.length; m++) {
        totalscores.push(wevals[m].totalscore)
        eachscores.push(wevals[m].scores)
        ctbs.push(wevals[m].contribution)
      }

      const workscore = this.getWorkScore(totalscores, ctbs)
      const eachscore = this.getEachscore(eachscores, ctbs)

      for (var n = 0; n < standardKeys.length; n++) {
        stus[i][standardKeys[n]] = eachscore[n]
      }
      stus[i].workscore = workscore
    }
    console.log('stus', stus)

    // 获取互评得分
    for (var i = 0; i < stus.length; i++) {
      var evalNum = stus[i].evalNum
      const needEvalNum = 3
      var ratio = evalNum / needEvalNum
      if (ratio > 1) {
        ratio = 1
      }

      var evalscore = ratio * 10
      evalscore = Math.round(evalscore * 10) / 10
      stus[i].evalscore = evalscore
    }
    console.log("stus", stus)

    // 获取总分
    for (var i = 0; i < stus.length; i++) {
      const evalscore = stus[i].evalscore
      const workscore = stus[i].workscore
      var totalscore = evalscore * 0.3 + workscore * 0.7
      totalscore = Math.round(totalscore * 10) / 10
      stus[i].totalscore = totalscore
    }
    console.log('stus', stus)

    // 获取总分分组
    totalscoresGroup = [{
        cate: '1',
        count: 0
      },
      {
        cate: '3',
        count: 0
      },
      {
        cate: '5',
        count: 0
      },
      {
        cate: '7',
        count: 0
      },
      {
        cate: '9',
        count: 0
      }
    ]

    for (var i = 0; i < stus.length; i++) {
      const totalscore = stus[i].totalscore
      if (0 <= totalscore && totalscore < 2) {
        totalscoresGroup[0].count += 1
      } else if (2 <= totalscore && totalscore < 4) {
        totalscoresGroup[1].count += 1
      } else if (4 <= totalscore && totalscore < 6) {
        totalscoresGroup[2].count += 1
      } else if (6 <= totalscore && totalscore < 8) {
        totalscoresGroup[3].count += 1
      } else {
        totalscoresGroup[4].count += 1
      }
    }
    console.log('totalscoreGroup', totalscoresGroup)

    // 获取各细项均值
    avgs = []
    for (var i = 0; i < standardKeys.length; i++) {
      var temp = 0
      for (var j = 0; j < stus.length; j++) {
        if (stus[j][standardKeys[i]] == 0) {
          continue
        }
        temp += stus[j][standardKeys[i]]
      }
      var avg = temp / uploadedWorksCount
      avg = Math.round(avg * 10) / 10
      var data = {
        cate: standardKeys[i],
        avg: avg
      }
      avgs.push(data)
    }
    console.log('avgs', avgs)

    // 处理提交时间
    for(var i = 0; i < stus.length; i++) {
      if(stus[i].work == null) {
        stus[i].tijiao = '未提交'
        stus[i].state = false
        continue
      } 
      stus[i].tijiao = this.getTimeBetween(stus[i].work.uploadtime, now)
      stus[i].state = true
    }
    console.log('stus', stus)

    // 排序
    for (var i = 0; i < stus.length; i++) {
      // 排序
      for (var j = 0; j < stus.length - i - 1; j++) {
        if (stus[j].totalscore < stus[j + 1].totalscore) {
          var temp = stus[j]
          stus[j] = stus[j + 1]
          stus[j + 1] = temp
        }
      }
    }
    console.log('stus', stus)

    // 处理长字符串
    for (var i = 0; i < stus.length; i++) {
      var temp = null
      if (stus[i].work == null) {
        temp = taskname
        temp = st.handleTaskName(temp)
        stus[i].worknameh = temp
        continue
      }
      stus[i].worknameh = st.handleListTaskName(stus[i].work.title)
    }
    console.log('stus', stus)

    // 获得表头
    row = ['姓名', '电话']
    for(var i = 0; i < standardKeys.length; i++) {
      row.push(standardKeys[i])
    }
    row = row.concat(['作业得分', '互评得分', '总分'])
    console.log('row', row)

    // 获得学生数据
    studata = []
    for(var i = 0; i < stus.length; i++) {
      var temp = []
      temp = temp.concat([stus[i].name, stus[i].phone])
      for(var j = 0; j < standardKeys.length; j++) {
        temp.push(stus[i][standardKeys[j]])
      }
      temp = temp.concat([stus[i].workscore, stus[i].evalscore, stus[i].totalscore])
      studata.push(temp)
    }
    console.log('studata', studata)

    // 绘制条形图
    // bar.changeData(totalscoresGroup)
    // radar.changeData(avgs)
    const bar = this.initBarChart(totalscoresGroup)
    const radar = this.initRadarChart(avgs)

    this.setData({
      optsBar: {
        onInit: bar
      },
      optsRadar: {
        onInit: radar
      },
      show: true
    })

    wx.hideLoading()

    this.setData({
      taskid: taskid,
      stus: stus,
      totalscoresGroup: totalscoresGroup,
      avgs: avgs,
      row: row,
      studata: studata,
      taskname: taskname
    })
  },
  /**
   * 其他函数
   */
  getTaskInfo: function (taskid) {
    return new Promise((resolve, reject) => {
      const db = wx.cloud.database()

      db.collection('task')
      .where({
        _id: taskid
      })
      .get()
      .then(res => {
        const data = res.data[0]
        resolve(data)
      })
      .catch(err => {
        console.log(err)
        reject('获取失败')
      })
    })
  },
  getTimeBetween: function (startDate, endDate) {
    var days = (endDate - startDate) / (1 * 24 * 60 * 60 * 1000)
    var timeString = null

    if (days >= 365) {
      var years = days / 365
      timeString = Math.floor(years).toString() + "年前"
    } else if (days > 30 && days < 365) {
      var months = days / 30
      timeString = Math.floor(months).toString() + "月前"
    } else if (days >= 7 && days < 30) {
      var weeks = days / 7
      timeString = Math.floor(weeks).toString() + "周前"
    } else if (days >= 1 && days < 7) {
      timeString = Math.floor(days).toString() + "天前"
    } else if (days < 1) {
      var hours = days * 24
      timeString = Math.floor(hours).toString() + "小时前"

      if (hours < 1) {
        var mins = hours * 60
        timeString = Math.floor(mins).toString() + "分钟前"

        if (mins < 1) {
          timeString = "刚刚"
        }
      }
    }

    return timeString
  },
  initBarChart(data){
    return function (canvas, width, height, F2) { // 使用 F2 绘制图表
      const bar = new F2.Chart({
        el: canvas,
        width,
        height
      });

      bar.source(data, {
        count: {
          tickCount: 5
        }
      })

      bar.tooltip({
        showItemMarker: false,
        onShow(ev) {
          const {
            items
          } = ev;
          items[0].name = null;
          items[0].name = (parseInt(items[0].title) - 1) + '~' + (parseInt(items[0].title) + 1);
          items[0].value = ':' + items[0].value + '人';
        }
      })

      bar.interval().position('cate*count')
      bar.render()

      return bar
    }
  },
  initRadarChart(data) {
    return function (canvas, width, height, F2) { // 使用 F2 绘制图表
      const radar = new F2.Chart({
        el: canvas,
        width,
        height
      })

      radar.coord('polar')

      radar.source(data, {
        avg: {
          min: 0,
          max: 10,
          nice: false,
          tickCount: 5
        }
      })

      radar.tooltip({
        showItemMarker: false,
        onShow(ev) {
          const {
            items
          } = ev;
          items[0].name = null;
          items[0].name = items[0].title;
          items[0].value = ':' + items[0].value + '分';
        }
      })

      radar.axis('avg', {
        label: function label(text, index, total) {
          if (index === total - 1) {
            return null;
          }
          return {
            top: true
          };
        },
        grid: {
          lineDash: null,
          type: 'arc' // 弧线网格
        }
      })

      radar.axis('cate', {
        grid: {
          lineDash: null
        }
      })

      radar.line().position('cate*avg')
      radar.point().position('cate*avg')
        .style({
          stroke: '#fff',
          lineWidth: 1
        });
      radar.render();

      return radar
    }
  },
  getFileID: function() {
    return new Promise((resolve, reject) => {
      const studata = this.data.studata
      const row = this.data.row
      const taskname = this.data.taskname
      
      wx.cloud.callFunction({
        name: 'excel',
        data: {
          taskname: taskname,
          row: row,
          data: studata
        }
      })
      .then(res => {
        resolve(res.result.fileID)
      })
      .catch(err => {
        console.log(err)
        reject('获取失败')
      })
    })
  },
  downloadFile: function(fileID) {
    return new Promise((resolve, reject) => {
      wx.cloud.downloadFile({
        fileID: fileID
      })
      .then(res => {
        resolve(res.tempFilePath)
      })
      .catch(err => {
        reject('获取失败')
        console.log(err)
      })
    })
  },
  async download() {
    wx.showLoading({
      title: '下载中',
    })
    let fileID = await this.getFileID()
    console.log('fileID', fileID)

    let tempFilePath = await this.downloadFile(fileID)
    console.log(tempFilePath)

    wx.saveFile({
      tempFilePath: tempFilePath,
    })
    .then(res => {
      const savedFilePath = res.savedFilePath;
      // 打开文件
      wx.openDocument({
        filePath: savedFilePath,
        success: function (res) {
          console.log('打开文档成功')
          wx.hideLoading()
        },
      })
    })
    .catch(err => {
      console.log(err)
    })
  },
  getWorkScore: function(totalscores, ctbs) {
    var ctbs_sum = 0
    var processed_totalscores = []
    for (var i = 0; i < ctbs.length; i++) {
      ctbs_sum += ctbs[i]
      processed_totalscores.push(totalscores[i] * ctbs[i])
    }

    var processed_totalscores_sum = 0
    for (var j = 0; j < processed_totalscores.length; j++) {
      processed_totalscores_sum += processed_totalscores[j]
    }

    var workscore = processed_totalscores_sum / ctbs_sum
    workscore = Math.round(workscore * 10) / 10

    return workscore
  },
  getEachscore: function(eachscores, ctbs) {
    var ctbs_sum = 0
    var processed_eachscores = []
    for (var i = 0; i < ctbs.length; i++) {
      ctbs_sum += ctbs[i]
      var temp = []
      for (var j = 0; j < eachscores[i].length; j++) {
        eachscores[i][j] *= ctbs[i]
      }
    }

    var sum_eachscores = []
    for (var i = 0; i < eachscores[0].length; i++) {
      var temp = 0
      for (var j = 0; j < eachscores.length; j++) {
        temp += eachscores[j][i]
      }
      sum_eachscores.push(temp)
    }

    var eachscore = []
    for (var i = 0; i < sum_eachscores.length; i++) {
      var temp = sum_eachscores[i] / ctbs_sum
      temp = Math.round(temp * 10) / 10
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
        .get()
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
      const db = wx.cloud.database()

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
      const db = wx.cloud.database()

      db.collection('work')
        .where({
          _taskid: taskid
        })
        .skip(skip)
        .get()
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
        .skip(skip)
        .get()
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
  toWork: function(e) {
    const taskid = this.data.taskid
    const workid = e.currentTarget.dataset.workid
    console.log(workid)
    console.log(taskid)

    wx.navigateTo({
      url: '../details/details?data=' + taskid + '/' + workid + '/4',
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