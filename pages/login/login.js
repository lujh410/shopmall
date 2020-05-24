// pages/login/login.js
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
    password:""
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
  },
  handlerregisterbtn(){
    wx.navigateTo({
      url: '/pages/register/register?id=6',
    })
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