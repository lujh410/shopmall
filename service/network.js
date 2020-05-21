import {
  baseURL,timeout
} from './config.js'

function request(option){
  wx.showLoading({
    title: '数据加载中',
  })
  return new Promise((resolve,reject)=>{
    wx.request({
      url: option.url,
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      timeout:option.timeout,
      method:option.method,
      data:option.data,
      success:function(res){
        resolve(res.data)
      },
      fail:reject,
      complete: res => {
        wx.hideLoading()
      }
    })
  })
}
export default request;