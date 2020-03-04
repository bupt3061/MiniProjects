// 处理时间类数据

function formatTimeFull(date) {
    /**
   * 功能：格式化时间并输出
   * 参数：date(日期)
   * 返回：格式化时间字符串
   * 2019/10/23 13：25：55
   */
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatTime(date) {
  /**
 * 功能：格式化时间并输出
 * 参数：date(日期)
 * 返回：格式化时间字符串
 * 2019/10/23
 */
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  return [year, month, day].map(formatNumber).join('/')
}

function convertFormatTime(dateString) {
  if(dateString) {
    var arr1 = dateString.split(" ");
    var sdate = arr1[0].split('/');
    var date = new Date(sdate[0], sdate[1] - 1, sdate[2], );
    console.log(date)

    return date;
  }
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

module.exports = {
  formatTime: formatTime,
  formatTimeFull: formatTimeFull,
  convertFormatTime: convertFormatTime
}