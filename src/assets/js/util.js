//导出一个洗牌函数，参数是原数组source
export function shuffle(source) {
  //现将原数组做一层slice，后面交换就不会影响到原数组
  const arr = source.slice()
  //对数组进行一次循环，每次取到从0到i的一个随机值
  for (let i = 0; i < arr.length; i++) {
    const j = getRandomInt(i)
    swap(arr, i, j)
  }
  return arr
}

//辅助方法 随机一个整数值，从0到max之间
function getRandomInt(max) {
  //用Math.random()做随机，
  // 而Math.random()本来是一个开区间的，就是从0到1之间的一个数
  return Math.floor(Math.random() * (max + 1))
}

//辅助函数 arr数组中的i和j进行交换
function swap(arr, i, j) {
  const t = arr[i]
  arr[i] = arr[j]
  arr[j] = t
}

//工具函数将时间格式化
export function formatTime(interval) {
  //向下取整
  interval = interval | 0
  //拿到分钟部分
  // (interval / 60 | 0) + ''是将数字变成一个字符串。
  // .padStart(2, '0')往前面填充0，保持它有两位
  const minute = ((interval / 60 | 0) + '').padStart(2, '0')
  //拿到秒的部分 (interval % 60 + '')取余后变成字符串
  const second = (interval % 60 + '').padStart(2, '0')
  return `${minute}:${second}`
}
