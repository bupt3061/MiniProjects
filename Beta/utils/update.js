function updateApp() {
  /**
   * 功能：小程序更新
   * 参数：None
   * 返回：None
   */

  // 创建updateManager对象，用来管理更新
  if (!wx.canIUse('wx.getUpdateManager')) {
    console.log('无法使用 wx.getUpdateManager() 函数')
    return
  }

  const updateManager = wx.getUpdateManager()

  updateManager.onCheckForUpdate(res => {
    // 请求完新版本信息的回调
    console.log(res.hasUpdate)
  })

  updateManager.onUpdateReady(function () {
    wx.showModal({
      title: '更新提示',
      content: '新版本已经准备好，是否重启应用？',
      success: res => {
        if (res.confirm) {
          // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
          updateManager.applyUpdate()
        }
      }
    })
  })

  updateManager.onUpdateFailed(function () {
    // 新版本下载失败
    console.log('新版本下载失败')
  })
}

module.exports = {
  updateApp: updateApp
}