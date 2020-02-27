// pages/worklist/worklist.js
const app = getApp()
const st = require('../../utils/string.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    hasWork: false,
    works: null,
    workids: null,
    show: false,
    taskid: null,
    arg: null,
    content: null
  },
  /**
   * 初始化函数
   */
  async init(arg) {
    let workids
    let works
    let hasWork

    wx.showLoading({
      title: '加载中',
    })

    if (arg == '1') {
      // 来自我的课程
      console.log('test, 课程')
      const taskid = this.data.taskid

      let taskWorksCount = await this.getTaskWorksCount(taskid)
      console.log('taskWorksCount', taskWorksCount)

      if (taskWorksCount == 0) {
        wx.hideLoading()
        app.globalData.worksList[taskid] = []

        this.setData({
          hasWork: false,
          show: true,
          content: '暂无作品'
        })

        return
      }

      works = []
      for (var i = 0; i < taskWorksCount; i += 20) {
        let res = await this.getTaskWorksSkip(taskid, i)
        works = works.concat(res)

        if (works.length == taskWorksCount) {
          break
        }
      }

      workids = []
      for (var i = 0; i < works.length; i++) {
        workids.push(works[i]._id)
      }

      console.log('works', works)
      console.log('workids', workids)
    } else if (arg == '2') {
      // 来自我的收藏
      const openid = app.globalData.openid

      let markedWorksCount = await this.getMarkedWorksCount(openid)
      console.log('markedWorksCount', markedWorksCount)

      if (markedWorksCount == 0) {
        wx.hideLoading()

        this.setData({
          hasWork: false,
          show: true,
          content: '暂无收藏'
        })

        return
      }

      var markedWorks = []
      for (var i = 0; i < markedWorksCount; i += 20) {
        let res = await this.getMarkedWorksSkip(openid, i)
        markedWorks = markedWorks.concat(res)

        if (markedWorks.length == markedWorksCount) {
          break
        }
      }
      console.log('markedWorks', markedWorks)

      var markedWorkids = []
      for (var i = 0; i < markedWorks.length; i++) {
        markedWorkids.push(markedWorks[i]._workid)
      }
      console.log('markedWorkids', markedWorkids)

      works = []
      for (var i = 0; i < markedWorksCount; i += 20) {
        let res = await this.getWorksSkip(markedWorkids, i)
        works = works.concat(res)

        if (works.length == markedWorksCount) {
          break
        }
      }

      var temp = []
      for (var i = 0; i < markedWorkids.length; i++) {
        for (var j = 0; j < works.length; j++) {
          if (markedWorkids[i] == works[j]._id) {
            temp.push(works[j])
            break
          }
        }
      }

      works = temp
      workids = markedWorkids
      console.log('works', works)
      console.log('workids', workids)
    } else if(arg == '3') {  // 新添加
      workids = this.data.workids
      console.log('workids', workids)

      works = await this.getWorks(workids)
    }

    // 获取评论数
    for (var i = 0; i < works.length; i++) {
      let evalNum = await this.getEvalNum(works[i]._id)
      works[i].evalNum = evalNum
    }
    console.log('works', works)

    // 获取用户信息
    for (var i = 0; i < works.length; i++) {
      let info = await this.getInfo(works[i]._openid)
      works[i].userInfo = info
    }
    console.log('works', works)

    // 获取封面
    for (var i = 0; i < works.length; i++) {
      let workCover = await this.getWorkCover(works[i].path[0])
      works[i].workCover = workCover
    }
    console.log('works', works)

    // 处理长字符串
    for (var i = 0; i < works.length; i++) {
      works[i].titleh = st.handleWorkName(works[i].title)
    }
    console.log('works', works)

    // 排序
    for (var i = 0; i < works.length; i++) {
      // 排序
      for (var j = 0; j < works.length - i - 1; j++) {
        if (works[j].uploadtime < works[j + 1].uploadtime) {
          var temp = works[j]
          works[j] = works[j + 1]
          works[j + 1] = temp
        }
      }
    }
    console.log('works', works)

    // 更新数据
    if (arg == '1') {
      app.globalData.worksList[this.data.taskid] = works
    } else if (arg == '2') {
      app.globalData.markedWorksList = works
    } else if(arg == '3') {
      works = works.concat(app.globalData.markedWorksList)
      app.globalData.markedWorksList = works

      console.log(works)
    }
    wx.hideLoading()

    this.setData({
      works: works,
      hasWork: true,
      show: true
    })
  },
  /**
   * 其他函数
   */
  getTaskWorksCount: function(taskid) {
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
          console.log(err)
          reject('获取失败')
        })
    })
  },
  getTaskWorksSkip: function(taskid, skip) {
    return new Promise((resolve, reject) => {
      const db = wx.cloud.database()

      db.collection('work')
        .where({
          _taskid: taskid
        })
        .skip(skip)
        .orderBy('uploadtime', 'desc')
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
  getMarkedWorksCount: function(openid) {
    return new Promise((resolve, reject) => {
      const db = wx.cloud.database()

      db.collection('marked')
        .where({
          _openid: openid,
          status: true
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
  getMarkedWorksSkip: function(openid, skip) {
    return new Promise((resolve, reject) => {
      const db = wx.cloud.database()

      db.collection('marked')
        .where({
          _openid: openid,
          status: true
        })
        .skip(skip)
        .orderBy('markedtime', 'desc')
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
  getWorksSkip: function(markedWorkids, skip) {
    return new Promise((resolve, reject) => {
      const db = wx.cloud.database()
      const _ = db.command

      db.collection('work')
        .where({
          _id: _.in(markedWorkids)
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
  getWorkCover: function(cloudPath) {
    return new Promise((resolve, reject) => {
      wx.cloud.downloadFile({
          fileID: cloudPath
        })
        .then(res => {
          resolve(res.tempFilePath)
        })
        .catch(err => {
          console.log(err)
          reject('获取失败')
        })
    })
  },
  getWorks: function(workids) {
    return new Promise((resolve, reject) => {
      const db = wx.cloud.database()
      const _ = db.command

      db.collection('work')
      .where({
        _id: _.in(workids)
      })
      .get()
      .then(res => {
        const data = res.data
        resolve(data)
      })
      .catch(err => {
        reject('获取失败')
        console.log(err)
      })
    })
  },
  getEvalNum: function(workid) {
    return new Promise((resolve, reject) => {
      const db = wx.cloud.database()

      db.collection('evaluate')
        .where({
          _workid: workid
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
  getInfo: function(openid) {
    return new Promise((resolve, reject) => {
      const db = wx.cloud.database()

      db.collection('user')
        .where({
          _openid: openid
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
  async clickWork(e) {
    const workid = e.currentTarget.dataset.workid
    const taskid = e.currentTarget.dataset.taskid
    console.log(workid)

    wx.navigateTo({
      url: '../details/details?data=' + taskid + '/' + workid + '/4',
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const arg = app.globalData.wlArg
    console.log('test, onLoad执行了')

    if (arg == '1') {
      const taskid = app.globalData.wlTaskid
      const worksList = app.globalData.worksList
      console.log('taskid', taskid)
      console.log('worksList', worksList)
      console.log('1:', worksList[taskid])

      if (worksList[taskid]) {
        if (worksList[taskid].length == 0) {
          this.setData({
            hasWork: false,
            content: '暂无作品',
            show: true
          })

          return
        }

        this.setData({
          works: worksList[taskid],
          hasWork: true,
          show: true
        })

        return
      }

      this.setData({
        taskid: taskid
      })
    } else if (arg == '2') {
      const markedWorksList = app.globalData.markedWorksList
      console.log('2:', markedWorksList)

      const newAddedCourseids = app.globalData.newAddedCourseids
      const processedAddedIds = app.globalData.processedAddedIds
      console.log('test', newAddedCourseids)
      console.log('test', processedAddedIds)

      if (processedAddedIds.length < newAddedCourseids.length) {
        const arg = '3'

        var workids = []
        for (var i = 0; i < newAddedCourseids.length; i++) {
          var flag = true
          for (var j = 0; j < processedAddedIds.length; j++) {
            if (newAddedCourseids[i] == processedAddedIds[j]) {
              flag = false
              continue
            }
          }
          if (flag) {
            workids.push(newAddedCourseids[i])
          }
        }

        if (markedWorksList.length != 0) {
          this.setData({
            works: markedWorksList,
            hasWork: true,
            show: true
          })
        } else {
          this.setData({
            hasWork: false,
            show: true
          })
        }

        this.setData({
          workids: workids
        })

        this.init(arg)
        console.log(workids)

        // 更新数据
        var newProcessedAddedIds = workids.concat(app.globalData.processedAddedIds)
        app.globalData.processedAddedIds = newProcessedAddedIds

        return
      }

      if (markedWorksList.length != 0) {
        this.setData({
          works: markedWorksList,
          hasWork: true,
          show: true
        })

        return
      }
    }

    this.setData({
      arg: arg
    })

    this.init(arg)
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
    const arg = app.globalData.wlArg

    if (arg == '1') {
      const taskid = app.globalData.wlTaskid
      const worksList = app.globalData.worksList
      console.log('taskid', taskid)
      console.log('worksList', worksList)
      console.log('1:', worksList[taskid])

      if (worksList[taskid]) {
        if (worksList[taskid].length == 0) {
          this.setData({
            hasWork: false,
            content: '暂无作品',
            show: true
          })

          return
        }

        this.setData({
          works: worksList[taskid],
          hasWork: true,
          show: true
        })

        return
      }

      this.setData({
        taskid: taskid
      })
    } else if (arg == '2') {
      const markedWorksList = app.globalData.markedWorksList

      const newAddedCourseids = app.globalData.newAddedCourseids
      const processedAddedIds = app.globalData.processedAddedIds
      console.log('test', newAddedCourseids)
      console.log('test', processedAddedIds)

      if (processedAddedIds.length < newAddedCourseids.length) {
        const arg = '3'

        var workids = []
        for (var i = 0; i < newAddedCourseids.length; i++) {
          var flag = true
          for (var j = 0; j < processedAddedIds.length; j++) {
            if (newAddedCourseids[i] == processedAddedIds[j]) {
              flag = false
              continue
            }
          }
          if (flag) {
            workids.push(newAddedCourseids[i])
          }
        }

        if (markedWorksList.length != 0) {
          this.setData({
            works: markedWorksList,
            hasWork: true,
            show: true
          })
        } else {
          this.setData({
            hasWork: false,
            show: true
          })
        }

        this.setData({
          workids: workids
        })

        this.init(arg)
        console.log(workids)

        return
      }

      if (markedWorksList.length != 0) {
        console.log('2:', markedWorksList)        
        this.setData({
          works: markedWorksList,
          hasWork: true,
          show: true
        })

        return
      }
    }

    this.setData({
      arg: arg
    })

    this.init(arg)
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