function getSystemInfo() {
  /**
   * 功能：获取系统信息，包括屏幕长、宽像素等
   * 参数：None
   * 返回：系统信息
   */

  // 判断函数是否可用
  if (!wx.canIUse('getSystemInfoSync')) {
    console.log('无法使用 wx.getSystemInfoSync() 函数')
    return 
  }

  // 获取系统信息
  try{
    const info = wx.getSystemInfoSync()

    return info
  }catch(err) {
    console.log('获取系统信息失败')
    console.log(err)
  }
}

module.exports = {
  getSystemInfo: getSystemInfo
}