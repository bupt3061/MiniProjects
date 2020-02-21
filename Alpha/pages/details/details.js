// pages/detail/details.js

const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    hasWork: true,
    taskid: null,
    work: null,
    title: '',
    describe: '',
    tempUrls: null,
    pasttime: '',
    mid: null,
    mexisted: false,
    marked: false,
    standard: null,
    standardKeys: null,
    canEvaluate: false,
    evals: null,
    evalsNum: 0,
    duration: 1000,
    content: null,
    $zanui: {
      toptips: {
        show: false
      }
    },
    progress: null
  },
  /**
   * 初始化函数
   */
  async init(taskid, arg) {
    const openid = app.globalData.openid
    const now = new Date()
    let work
    var canEvaluate = false // 默认不能评论

    wx.showLoading({
      title: '加载中',
    })

    if (arg == '1') {
      /**
       * 1：查看
       */
      work = await this.getWork(taskid, openid)
    } else if (arg == '2') {
      /**
       * 2：互评
       */
      canEvaluate = true

      // 获得所有作品总数，取其五分之一作为需要互评的作品数
      let worksCount = await this.getWorksCount(taskid)
      console.log('worksCount', worksCount)

      var num = Math.ceil(worksCount / 20)

      if(num < 1) {
        num = 1
      }

      console.log('num', num)

      // 获得评价过的所有作品
      let evaledWorks = await this.getEvaledWorks(openid, taskid)

      var evaledWorkids = []
      for (var i = 0; i < evaledWorks.length; i++) {
        evaledWorkids.push(evaledWorks[i]._workid)
      }
      var evaledNum = evaledWorkids.length
      var needEvalNum = num - evaledNum
      console.log('evaledWorkids', evaledWorkids)
      console.log('evaledNum', evaledNum)

      var progress = (evaledNum / num) * 100
      console.log('progress', progress)

      // 获取随机数
      var randList = []
      for (var i = 0; i < needEvalNum; i++) {
        var temp = Math.floor(Math.random() * worksCount);
        randList.push(temp)
      }

      console.log('randList', randList)

      // 获得需要评价的作品
      var needEvalTasks = []
      for (var i = 0; i < needEvalNum; i++) {
        let temp = await this.getNeedEvalTask(evaledWorkids, taskid, openid, randList[i])
        needEvalTasks.push(temp)
      }
      console.log('needEvalTasks', needEvalTasks)

      work = needEvalTasks[0]

      if (!work) {
        console.log('无作品')
        this.setData({
          hasWork: false
        })
        wx.hideLoading()

        return
      }

    }

    // 获得任务信息
    let taskInfo = await this.getTaskInfo(taskid)
    const standard = taskInfo.standard
    const standardKeys = Object.keys(standard)

    console.log('standard', standard)
    console.log('standardKeys', standardKeys)
    app.globalData.standard = standard
    app.globalData.standardKeys = standardKeys

    // 获取作品信息
    const title = work.title
    const describe = work.describe
    const uploadtime = work.uploadtime
    const workid = work._id
    const cloudPaths = work.path

    console.log('work', work)
    console.log('title', title)
    console.log('describe', describe)
    console.log('uploadtime', uploadtime)
    console.log('workid', workid)
    console.log('cloudPaths', cloudPaths)

    // 处理时间
    const pasttime = this.getTimeBetween(uploadtime, now)
    console.log('pasttime', pasttime)

    // 获得tempUrls
    let tempUrls = await this.getTempUrls(cloudPaths)
    console.log('tempUrls', tempUrls)

    // 判断是否收藏
    let mdata = await this.judgeMarked(workid, openid)
    const mid = mdata.mid
    const marked = mdata.marked
    const mexisted = mdata.mexisted

    console.log('mid', mid)
    console.log('marked', marked)
    console.log('mexisted', mexisted)

    /**
     * 获取全部评论
     */
    let evals = await this.getEvals(workid)
    const evalsNum = evals.length

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

    wx.hideLoading()

    this.setData({
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
    })
  },
  /**
   * 其他函数
   */
  marked: function() {
    const marked = wx.cloud.database().collection('marked')

    if (this.data.mexisted) {
      marked.where({
          _id: this.data.mid
        }).update({
          data: {
            status: true
          }
        })
        .then(res => {
          console.log('res', res)
        })
        .catch(err => {
          console.log('err', err)
        })
    } else {
      const now = new Date()

      marked.add({
          data: {
            markedtime: now,
            _workid: this.data.work._id,
            status: true
          }
        })
        .then(res => {
          console.log(res)
        })
        .catch(err => {
          console.log(err)
        })
    }

    this.setData({
      marked: true,
      $zanui: {
        toptips: {
          show: true
        }
      },
      content: '已收藏'
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

  },
  cancleMarked: function() {
    const marked = wx.cloud.database().collection('marked')

    marked.where({
        _id: this.data.mid
      }).update({
        data: {
          status: false
        }
      })
      .then(res => {
        console.log('res', res)
      })
      .catch(err => {
        console.log('err', err)
      })

    this.setData({
      marked: false,
      $zanui: {
        toptips: {
          show: true
        }
      },
      content: '取消收藏'
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

  },
  getWork: function(taskid, openid) {
    return new Promise((resolve, reject) => {
      const work = wx.cloud.database().collection('work')

      work.where({
          _openid: openid,
          _taskid: taskid
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

    if (days > 30) {
      var months = days / 30
      timeString = Math.floor(months).toString() + "月前"

      if (days >= 365) {
        var years = days / 365
        timeString = Math.floor(years).toString() + "年前"
      }
    } else if (days < 2) {
      var hours = days * 24
      timeString = Math.floor(hours).toString() + "小时前"

      if (hours < 1) {
        var mins = hours * 60
        timeString = Math.floor(mins).toString() + "分钟前"

        if (mins < 1) {
          timeString = "刚刚"
        }
      }
    } else {
      timeString = Math.floor(days).toString() + "天"
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
  getTaskInfo: function(taskid) {
    return new Promise((resolve, reject) => {
      const task = wx.cloud.database().collection('task')

      task.where({
          _id: taskid
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
  preview: function(e) {
    const url = e.currentTarget.dataset.url
    var tempUrls = this.data.tempUrls
    var idx = 0
    var list = []

    for (var i = 0; i < tempUrls.length; i++) {
      list.push(tempUrls[i])
      if (tempUrls[i] == url) {
        idx = i
      }
    }

    wx.previewImage({
      current: tempUrls[idx], //当前预览的图片
      urls: tempUrls, //所有要预览的图片
    })
  },
  toComment: function() {
    const workid = this.data.work._id
    const taskid = this.data.taskid

    wx.navigateTo({
      url: '../comment/comment?data=' + workid + '/' + taskid,
    })
  },
  getEvaledWorks: function(openid, taskid) {
    return new Promise((resolve, reject) => {
      const db = wx.cloud.database()
      const _ = db.command

      db.collection('evaluate')
        .where({
          _openid: openid,
          _taskid: taskid
        })
        .field({
          _workid: true
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
  getNeedEvalTask: function(evaledWorkids, taskid, openid, skip) {
    return new Promise((resolve, reject) => {
      const db = wx.cloud.database()
      const _ = db.command

      db.collection("work")
        .where({
          _id: _.nin(evaledWorkids),
          _taskid: taskid,
          _openid: _.nin([openid, ])
        })
        .skip(skip)
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
  getNeedEvalTasksCount: function(evaledWorkids, taskid, openid) {
    return new Promise((resolve, reject) => {
      const db = wx.cloud.database()
      const _ = db.command

      db.collection("work")
        .where({
          _id: _.nin(evaledWorkids),
          _taskid: taskid,
          _openid: _.nin([openid, ])
        })
        .count()
        .then(res => {
          const total = res.total
          resolve(total)
        })
        .catch(err => {
          console.log(err)
          reject('获取失败')
        })
    })
  },
  getWorksCount: function(taskid) {
    return new Promise((resolve, reject) => {
      const db = wx.cloud.database()
      const _ = db.command

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
          console.log(err)
          reject('获取失败')
        })
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const list = options.data.split('/')
    const taskid = list[0]
    const arg = list[1]

    console.log('taskid', taskid)
    console.log('arg', arg)

    this.init(taskid, arg)
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