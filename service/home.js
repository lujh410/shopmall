import {
  baseURL,timeout,mybaseURL
} from './config.js'

import request from './network.js'

export function getMultiData() {
  return request({
    url: baseURL+'/home/multidata',
    method:"GET"
  })
} 

export function getProduct(type, page) {
  return request({
    url: mybaseURL+'/learn/dataapi',
    method:"POST",
    data: {
      'type':type,
      'page':page
    }
  })
}