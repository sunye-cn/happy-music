import storage from 'good-storage'

//利用storage这个库进行存储，这次要用localStorage进行永久存储，关闭浏览器后也希望这个数据仍然存在
//要导出两个方法
// save

//逻辑封装成一个函数，用来判断val这个值是否在arr中
//此时不能直接用indexOf，因为存储的是一个对象结构，那么其实可能是不同的对象，但是歌曲的id是相同的，这时就不能简单的用indexOf来比对了
//可以用findIndex，findIndex内部传入一个compare函数，函数内部相当于可以自己定义一个规则。
// 这里的compare函数是外部来实现的，我们这里只需要调用他就好了，不需要关注事件。相当于把这部分逻辑剥离出去，不用和这个内部耦合了
function insertArray(arr, val, compare, maxLen) {
  const index = arr.findIndex(compare)
  //为什么不用>-1
  if (index === 0) {
    return
  }
  if (index > 0) {
    arr.splice(index, 1)
  }
  arr.unshift(val)
  //插入完maxLen这个参数就可以去判断
  //判断是否配置了maxLen再比较是否超过最大长度
  if (maxLen && arr.length > maxLen) {
    //最早保存的弹出去，保留一个先进先出队列的原则
    arr.pop()
  }
}

//辅助函数 移除元素的逻辑
function deleteFromArray(arr, compare) {
  const index = arr.findIndex(compare)
  //如果数据在这个数组中
  if (index > -1) {
    //splice给删掉这个数据了
    arr.splice(index, 1)
  }
}

//不同的数据即item不同的key
// 这里的compare函数是外部来实现的，我们这里只需要调用他就好了
//加入只希望保留100首歌，超过100就把最开始保留的第一首移除掉。添加maxLen
export function save(item, key, compare, maxLen) {
  //从storage中读出现有的元素，接下来就要将item插入item数组中，并且要判断数组中是否已经有这个元素了，已经存在的话就不需要反复插入了
  const items = storage.get(key, [])
  insertArray(items, item, compare, maxLen)
  //虽然insertArray本地的数组中，但还是要保存到本地的storage
  storage.set(key, items)
  return items
}

//移除逻辑 传入两个参数，一个key一个compare函数，
// 不需要传入具体移除了哪个item，因为不能通过indexOf来判断这个item是否在这个arr中，还是要通过compare函数来实现
export function remove(key, compare) {
  const items = storage.get(key, [])
  deleteFromArray(items, compare)
  storage.set(key, items)
  return items
}

//加载数据的函数，就是加载存储中的数据防止刷新后收藏列表依然是初始化时的空数组
export function load(key) {
  return storage.get(key, [])
}

export function clear(key) {
  storage.remove(key)
  return []
}

//存储整个数组
export function saveAll(items, key) {
  storage.set(key, items)
}
