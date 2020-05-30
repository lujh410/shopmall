// pages/login/login.js
const WXAPI = require('apifm-wxapi')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isaccoutok:false,
    ispwdok:false,
    dislogin:true,
    autologin:false,
    rememberpwd:false,
    username:"",
    password:"",
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    isok:false
  },
  handleraccountinput:function(e){
    var username = e.detail.value
    this.setData({
      isaccoutok: username.length>=3
    })
    this.check_all()
  },
  handlerpwdinput:function(e){
    var pwd = e.detail.value
      this.setData({
        ispwdok:pwd.length>6
      })
      this.check_all()
  },
  check_all(){
    this.setData({
      dislogin: !(this.data.ispwdok && this.data.isaccoutok)
    })
  },
  checkrememberpwdChange(e){
    if (e.detail.value.length===0){
      this.setData({
        autologin:e.detail.value.length
      })
    }
  },
  checkautologinChange(e){
    this.setData({
      rememberpwd:e.detail.value.length
    })
  },
  handlersubmit(e){
    this.data.username  = e.detail.value.username
    this.data.password  = e.detail.value.password
    var rememberpwd = e.detail.value.rememberpwd[0]
    var autologin =  e.detail.value.autologin[0]
    console.log(e)
    console.log(this.data.username,this.data.password,rememberpwd,autologin)
    this.goLogin()
  },
  goLogin() {
    wx.login({
      success: function (res) {
        const code = res.code; // 微信登录接口返回的 code 参数，下面登录接口需要用到
        WXAPI.login_wx(code).then(function (res) {
          // 登录接口返回结果
          console.log(res)
          if (res.code == 10000) {
            wx.showToast({
              title: '请先注册',
              icon: 'none'
            })
          } else if (res.code == 0) {
            wx.showToast({
              title: '登录成功',
              icon: 'success'
            })
            wx.setStorageSync('loginToken', res.data)
            wx.switchTab({
              url: '/pages/home/home'
            })
          } else {
            wx.showToast({
              title: res.msg,
              icon: 'none'
            })
          }
        })
      }
    })
  },
  handlerregisterbtn(){
    wx.navigateTo({
      url: '/pages/register/register?id=6',
    })
    
  },
  bindGetUserInfo (e) {
    if (e.detail.userInfo){
      this.setData({
        canIUse:"",
        isok:true
      })
    }
  },
  register_simple(e) {
    // if (!e.detail.userInfo) {
    //   // 你点了取消授权
    //   return;
    // } else{}
    wx.login({
      success: function (res) {
        const code = res.code; // 微信登录接口返回的 code 参数，下面注册接口需要用到
        // 下面开始调用注册接口
        WXAPI.register_simple({
          code: code
        }).then(function (res) {
          // 注册接口返回结果
          console.log(res)
          if (res.code == 10000) {
            wx.showToast({
              title: '无需重复注册',
              icon: 'none'
            })
          } else if (res.code == 0) {
            wx.showToast({
              title: '注册成功',
              icon: 'success'
            })
          } else {
            wx.showToast({
              title: res.msg,
              icon: 'none'
            })
          }
        })
      }
    })
  },
  

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this
     // 查看是否授权
     wx.getSetting({
      success (res){
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          wx.getUserInfo({
            success: function(res) {
              that.setData({
                canIUse:"",
                isok:true
              })
            }
          })
        }
      }
    })
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