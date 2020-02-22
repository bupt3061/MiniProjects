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
  async comment() {
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
      wx.hideLoading()

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
      wx.hideLoading()
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
      wx.hideLoading()
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

    if (arg == '2') {
      for (var i = 0; i < wwcTasks.length; i++) {
        if (wwcTasks[i]._id == taskid) {
          wwcTasks[i].idx += 1
          wwcTasks[i].evaledNum += 1
        }
      }

      console.log('未完成', wwcTasks)
      app.globalData.wwcTasks = wwcTasks
    } else if (arg == '3') {
      var list = []
      var item = null
      for (var i = 0; i < whpTasks.length; i++) {
        if (whpTasks[i]._id == taskid) {
          item = whpTasks[i]
          continue
        }
        list.push(whpTasks[i])
      }

      item.idx += 1
      item.evaledNum += 1
      wwcTasks.push(item)
      whpTasks = list

      console.log('未完成', wwcTasks)
      console.log('未互评', whpTasks)
      app.globalData.whpTasks = whpTasks
      app.globalData.wwcTasks = wwcTasks
    }

    let inEvalTaskData = await this.inEvalTaskData(taskid)
    console.log('inEvalTaskData', inEvalTaskData)

    var inEvalTask = app.globalData.inEvalTask
    inEvalTask.status = true
    inEvalTask.data = inEvalTaskData

    app.globalData.inEvalTask = inEvalTask
    console.log('inEvalTask', inEvalTask)

    wx.navigateBack({
      url: '../details/details'
    })

    wx.hideLoading()
  },
  async inEvalTaskData(taskid) {
    var wwcTasks = app.globalData.wwcTasks
    var evaledNum = 0
    var needEvalNum = 3
    var needEvalWorksList = []
    var randomList = []
    var idx = 0
    var progress = 0
    var hasWork = true
    let work
    var title = null
    var describe = null
    var uploadtime = null
    var workid = null
    var cloudPaths = null
    var pasttime = null
    const show = true
    var data = null
    let tempUrls
    var mid = null
    var marked = null
    var mexisted = null
    let evals
    var evalsNum = null
    const now = new Date()
    const openid = app.globalData.openid
    const canEvaluate = true

    for (var i = 0; i < wwcTasks.length; i++) {
      if (wwcTasks[i]._id == taskid) {
        evaledNum = wwcTasks[i].evaledNum
        needEvalNum = wwcTasks[i].needEvalNum
        progress = (evaledNum / needEvalNum) * 100
        needEvalWorksList = wwcTasks[i].needEvalWorksList
        idx = wwcTasks[i].idx
        randomList = wwcTasks[i].randomList

        console.log('evaledNum', evaledNum)
        console.log('needEvalNum', needEvalNum)
        console.log('progress', progress)
        console.log('idx', idx)
        console.log('randomList', randomList)

        // 是否有作品
        if (needEvalWorksList.length == 0 || idx >= randomList.length) {
          hasWork = false

          data = {
            progress: progress,
            hasWork: hasWork,
            show: show
          }

          return data
        }

        if (hasWork) {
          var index = randomList[idx]
          var _id = needEvalWorksList[index]._id
          work = await this.getNeedEvalWork(_id)
          console.log('work', work)

          // 获得任务信息
          const standard = this.data.standard
          const standardKeys = this.data.standardKeys

          console.log('standard', standard)
          console.log('standardKeys', standardKeys)

          // 获取作品信息
          title = work.title
          describe = work.describe
          uploadtime = work.uploadtime
          workid = work._id
          cloudPaths = work.path

          console.log('title', title)
          console.log('describe', describe)
          console.log('uploadtime', uploadtime)
          console.log('workid', workid)
          console.log('cloudPaths', cloudPaths)

          // 处理时间
          pasttime = this.getTimeBetween(uploadtime, now)
          console.log('pasttime', pasttime)

          // 获得tempUrls
          tempUrls = await this.getTempUrls(cloudPaths)
          console.log('tempUrls', tempUrls)

          // 判断是否收藏
          let mdata = await this.judgeMarked(workid, openid)
          mid = mdata.mid
          marked = mdata.marked
          mexisted = mdata.mexisted

          console.log('mid', mid)
          console.log('marked', marked)
          console.log('mexisted', mexisted)

          /**
           * 获取全部评论
           */
          evals = await this.getEvals(workid)
          evalsNum = evals.length

          if (evalsNum != 0) {
            for (var i = 0; i < evals.length; i++) {
              var res = this.getTimeBetween(evals[i].evaltime, now)
              evals[i].pasttime = res
            }

            for (var i = 0; i < evals.length; i++) {
              // 排序
              for (var j = 0; j < evals.length - i - 1; j++) {
                if (evals[j].evaltime < evals[j + 1].evaltime) {
                  var temp = evals[j]
                  evals[j] = evals[j + 1]
                  evals[j + 1] = temp
                }
              }
            }
          }

          console.log('evals', evals)
          console.log('evalsNum', evalsNum)

          data = {
            progress: progress,
            status: true,
            show: true,
            taskid: taskid,
            work: work,
            title: title,
            describe: describe,
            tempUrls: tempUrls,
            pasttime: pasttime,
            mid: mid,
            mexisted: mexisted,
            marked: marked,
            standard: standard,
            standardKeys: standardKeys,
            evals: evals,
            evalsNum: evalsNum,
            canEvaluate: canEvaluate
          }

          return data
        }
      }
    }
  },
  getNeedEvalWork: function(workid) {
    return new Promise((resolve, reject) => {
      const work = wx.cloud.database().collection('work')

      work.where({
          _id: workid
        }).get()
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
  getTimeBetween: function(startDate, endDate) {
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
  getTempUrls: function(cloudPaths) {
    return new Promise((resolve, reject) => {

      wx.cloud.getTempFileURL({
        fileList: cloudPaths
      }).then(res => {
        // get temp file URL
        const list = res.fileList
        var tempUrls = []

        for (let i = 0; i < list.length; i++) {
          tempUrls.push(list[i].tempFileURL)
        }

        resolve(tempUrls)
      }).catch(error => {
        // handle error
        console.log(error)
        reject('获取失败')
      })
    })
  },
  judgeMarked: function(workid, openid) {
    return new Promise((resolve, reject) => {
      const marked = wx.cloud.database().collection('marked')
      var status = true
      var mexisted = true
      var mid = null

      marked.where({
          _workid: workid,
          _openid: openid
        }).get()
        .then(res => {
          const temp = res.data

          if (temp.length == 0) {
            mid = null
            mexisted = false
            status = false
          } else {
            const data = temp[0]
            mid = data._id
            mexisted = true
            status = data.status
          }
          resolve({
            marked: status,
            mexisted: mexisted,
            mid: mid
          })
        })
        .catch(err => {
          console.log(err)
          reject('获取失败')
        })
    })
  },
  getEvalsCount: function(workid) {
    return new Promise((resolve, reject) => {
      const db = wx.cloud.database()
      const _ = db.command
      const evaluate = db.collection('evaluate')

      evaluate
        .where({
          _workid: workid
        })
        .count()
        .then(res => {
          const total = res.total
          resolve(total);
        }).catch(err => {
          console.log(err)
          reject("查询失败")
        })
    })
  },
  getEvalsIndexSkip: function(workid, skip) {
    return new Promise((resolve, reject) => {
      const db = wx.cloud.database()
      const _ = db.command
      const evaluate = db.collection('evaluate')

      let selectPromise;

      selectPromise = evaluate
        .where({
          _workid: workid,
        })
        .skip(skip)
        .get()

      selectPromise
        .then(res => {
          const data = res.data
          resolve(data);
        })
        .catch(err => {
          console.error(err)
          reject("查询失败!")
        })
    })
  },
  async getEvals(workid) {
    let count = await this.getEvalsCount(workid)
    let list = []

    if (count == 0) {
      return list
    }

    for (let i = 0; i < count; i += 20) {
      let res = await this.getEvalsIndexSkip(workid, i)
      console.log('res', res)
      list = list.concat(res)

      if (list.length == count) {
        return list
      }
    }
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