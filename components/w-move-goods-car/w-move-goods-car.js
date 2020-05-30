// components/w-move-goods-car/w-move-goods-car.js
const WXAPI = require('apifm-wxapi')
const TOOLS = require('../../utils/tools.js')
const AUTH = require('../../utils/auth')

const app = getApp()

var xmove_list = {}
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    shippingCarInfo:Object
  },

  /**
   * 组件的初始数据
   */
  data: {
    x_end:0,
    x_start:0,
    xmove_list:{}
  },

  /**
   * 组件的方法列表
   */
  methods: {
    async shippingCarInfo(){
      const token = wx.getStorageSync('token')
      if (!token) {
        return
      }
      const res = await WXAPI.shippingCarInfo(token)
      if (res.code == 0) {
        this.setData({
          shippingCarInfo: res.data
        })
      } else {
        this.setData({
          shippingCarInfo: null
        })
      }
    },
    async delItem(e) {
      const key = e.currentTarget.dataset.key
      this.delItemDone(key)
    },
    async delItemDone(key){
      const token = wx.getStorageSync('token')
      const res = await WXAPI.shippingCarInfoRemoveItem(token, key)
      if (res.code != 0 && res.code != 700) {
        wx.showToast({
          title: res.msg,
          icon:'none'
        })
      } else {
        this.shippingCarInfo()
        TOOLS.showTabBarBadge()
      }
    },
    async jiaBtnTap(e) {
      const index = e.currentTarget.dataset.index;
      const item = this.data.shippingCarInfo.items[index]
      const number = item.number + 1
      const token = wx.getStorageSync('token')
      const res = await WXAPI.shippingCarInfoModifyNumber(token, item.key, number)
      this.shippingCarInfo()
      TOOLS.showTabBarBadge()
    },
    async jianBtnTap(e) {
      const index = e.currentTarget.dataset.index;
      const item = this.data.shippingCarInfo.items[index]
      const number = item.number-1
      if (number <= 0) {
        // 弹出删除确认
        wx.showModal({
          content: '确定要删除该商品吗？',
          success: (res) => {
            if (res.confirm) {
              this.delItemDone(item.key)
            }
          }
        })
        return
      }
      const token = wx.getStorageSync('token')
      const res = await WXAPI.shippingCarInfoModifyNumber(token, item.key, number)
      this.shippingCarInfo()
      TOOLS.showTabBarBadge()
    },
    handlerstart(e){
      this.data.x_start=e.changedTouches[0].pageX
    },
    handlerend(e){
      this.data.x_end=e.changedTouches[0].pageX
      var d = this.data.x_end-this.data.x_start
      if (d>20){
        xmove_list[e.currentTarget.dataset.index] = 0
        this.setData({
          xmove_list:xmove_list
        })
      }
      if(d<-20){
        xmove_list[e.currentTarget.dataset.index] = -100
        this.setData({
          xmove_list:xmove_list
        })
        console.log(xmove_list,xmove_list['5b6cf04bd68eb32f514c359d824dbcc8'])
        
      }
    }
  }

})
