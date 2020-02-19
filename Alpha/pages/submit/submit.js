// pages/submit/submit.js
const app = getApp()

const dt = require('../../utils/date.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    taskid: null,
    title: null,
    placeholder: null,
    describe: null,
    files: [],
    title_len: 0,
    desc_len: 0,
    screenWidth: 0,
    width: 0,
    margin: 0,
    disabled: true,
    status: true
  },
  /**
   * 初始化函数
   */
  async init(path) {
    let files = await this.getFiles(path)
    console.log('files', files)

    this.setData({
      files: files
    })
  },
  /**
   * 页面其他函数
   */
  async submit() {
    var tasks = app.globalData.tasks
    var kxg_tasks = app.globalData.kxg_tasks
    const openid = app.globalData.openid
    var title = this.data.title
    const taskid = this.data.taskid
    const describe = this.data.describe
    const date = new Date()
    const files = this.data.files
    var paths = []
    var names = []
    var cloudPaths = []

    if (title == null) {
      title = this.data.placeholder
    }

    // 上传图片到云端
    wx.showLoading({
      title: '上传中',
    })

    for (var i = 0; i < files.length; i++) {
      paths.push(files[i].path)
      names.push(files[i].name)
    }

    var temp = null
    for (var i = 0; i < paths.length; i++) {
      let temp = await this.uploadFile(names[i], paths[i])
      cloudPaths.push(temp)
    }

    console.log('paths', paths)
    console.log('names', names)
    console.log('提交', cloudPaths)

    // 上传到数据库
    const data = {
      _taskid: taskid,
      uploadtime: date,
      title: title,
      describe: describe,
      path: cloudPaths
    }

    let workid = await this.addItem(data)

    /**
     * 更新数据
     */
    // 增加用户contribution
    const db = wx.cloud.database()
    const _ = db.command

    db.collection('user').where({
      _openid: openid
    }).update({
      data: {
        contribution: _.inc(1)
      }
    })
    .then(res => {
      console.log('增加贡献值')
      console.log(res)
    })
    .catch(err => {
      console.log(err)
    })

    // 更新未提交数据
    var wtj_tasks = app.globalData.wtj_tasks
    var temp = []
    var item = null

    for (var i = 0; i < wtj_tasks.length; i++) {
      if (wtj_tasks[i]._id != taskid) {
        temp.push(wtj_tasks[i])
      } else {
        item = wtj_tasks[i]
      }
    }

    console.log('全局未提交', temp)
    app.globalData.wtj_tasks = temp

    // 更新所有任务数据
    item.uploaded = true
    item.work = {
      workid: workid,
      _taskid: taskid,
      uploadtime: date,
      title: title,
      describe: describe,
      path: cloudPaths
    }

    for (var i = 0; i < tasks.length; i++) {
      if (tasks[i]._id == taskid) {
        tasks[i] = item
      }
    }

    console.log('全局所有', tasks)
    app.globalData.tasks = tasks

    // 更新可修改数据
    var temp = []
    temp[0] = item
    for (var i = 0; i < kxg_tasks.length; i++) {
      temp[i + 1] = kxg_tasks[i]
    }

    console.log('全局可修改', temp)
    app.globalData.kxg_tasks = temp

    app.globalData.uploadNum = app.globalData.uploadNum - 1

    // 跳转
    wx.redirectTo({
      url: '../success/success',
    })
  },
  async update() {
    var tasks = app.globalData.tasks
    var kxg_tasks = app.globalData.kxg_tasks
    const openid = app.globalData.openid
    const taskid = this.data.taskid
    const title = this.data.title
    const describe = this.data.describe
    const files = this.data.files
    var paths = []
    var names = []
    var cloudPaths = []

    console.log(describe)

    // 上传到云端
    wx.showLoading({
      title: '上传中',
    })

    for (var i = 0; i < files.length; i++) {
      paths.push(files[i].path)
      names.push(files[i].name)
      if (files[i].cloudPath == null) {
        cloudPaths.push(false)
      } else {
        cloudPaths.push(files[i].cloudPath)
      }
    }

    console.log('paths', paths)
    console.log('names', names)
    console.log('cloudPaths', cloudPaths)

    var temp = null
    for (var i = 0; i < paths.length; i++) {
      if (!cloudPaths[i]) {
        let temp = await this.uploadFile(names[i], paths[i])
        cloudPaths[i] = temp
      }
    }

    console.log('修改', cloudPaths)

    // 上传数据库
    const db = wx.cloud.database()
    const work = db.collection('work')

    const data = {
      title: title,
      describe: describe,
      path: cloudPaths
    }

    work.where({
      _openid: openid,
      _taskid: taskid
    }).update({
      data,
      success: res => {
        console.log(res)
      },
      fail: err => {
        console.log(err)
        console.log('更新失败')
      }
    })

    /**
     * 更新全局数据
     */

    // 更新所有任务数据
    for (var i = 0; i < tasks.length; i++) {
      if (tasks[i]._id == taskid) {
        tasks[i].work.title = title
        tasks[i].work.describe = describe
        tasks[i].work.path = cloudPaths
      }
    }

    console.log('全局所有', tasks)
    app.globalData.tasks = tasks

    // 更新可修改数据
    for (var i = 0; i < kxg_tasks.length; i++) {
      if (kxg_tasks[i]._id == taskid) {
        kxg_tasks[i].work.title = title
        kxg_tasks[i].work.describe = describe
        kxg_tasks[i].work.path = cloudPaths
      }
    }

    console.log('全局可修改', kxg_tasks)
    app.globalData.kxg_tasks = kxg_tasks

    // 跳转
    wx.redirectTo({
      url: '../success/success',
    })

    wx.hideLoading()
  },
  uploadFile: function(name, path) {
    return new Promise((resolve, reject) => {
      wx.cloud.uploadFile({
        cloudPath: 'work/' + name,
        filePath: path, // 文件路径
      }).then(res => {
        const fileID = res.fileID
        resolve(fileID)
      }).catch(error => {
        // handle error
        console.log(error)
        reject(error)
      })
    })
  },
  deleteItem: function(e) {
    const name = e.currentTarget.dataset.name
    var files = this.data.files
    var disabled = false
    var temp = []

    for (var i = 0; i < files.length; i++) {
      if (files[i].name != name) {
        temp.push(files[i])
      }
    }

    if (temp.length == 0) {
      disabled = true
    }

    this.setData({
      files: temp,
      disabled: disabled
    })
  },
  preview: function(e) {
    const path = e.currentTarget.dataset.path
    var files = this.data.files
    var idx = 0
    var paths = []

    for (var i = 0; i < files.length; i++) {
      paths.push(files[i].path)
      if (files[i].path == path) {
        idx = i
      }
    }

    wx.previewImage({
      current: paths[idx], //当前预览的图片
      urls: paths, //所有要预览的图片
    })
  },
  async addFiles() {
    let filesSrc = await this.chooseFile()
    console.log(filesSrc)

    if (filesSrc.length != 0) {
      this.setData({
        disabled: false,
        files: this.data.files.concat(filesSrc)
      })
    }
  },
  chooseFile: function() {
    return new Promise((resolve, reject) => {
      wx.chooseMessageFile({
        count: 10,
        type: 'image',
        success(res) {
          // tempFilePath可以作为img标签的src属性显示图片
          resolve(res.tempFiles)
        }
      })
    })
  },
  titleinput: function(e) {
    this.setData({
      title: e.detail.value,
      title_len: e.detail.value.length
    })
  },
  descinput: function(e) {
    this.setData({
      describe: e.detail.value,
      desc_len: e.detail.value.length
    })
  },
  titleinput2: function (e) {
    this.setData({
      title: e.detail.value,
      title_len: e.detail.value.length,
      disabled: false
    })
  },
  descinput2: function (e) {
    this.setData({
      describe: e.detail.value,
      desc_len: e.detail.value.length,
      disabled: false
    })
  },
  addItem: function(data) {
    return new Promise((resolve, reject) => {
      const work = wx.cloud.database().collection('work')

      work.add({
          data
        })
        .then(res => {
          const workid = res._id
          resolve(workid)
        })
        .catch(err => {
          console.log(err)
          reject('添加失败')
        })
    })
  },
  updateItem: function(openid, tasksid, data) {
    return new Promise((resolve, reject) => {
      const work = wx.cloud.database().collection('work')

      work.where({
          _openid: openid,
          _taskid: taskid
        }).update({
          data
        })
        .then(res => {
          const workid = res._id
          resolve(workid)
        })
        .catch(err => {
          console.log(err)
          reject('更新失败')
        })
    })
  },
  getFiles: function(paths) {
    return new Promise((resolve, reject) => {
      var names = []

      for (var i = 0; i < paths.length; i++) {
        var list = paths[i].split('/')
        var name = list[list.length - 1]
        console.log('name', name)

        names.push(name)
      }

      wx.cloud.getTempFileURL({
        fileList: paths
      }).then(res => {
        // get temp file URL
        const list = res.fileList
        var files = []

        for (let i = 0; i < list.length; i++) {
          files.push({
            path: list[i].tempFileURL,
            name: names[i],
            cloudPath: paths[i]
          })
        }

        resolve(files)
      }).catch(error => {
        // handle error
        console.log(error)
        reject('获取失败')
      })
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var list = options.data.split('/')
    var taskid = list[0]
    var arg = list[1]

    // 页面布局
    var width = app.globalData.screenWidth * 0.8 / 3
    var margin = app.globalData.screenWidth * 0.05
    var screenWidth = app.globalData.screenWidth

    this.setData({
      taskid: taskid,
      width: width,
      margin: margin,
      screenWidth: screenWidth
    })

    if (arg == '1') {
      var placeholder = null
      var wtj_tasks = app.globalData.wtj_tasks

      for (var i = 0; i < wtj_tasks.length; i++) {
        if (wtj_tasks[i]._id == taskid) {
          placeholder = wtj_tasks[i].taskname
        }
      }

      this.setData({
        placeholder: placeholder,
        status: true
      })
    } else {
      var desc_len = 0
      var title_len = 0
      var placeholder = null
      var title = null
      var describe = null
      var paths = null
      var kxg_tasks = app.globalData.kxg_tasks

      for (var i = 0; i < kxg_tasks.length; i++) {
        if (kxg_tasks[i]._id == taskid) {
          placeholder = kxg_tasks[i].taskname
          title = kxg_tasks[i].work.title
          describe = kxg_tasks[i].work.describe
          paths = kxg_tasks[i].work.path
        }
      }

      if (describe == null) {
        desc_len = 0
      } else {
        desc_len = describe.length
      }
      title_len = title.length

      this.setData({
        placeholder: placeholder,
        title: title,
        describe: describe,
        desc_len: desc_len,
        title_len: title_len,
        status: false
      })

      this.init(paths)

    }
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