// pages/detail/details.js

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
    marked: false,
    title: null,
    time: null,
    status: null
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


  },
  /**
   * 其他函数
   */
  marked: function() {
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
  getEvalsCount: function (courseid, date) {
    return new Promise((resolve, reject) => {
      const db = wx.cloud.database()
      const _ = db.command
      const task = db.collection('task')

      task.where({
        _courseid: courseid,
        uploadstart: _.lte(date)
      }).count().then(res => {
        const total = res.total
        resolve(total);
      }).catch(err => {
        console.log(err)
        reject("查询失败")
      })
    })
  },
  getTasksIndexSkip: function (courseid, skip, date) {
    return new Promise((resolve, reject) => {
      const db = wx.cloud.database()
      const _ = db.command
      const task = db.collection('task')

      let statusList = []
      let selectPromise;

      selectPromise = task.where({
        _courseid: courseid,
        uploadstart: _.lte(date)
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
  getTeacherInfo: function (openid) {
    return new Promise((resolve, reject) => {
      const user = wx.cloud.database().collection('user')

      user.where({
        _openid: openid
      })
        .get()
        .then(res => {
          const teacher = res.data[0]
          resolve(teacher)
        })
        .catch(err => {
          console.log(err)
          reject('获取失败')
        })
    })
  },
  async getTasks(courseid, date) {
    let count = await this.getTasksCount(courseid, date)
    let list = []

    for (let i = 0; i < count; i += 10) {
      let res = await this.getTasksIndexSkip(courseid, i, date)
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