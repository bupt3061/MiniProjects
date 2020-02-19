// pages/detail/details.js

const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    taskid: null,
    work: null,
    title: null,
    describe: null,
    pasttime: null,
    mid: null,
    mexisted: false,
    marked: false,
    standard: null,
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
  },
  /**
   * 初始化函数
   */
  async init(taskid, status) {
    const openid = app.globalData.openid
    const now = new Date()

    // 获取作品
    let work = await this.getWork(taskid, openid)
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
    const pasttime = this.getTimeBetween(now, uploadtime) + '前'
    console.log('pasttime', pasttime)

    // 获得tempUrls
    let tempUrls = await this.getTempUrls(cloudPaths)
    console.log(tempUrls)

    // 判断是否收藏
    let mdata = await this.judgeMarked(workid, openid)
    const mid = mdata.mid
    const marked = mdata.marked
    const mexisted = mdata.mexisted

    console.log('mid', mid)
    console.log('marked', marked)
    console.log('mexisted', mexisted)

    /**
     *  判断是否可以评价：
     * 1、自己的不可评价
     * 2、已过期不可评价
     */
    // 获取task信息
    let task = await this.getTask(taskid)
    const standard = task.standard
    const evaluateend = task.evaluateend

    console.log('standard', standard)

    // 判断自己是否可评价
    var canEvaluate = true
    if(openid == work._openid) {
      canEvaluate = false
    }

    // 判断是否过期
    if(now > evaluateend) {
      canEvaluate = false
    }

    console.log("canEvaluate", canEvaluate)

    /**
     * 获取全部评论
     */
    let evals = await this.getEvals(workid)
    const evalsNum = evals.length
    console.log('evals', evals)

    // 设置数据
    this.setData({
      taskid: taskid,
      work: work,
      title: title,
      describe: describe,
      pasttime: pasttime,
      mid: mid,
      mexisted: mexisted,
      marked: marked,
      standard: standard,
      canEvaluate: canEvaluate,
      evals: evals,
      evalsNum: evalsNum,
    })
  },
  /**
   * 其他函数
   */
  marked: function() {
    const marked = wx.cloud.database().collection('marked')

    if(this.data.mexisted) {
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

      data = {
        markedtime: now,
        _workid: this.data.work._id,
        status: true
      }

      marked.add({
        data
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
  cancleMarked: function () {
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
  getTimeBetween: function (startDate, endDate) {
    var days = (startDate - endDate) / (1 * 24 * 60 * 60 * 1000)
    var timeString = null

    if (days < 1) {
      var hours = days * 24
      timeString = Math.floor(hours).toString() + "小时"

      if (hours < 1) {
        var mins = hours * 60
        timeString = Math.floor(mins).toString() + "分钟"
      }
    } else if (days >= 1) {
      timeString = Math.floor(days).toString() + "天"
    }

    return timeString
  },
  getTempUrls: function (cloudPaths) {
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
  getTask: function(taskid) {
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
  getEvalsCount: function (workid) {
    return new Promise((resolve, reject) => {
      const db = wx.cloud.database()
      const _ = db.command
      const evaluate = db.collection('evaluate')

      evaluate.where({
        _workid: workid
      }).count().then(res => {
        const total = res.total
        resolve(total);
      }).catch(err => {
        console.log(err)
        reject("查询失败")
      })
    })
  },
  getEvalsIndexSkip: function (workid, skip) {
    return new Promise((resolve, reject) => {
      const db = wx.cloud.database()
      const _ = db.command
      const evaluate = db.collection('evaluate')

      let selectPromise;

      selectPromise = evaluate.where({
        _workid: workid,
      }).skip(skip).get()

      selectPromise.then(res => {
        const data = res.data
        resolve(data);
      }).catch(err => {
        console.error(err)
        reject("查询失败!")
      })
    })
  },
  async getEvals(workid) {
    let count = await this.getEvalsCount(workid)
    let list = []

    for (let i = 0; i < count; i += 10) {
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
  onLoad: function (options) {
    const taskid = options.taskid

    console.log('taskid', taskid)

    this.init(taskid)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})