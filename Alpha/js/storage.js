function getStorageInfo() {
  /**
   * 功能：获取缓存数据信息
   * 参数：None
   * 返回：缓存数据的 key 数组
   */

  // 判断函数是否可用
  if (!wx.canIUse('getStorageInfoSync')) {
    console.log('无法使用 wx.getStorageInfoSync() 函数')
    return
  }

  // 获取缓存信息
  try {
    const res = wx.getStorageInfoSync()
    
    return res.keys
  } catch (err) {
    console.log('无法获取缓存信息')
    console.log(err)
  }
}

function setStorage(key, value) {
  /**
   * 功能：缓存数据
   * 参数：
   *  key：存储数据的关键字
   *  value：需要缓存的数据
   * return: None
   */

  try {
    // 判断函数是否可用
    if (!wx.canIUse('setStorageSync')) {
      console.log('无法使用 wx.setStorageSync() 函数')
      return
    }

    // 存储
    wx.setStorageSync(key, value)
    console.log(key, '被成功存储')
  } catch (err) {
    if (!wx.canIUse('setStorage')) {
      console.log('无法使用 wx.setStorage() 函数')
      return
    }

    wx.setStorage({
      key: key,
      value: value,
      success: res => {
        console.log(key, '被成功存储')
      },
      fail: err => {
        console.log(err)
      }
    })
  }
}

function getStorage(key) {
  /**
   * 功能：获取本地缓存
   * 参数：key
   * 返回值：key对应的数据
   */

  try {
    // 判断函数是否可用
    if (!wx.canIUse('getStorageSync')) {
      console.log('无法使用 wx.getStorageSync() 函数')
      return
    }

    var value = wx.getStorageSync(key)

    if (value) {
      return value
    } else {
      console.log(key, '数据为空')
      return
    }
  } catch (err) {
    console.log('无法获得', key, '对应的缓存数据')
    console.log(err)
  }
}

function removeStorage(key) {
  /**
   * 功能：根据 key 删除缓存的数据
   * 参数：缓存数据的 key
   * return：None
   */

  const keys = getStorageInfo()

  // 判断是否被缓存
  if (keys.indexOf(key) == -1) {
    console.log(key, '未被缓存')
    return
  }

  try {
    // 判断函数是否可用
    if (!wx.canIUse('removeStorageSync')) {
      console.log('无法使用 wx.removeStorageSync() 函数')
      return
    }

    wx.removeStorageSync(key)
    console.log(key, '被成功删除')
  } catch (err) {
    if (!wx.canIUse('removeStorage')) {
      console.log('无法使用 wx.removeStorage() 函数')
      return
    }

    wx.removeStorage({
      key: key,
      success: res => {
        console.log(key, '被成功删除')
      },
      fail: err => {
        console.log(key, '删除失败')
        console.log(err)
      }
    })
  }
}

function clearStorage() {
  /**
   * 功能：清除缓存数据
   * 参数：None
   * 返回：None
   */

  try {
    // 判断函数是否可用
    if (!wx.canIUse('clearStorageSync')) {
      console.log('无法使用 wx.clearStorageSync() 函数')
      return
    }

    // 清除缓存
    wx.clearStorageSync()
    console.log('成功删除本地缓存')
  } catch (err) {
    wx.clearStorage({
      success: res => {
        console.log('成功清除本地缓存')
      },
      fail: err => {
        console.log('清除本地缓存失败')
      }
    })
  }
}

module.exports = {
  setStorage: setStorage,
  getStorageInfo: getStorageInfo,
  removeStorage: removeStorage,
  clearStorage: clearStorage,
  getStorage: getStorage
}