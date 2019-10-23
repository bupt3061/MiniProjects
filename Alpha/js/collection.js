function add(collection, data) {
  /**
   * 功能：新增记录
   * 参数：
   * collection：集合
   * data：新增记录的数据
   * 返回值：None
   */

  collection.add({
      data: data
    })
    .then(res => {
      console.log(res)
    })
    .catch(console.error)
}

module.exports = {
  add: add
}