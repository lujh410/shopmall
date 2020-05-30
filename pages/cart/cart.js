// pages/cart/cart.js
const WXAPI = require('apifm-wxapi')
const TOOLS = require('../../utils/tools.js')
const AUTH = require('../../utils/auth')

const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    wxlogin: true,

    saveHidden: true,
    allSelect: true,
    noSelect: false,
    shippingCarInfo:"",

    delBtnWidth: 120, //删除按钮宽度单位（rpx）
    shippingCarInfo:""
  },
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
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.shippingCarInfo()
    TOOLS.showTabBarBadge()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})