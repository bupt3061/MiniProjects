const db = wx.cloud.database({
  env: 'test-m3m5d'
})
const _ = db.command

// 查询一条记录
var stu = db.collection('stu')

stu.doc('1c756ce65db4fe4a00ab578512a8c17a')
  .get()
  .then(res => {
    console.log('一条记录：', res.data)
  })
  .catch(err => {
    console.log(err)
  })

// 查询多个记录
var course = db.collection('course')

course.where({
  _openid: 'teachid03zFB73EzCy1Zs9JUNVjg'
})
  .get()
  .then(res => {
    console.log('多条记录：', res.data)
  })
  .catch(err => {
    console.log(err)
  })

// 查询集合
course.get()
  .then(res => {
    console.log('集合：', res.data)
  })
  .catch(err => {
    console.log(err)
  })