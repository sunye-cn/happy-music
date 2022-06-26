import axios from 'axios'

const ERR_OK = 0
const baseURL = process.env.NODE_ENV === 'production' ? 'http://sunye.cool/happy-music/' : '/'

axios.defaults.baseURL = baseURL

export function get(url, params) {
  return axios.get(url, {
    params
  }).then((res) => {
    const servgerData = res.data
    if (servgerData.code === ERR_OK) {
      return servgerData.result
    }
  }).catch((e) => {
    console.log(e)
  })
}
