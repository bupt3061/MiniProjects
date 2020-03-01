// pages/addtask/addtask.js
const app = getApp()
const dt = require('../../utils/date.js')
const st = require('../../utils/string.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    courseid: null,
    arg: null,
    duration: 1000,
    content: null,
    $zanui: {
      toptips: {
        show: false
      }
    },
    backgroundColor: "#FAAD14",
    standards: [{
      key: null,
      ratio: 0,
      status: true
    }, ],
    taskname: null,
    uploadstart: null,
    uploadend: null,
    evaluatestart: null,
    evaluateend: null,
    startUpPlaceHolder: "选择时间",
    endUpPlaceHolder: "选择时间",
    startEvalPlaceHolder: "选择时间",
    endEvalPlaceHolder: "选择时间",
    maxlength: 5,
    stepperMin: 0,
    stepperMax: 100,
    addLoading: false,
    upLoading: false,
    delLoading: false,
    taskid: null
  },
  /**
   * 初始化函数
   */
  init: function(taskid) {
    const courseid = this.data.courseid
    var standards = []
    var taskname
    var uploadstart
    var uploadend
    var evaluatestart
    var evaluateend
    var startUpPlaceHolder
    var endUpPlaceHolder
    var startEvalPlaceHolder
    var endEvalPlaceHolder
    var standard
    var standards
    var task

    console.log(courseid)
    const tasklist = app.globalData.tasklist
    const tasks = tasklist[courseid]
    console.log(tasks)
    console.log(tasklist)

    for (var i = 0; i < tasks.length; i++) {
      if (taskid == tasks[i]._id) {
        task = tasks[i]
      }
    }

    console.log(task)

    standard = task.standard
    taskname = task.taskname
    uploadstart = task.uploadstart
    uploadend = task.uploadend
    evaluatestart = task.evaluatestart
    evaluateend = task.evaluateend
    startUpPlaceHolder = dt.formatTimeFull(uploadstart)
    endUpPlaceHolder = dt.formatTimeFull(uploadend)
    startEvalPlaceHolder = dt.formatTimeFull(evaluatestart)
    endEvalPlaceHolder = dt.formatTimeFull(evaluateend)

    const keys = Object.keys(standard)
    if (keys[0] == '总分') {
      standards = [{
        key: null,
        ratio: 0,
        status: true
      }, ]
    } else {
      for (var i = 0; i < keys.length; i++) {
        var temp = {
          key: keys[i],
          ratio: standard[keys[i]] * 100,
          status: false
        }

        if (i == keys.length - 1) {
          temp.status = true
        }

        standards.push(temp)
      }
    }

    this.setData({
      standards: standards,
      taskname: taskname,
      uploadstart: uploadstart,
      uploadend: uploadend,
      evaluatestart: evaluatestart,
      evaluateend: evaluateend,
      startUpPlaceHolder: startUpPlaceHolder,
      endUpPlaceHolder: endUpPlaceHolder,
      startEvalPlaceHolder: startEvalPlaceHolder,
      endEvalPlaceHolder: endEvalPlaceHolder,
      taskid: taskid
    })

  },
  /**
   * 其他函数
   */
  inputTaskname: function(e) {
    const taskname = e.detail.value
    console.log("taskname", taskname)

    this.setData({
      taskname: taskname
    })
  },
  startUpTime: function(e) {
    const date = e.detail.value
    const year = date[0]
    const month = date[1]
    const day = date[2]
    const hour = date[3]
    const min = date[4]
    const sec = date[5]
    const timestr = year + '/' + month + '/' + day + " " + hour + ":" + min + ":" + sec
    const uploadstart = new Date(timestr)
    console.log('date', date)
    console.log('uploadstart', uploadstart)

    this.setData({
      uploadstart: uploadstart
    })
  },
  endUpTime: function(e) {
    const date = e.detail.value
    const year = date[0]
    const month = date[1]
    const day = date[2]
    const hour = date[3]
    const min = date[4]
    const sec = date[5]
    const timestr = year + '/' + month + '/' + day + " " + hour + ":" + min + ":" + sec
    const uploadend = new Date(timestr)
    console.log('date', date)
    console.log('uploadend', uploadend)

    this.setData({
      uploadend: uploadend
    })
  },
  startEvalTime: function(e) {
    const date = e.detail.value
    const year = date[0]
    const month = date[1]
    const day = date[2]
    const hour = date[3]
    const min = date[4]
    const sec = date[5]
    const timestr = year + '/' + month + '/' + day + " " + hour + ":" + min + ":" + sec
    const evaluatestart = new Date(timestr)
    console.log('date', date)
    console.log('evaluatestart', evaluatestart)

    this.setData({
      evaluatestart: evaluatestart
    })
  },
  endEvalTime: function(e) {
    const date = e.detail.value
    const year = date[0]
    const month = date[1]
    const day = date[2]
    const hour = date[3]
    const min = date[4]
    const sec = date[5]
    const timestr = year + '/' + month + '/' + day + " " + hour + ":" + min + ":" + sec
    const evaluateend = new Date(timestr)
    console.log('date', date)
    console.log('evaluateend', evaluateend)

    this.setData({
      evaluateend: evaluateend
    })
  },
  inputKey: function(e) {
    const idx = e.currentTarget.dataset.idx
    const value = e.detail.value
    var standards = this.data.standards
    console.log(idx)
    console.log(value)

    standards[idx].key = value

    this.setData({
      standards: standards
    })
  },
  plusStepper: function(e) {
    const idx = e.currentTarget.dataset.idx
    console.log(e)
    var standards = this.data.standards
    standards[idx].ratio += 10
    console.log(standards)

    this.setData({
      standards: standards
    })
  },
  minusStepper: function(e) {
    const idx = e.currentTarget.dataset.idx
    var standards = this.data.standards
    standards[idx].ratio -= 10

    this.setData({
      standards: standards
    })
  },
  addItem: function() {
    var standards = this.data.standards

    const data = {
      key: null,
      ratio: 0,
      status: true
    }

    standards[standards.length - 1].status = false
    standards.push(data)

    this.setData({
      standards: standards
    })
  },
  delItem: function(e) {
    const idx = e.currentTarget.dataset.idx
    console
    var standards = this.data.standards

    var temp = []
    for (var i = 0; i < standards.length; i++) {
      if (i == idx) {
        continue
      }
      temp.push(standards[i])
    }

    this.setData({
      standards: temp
    })
  },
  addTask: function(data) {
    return new Promise((resolve, reject) => {
      const db = wx.cloud.database()

      db.collection('task')
        .add({
          data
        })
        .then(res => {
          console.log(res)
          resolve(res._id)
        })
        .catch(err => {
          console.log(err)
          reject('添加失败')
        })
    })
  },
  checkTaskname: function() {
    const taskname = this.data.taskname

    if (taskname == null || taskname == '') {
      this.setData({
        $zanui: {
          toptips: {
            show: true
          }
        },
        content: '请填写任务名'
      })

      setTimeout(() => {
        this.setData({
          $zanui: {
            toptips: {
              show: false
            }
          }
        })
      }, this.data.duration);

      return false
    }

    return true
  },
  checkUploadstart: function() {
    const uploadstart = this.data.uploadstart

    if (uploadstart == null) {
      this.setData({
        $zanui: {
          toptips: {
            show: true
          }
        },
        content: '请选择提交开始时间'
      })

      setTimeout(() => {
        this.setData({
          $zanui: {
            toptips: {
              show: false
            }
          }
        })
      }, this.data.duration);

      return false
    }

    return true
  },
  checkUploadend: function() {
    const uploadend = this.data.uploadend

    if (uploadend == null) {
      this.setData({
        $zanui: {
          toptips: {
            show: true
          }
        },
        content: '请选择提交结束时间'
      })

      setTimeout(() => {
        this.setData({
          $zanui: {
            toptips: {
              show: false
            }
          }
        })
      }, this.data.duration);

      return false
    }

    return true
  },
  checkEvaluatestart: function() {
    const evaluatestart = this.data.evaluatestart

    if (evaluatestart == null) {
      this.setData({
        $zanui: {
          toptips: {
            show: true
          }
        },
        content: '请选择互评开始时间'
      })

      setTimeout(() => {
        this.setData({
          $zanui: {
            toptips: {
              show: false
            }
          }
        })
      }, this.data.duration);

      return false
    }

    return true
  },
  checkEvaluateend: function() {
    const evaluateend = this.data.evaluateend

    if (evaluateend == null) {
      this.setData({
        $zanui: {
          toptips: {
            show: true
          }
        },
        content: '请选择互评结束时间'
      })

      setTimeout(() => {
        this.setData({
          $zanui: {
            toptips: {
              show: false
            }
          }
        })
      }, this.data.duration);

      return false
    }

    return true
  },
  checkUpTime: function() {
    const uploadstart = this.data.uploadstart
    const uploadend = this.data.uploadend

    if (uploadend <= uploadstart) {
      this.setData({
        $zanui: {
          toptips: {
            show: true
          }
        },
        content: '提交结束时间应大于开始时间'
      })

      setTimeout(() => {
        this.setData({
          $zanui: {
            toptips: {
              show: false
            }
          }
        })
      }, this.data.duration);

      return false
    }

    return true
  },
  checkEvalTime: function() {
    const evaluatestart = this.data.evaluatestart
    const evaluateend = this.data.evaluateend
    const uploadstart = this.data.uploadstart
    const uploadend = this.data.uploadend

    if (evaluateend <= evaluatestart) {
      this.setData({
        $zanui: {
          toptips: {
            show: true
          }
        },
        content: '互评结束时间应大于开始时间'
      })

      setTimeout(() => {
        this.setData({
          $zanui: {
            toptips: {
              show: false
            }
          }
        })
      }, this.data.duration);

      return false
    }

    if (evaluatestart <= uploadend) {
      this.setData({
        $zanui: {
          toptips: {
            show: true
          }
        },
        content: '互评时间应晚于提交时间'
      })

      setTimeout(() => {
        this.setData({
          $zanui: {
            toptips: {
              show: false
            }
          }
        })
      }, this.data.duration);

      return false
    }

    return true
  },
  checkStandards: function() {
    const standards = this.data.standards

    if (standards.length == 1 && standards[0].ratio == 0 && (standards[0].key == null || standards[0].key == '')) {
      return 1
    }

    var res = {}
    var sum = 0
    for (var i = 0; i < standards.length - 1; i++) {
      if (standards[i].key == null || standards[i].key == '' || standards[i].ratio == 0) {
        this.setData({
          $zanui: {
            toptips: {
              show: true
            }
          },
          content: '请正确填写维度'
        })

        setTimeout(() => {
          this.setData({
            $zanui: {
              toptips: {
                show: false
              }
            }
          })
        }, this.data.duration);

        return false
      }

      sum += standards[i].ratio
      res[standards[i].key] = standards[i].ratio / 100
    }

    const last_standard = standards[standards.length - 1]
    if((last_standard.key == '' || last_standard.key == null) && last_standard.ratio == 0) {
      console.log('未填写')
    } else if (last_standard.key != '' && last_standard.ratio != 0) {
      sum += last_standard.ration
      res[last_standard.key] = last_standard.ratio / 100
    }

    if (sum != 100) {
      this.setData({
        $zanui: {
          toptips: {
            show: true
          }
        },
        content: '维度和应为100%'
      })

      setTimeout(() => {
        this.setData({
          $zanui: {
            toptips: {
              show: false
            }
          }
        })
      }, this.data.duration);

      return false
    }
    return res
  },
  async summit() {
    const courseid = this.data.courseid
    const taskname = this.data.taskname
    const uploadstart = this.data.uploadstart
    const uploadend = this.data.uploadend
    const evaluatestart = this.data.evaluatestart
    const evaluateend = this.data.evaluateend
    const standards = this.data.standards
    const now = new Date()
    let standard
    let data

    // 检查数据
    var flag = true

    flag = this.checkTaskname()
    if (!flag) {
      return
    }

    flag = this.checkUploadstart()
    console.log(flag)
    if (!flag) {
      return
    }

    flag = this.checkUploadend()
    if (!flag) {
      return
    }

    flag = this.checkUpTime()
    if (!flag) {
      return
    }

    flag = this.checkEvaluatestart()
    if (!flag) {
      return
    }

    flag = this.checkEvaluateend()
    if (!flag) {
      return
    }

    flag = this.checkEvalTime()
    if (!flag) {
      return
    }

    var res = this.checkStandards()
    if (res == 1) {
      standard = {
        '总分': 1
      }
    } else if (!res) {
      return
    } else {
      standard = res
    }

    console.log(standard)

    this.setData({
      addLoading: true,
    })

    // 上传数据
    data = {
      _courseid: courseid,
      taskname: taskname,
      uploadstart: uploadstart,
      uploadend: uploadend,
      evaluatestart: evaluatestart,
      evaluateend: evaluateend,
      cretime: now,
      standard: standard
    }

    let id = await this.addTask(data)
    console.log(id)

    // 更新全局数据
    var state = null
    if (uploadstart > now) {
      state = '1'
    } else if (uploadstart <= now && now <= uploadend) {
      state = '2'
    } else if (evaluatestart <= now && now <= evaluateend) {
      state = '3'
    } else {
      state = '4'
    }
    const zhouqi = dt.formatTime(uploadstart) + '-' + dt.formatTime(evaluateend)
    const ttasknameh = st.handleTaskName(taskname)
    const item = {
      cretime: now,
      evaluateend: evaluateend,
      evaluatestart: evaluatestart,
      standard: standard,
      state: state,
      taskname: taskname,
      ttasknameh: ttasknameh,
      uploadstart: uploadstart,
      uploadend: uploadend,
      zhouqi: zhouqi,
      _courseid: courseid,
      _id: id
    }

    var tasks = app.globalData.tasklist[courseid]
    tasks = [item, ].concat(tasks)
    app.globalData.tasklist[courseid] = tasks
    console.log(tasks)

    this.setData({
      addLoading: false
    })

    wx.showToast({
      title: '已添加',
    })

    setTimeout(function() {
      wx.redirectTo({
        url: '../tasklist/tasklist?courseid=' + courseid,
      })
    }, 2000)

  },
  async update() {
    const courseid = this.data.courseid
    const taskid = this.data.taskid
    const taskname = this.data.taskname
    const uploadstart = this.data.uploadstart
    const uploadend = this.data.uploadend
    const evaluatestart = this.data.evaluatestart
    const evaluateend = this.data.evaluateend
    const standards = this.data.standards
    const now = new Date()
    let standard
    let data

    // 检查数据
    var flag = true

    flag = this.checkTaskname()
    if (!flag) {
      return
    }

    flag = this.checkUploadstart()
    console.log(flag)
    if (!flag) {
      return
    }

    flag = this.checkUploadend()
    if (!flag) {
      return
    }

    flag = this.checkUpTime()
    if (!flag) {
      return
    }

    flag = this.checkEvaluatestart()
    if (!flag) {
      return
    }

    flag = this.checkEvaluateend()
    if (!flag) {
      return
    }

    flag = this.checkEvalTime()
    if (!flag) {
      return
    }

    var res = this.checkStandards()
    if (res == 1) {
      standard = {
        '总分': 1
      }
    } else if (!res) {
      return
    } else {
      standard = res
    }

    console.log(standard)

    this.setData({
      upLoading: true,
    })

    // 更新数据
    data = {
      taskname: taskname,
      uploadstart: uploadstart,
      uploadend: uploadend,
      evaluatestart: evaluatestart,
      evaluateend: evaluateend,
      cretime: now,
      standard: standard
    }

    const db = wx.cloud.database()

    db.collection('task')
    .where({
      _id: taskid
    })
    .update({
      data
    })
    .then(res => {
      console.log(res)
    })
    .catch(err => {
      console.log(err)
    }) 

    // 更新全局数据
    var state = null
    if (uploadstart > now) {
      state = '1'
    } else if (uploadstart <= now && now <= uploadend) {
      state = '2'
    } else if (evaluatestart <= now && now <= evaluateend) {
      state = '3'
    } else {
      state = '4'
    }
    const zhouqi = dt.formatTime(uploadstart) + '-' + dt.formatTime(evaluateend)
    const ttasknameh = st.handleTaskName(taskname)
    const item = {
      cretime: now,
      evaluateend: evaluateend,
      evaluatestart: evaluatestart,
      standard: standard,
      state: state,
      taskname: taskname,
      ttasknameh: ttasknameh,
      uploadstart: uploadstart,
      uploadend: uploadend,
      zhouqi: zhouqi,
      _courseid: courseid,
      _id: id
    }

    var tasks = app.globalData.tasklist[courseid]
    tasks = [item,].concat(tasks)
    app.globalData.tasklist[courseid] = tasks
    console.log(tasks)

    this.setData({
      upLoading: false
    })

    wx.showToast({
      title: '已更新',
    })

    setTimeout(function () {
      wx.redirectTo({
        url: '../tasklist/tasklist?courseid=' + courseid,
      })
    }, 2000)

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const list = options.data.split('/')
    const arg = list[list.length - 1]
    const courseid = list[0]
    console.log(courseid)

    if (arg == '2') {
      var taskid = list[1]
      console.log(taskid)

      this.setData({
        courseid: courseid,
        arg: arg
      })

      this.init(taskid)
    }

    this.setData({
      courseid: courseid,
      arg: arg
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