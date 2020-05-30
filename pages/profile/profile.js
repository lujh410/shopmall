// pages/profile/profile.js
const app = getApp()
const CONFIG = require('../../config.js')
const WXAPI = require('apifm-wxapi')
const AUTH = require('../../utils/auth')
const TOOLS = require('../../utils/tools.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    wxlogin: true,
    canHX:true

  },
  goLogin() {
    this.setData({
      wxlogin: false
    })
  },
  cancelLogin() {
    this.setData({
      wxlogin: true
    })
  },
  processLogin(e) {
    if (!e.detail.userInfo) {
      wx.showToast({
        title: '已取消',
        icon: 'none',
      })
      return;
    }
    AUTH.register(this);
    //自动进行注册和登录（保存token等）
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    const _this = this
    const order_hx_uids = wx.getStorageSync('order_hx_uids')
    this.setData({
      version: CONFIG.version,
      order_hx_uids
    })
    AUTH.checkHasLogined().then(isLogined => {
      this.setData({
        wxlogin: isLogined
      })
      if (isLogined) {
        _this.getUserApiInfo();
        // _this.getUserAmount();
        // _this.orderStatistics();
      }
    })
    // 获取购物车数据，显示TabBarBadge
    TOOLS.showTabBarBadge();
  },
  getUserApiInfo: function () {
    var that = this;
    WXAPI.userDetail(wx.getStorageSync('token')).then(function (res) {
      if (res.code == 0) {
        let _data = {}
        _data.apiUserInfoMap = res.data
        if (res.data.base.mobile) {
          _data.userMobile = res.data.base.mobile
        }
        if (that.data.order_hx_uids && that.data.order_hx_uids.indexOf(res.data.base.id) != -1) {
          _data.canHX = true // 具有扫码核销的权限
        }
        that.setData(_data);
      }
    })
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