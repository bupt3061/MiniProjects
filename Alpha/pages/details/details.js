// pages/detail/details.js

const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    arg: null,
    backgroundColor: "#f3f4f5",
    activeColor: "#14d1b5",
    strokeWidth: 2,
    progress: null,
    status: false,
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
    var wwcTasks = app.globalData.wwcTasks
    var whpTasks = app.globalData.whpTasks
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
    } else {
      /**
       * 2：互评
       * 1、若已存在互评信息则直接获取，包括：
       * work：作品信息
       * evaledNum：已互评任务数
       * needEvalNum：未互评任务数
       * 2、若不存在则获取并存储到全局
       */
      var progress = 0
      var evaledNum = 0
      var needEvalNum = 0
      var needEvalWorksList = []
      var randomList = []
      var idx = 0
      var flag = false // 全局是否已存在该互评作品的信息，默认不存在

      canEvaluate = true

      if (arg == '2') { // 未完成
        /**
         * 1、判断未完成任务里是否有互评信息
         * 2、evaledNum：已互评数
         * 3、needEvalNum：需互评数
         * 4、needEvalWorkList: 需要互评的作品列表
         * 5、idx：当前索引位置
         */
        for (var i = 0; i < wwcTasks.length; i++) {
          if (wwcTasks[i]._id == taskid) {
            evaledNum = wwcTasks[i].evaledNum
            console.log('evaledNum', evaledNum)
            if (wwcTasks[i].needEvalWorksList) {
              flag = true  // 存在信息
              console.log('存在互评信息')

              needEvalNum = wwcTasks[i].needEvalNum
              console.log('needEvalNum', needEvalNum)

              progress = (evaledNum / needEvalNum) * 100
              console.log('progress', progress)

              // 获取作品信息
              idx = wwcTasks[i].idx
              randomList = wwcTasks[i].randomList
              var index = randomList[idx]
              needEvalWorksList = wwcTasks[i].needEvalWorksList
              var _id = needEvalWorksList[index]._id
              work = await this.getNeedEvalWork(_id)
              console.log('work', work)
              console.log('idx', idx)
              console.log('randomList', randomList)
              console.log('index', index)
              console.log('needEvalWorksList', needEvalWorksList)

              if (!work) {
                console.log('无作品')
                this.setData({
                  progress: progress,
                  hasWork: false,
                  status: true
                })
                wx.hideLoading()

                return
              }
            }
          }
        }
      } else if (arg == '3') { // 未互评
        evaledNum = 0
        console.log('evaledNum', evaledNum)
      }

      if(!flag) {
        console.log('不存在互评信息')

        // 获得所有作品总数，取其五分之一作为需要互评的作品数
        let worksCount = await this.getWorksCount(taskid)
        console.log('worksCount', worksCount)

        needEvalNum = Math.ceil(worksCount / 20)

        if (needEvalNum < 1) {
          needEvalNum = 1
        }

        progress = (evaledNum / needEvalNum) * 100
        console.log('progress', progress)
        console.log('needEvalNum', needEvalNum)

        // 获取已评价作品
        let evaledWorks = await this.getEvaledWorks(openid, taskid)
        var evaledWorkids = []

        for(var i = 0; i < evaledWorks.length; i++) {
          evaledWorkids.push(evaledWorks[i]._id)
        }

        console.log('evaledWorks', evaledWorks)
        console.log('evaledWorkids', evaledWorkids)

        // 获取所有待互评任务
        let needEvalWorksCount = await this.getNeedEvalWorksCount(evaledWorkids, taskid, openid)
        console.log('needEvalWorksCount', needEvalWorksCount)

        if (needEvalWorksCount == 0) {
          console.log('无作品')

          this.setData({
            progress: progress,
            hasWork: false,
            status: true
          })

          wx.hideLoading()

          return
        }

        for (var i = 0; i < needEvalWorksCount; i += 20) {
          let res = await this.getNeedEvalWorksSkip(evaledWorkids, taskid, openid, i)
          needEvalWorksList = needEvalWorksList.concat(res)

          if (needEvalWorksList.length == needEvalWorksCount) {
            break
          }
        }

        console.log('needEvalWorksList', needEvalWorksList)

        for(var i = 0; i < needEvalWorksCount; i++) {
          randomList.push(i)
        }
        randomList = randomList.sort(this.randomsort)
        console.log('randomList', randomList)

        // 更新全局数据
        if(arg == '2') {
          for(var i = 0; i < wwcTasks.length; i++) {
            if(wwcTasks[i]._id == taskid) {
              wwcTasks[i].needEvalNum = needEvalNum
              wwcTasks[i].randomList = randomList
              wwcTasks[i].needEvalWorksList = needEvalWorksList
              wwcTasks[i].idx = idx
              break
            }
          }
          
          console.log('未完成', wwcTasks)
          app.globalData.wwcTasks = wwcTasks
        } else if(arg == '3') {
          for (var i = 0; i < whpTasks.length; i++) {
            if (whpTasks[i]._id == taskid) {
              whpTasks[i].needEvalNum = needEvalNum
              whpTasks[i].randomList = randomList
              whpTasks[i].needEvalWorksList = needEvalWorksList
              whpTasks[i].idx = idx
              break
            }
          }

          console.log('未互评', whpTasks)
          app.globalData.whpTasks = whpTasks
        }

        var idx = 0
        var _id = needEvalWorksList[randomList[idx]]._id
        work = await this.getNeedEvalWork(_id)
      }

      /**
       * 处理work信息
       */
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
      })
    }
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
    // 获取已提交作品信息
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
  getNeedEvalWorksCount: function (evaledWorkids, taskid, openid) {
    return new Promise((resolve, reject) => {
      const db = wx.cloud.database()
      const _ = db.command

      db.collection("work")
        .where({
          _id: _.nin(evaledWorkids),
          _taskid: taskid,
          _openid: _.nin([openid,])
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
  getNeedEvalWorksSkip: function(evaledWorkids, taskid, openid, skip) {
    return new Promise((resolve, reject) => {
      const db = wx.cloud.database()
      const _ = db.command

      db.collection("work")
        .where({
          _id: _.nin(evaledWorkids),
          _taskid: taskid,
          _openid: _.nin([openid,])
        })
        .skip(skip)
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
  toComment: function () {
    const workid = this.data.work._id
    const taskid = this.data.taskid
    const arg = this.data.arg

    wx.navigateTo({
      url: '../comment/comment?data=' + workid + '/' + taskid + '/' + arg,
    })
  },
  randomsort: function (a, b) {
    return Math.random() > .5 ? -1 : 1
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

    this.setData({
      arg: arg
    })

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