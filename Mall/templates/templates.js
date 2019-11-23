const clickSearch = function () {
  wx.navigateTo({
    url: "../blank/blank",
    success: res => {
      console.log(res)
    },
    fail: err => {
      console.log(err)
    }
  })
}

module.exports = {
  clickSearch: clickSearch,
}