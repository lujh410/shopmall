// pages/temp/temp.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    saveHidden:true,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    imgurl:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // wx.getSetting({
    //   success(res) {
    //     if (!res.authSetting['scope.record']) {
    //       wx.authorize({
    //         scope: 'scope.record',
    //         success () {
    //           // 用户已经同意小程序使用录音功能，后续调用 wx.startRecord 接口不会弹窗询问
    //           wx.startRecord()
    //         }
    //       })
    //     }
    //   }
    // })
    // 查看是否授权
    // wx.getSetting({
    //   success (res){
    //     if (res.authSetting['scope.userInfo']) {
    //       // 已经授权，可以直接调用 getUserInfo 获取头像昵称
    //       wx.getUserInfo({
    //         success: function(res) {
    //           console.log(res.userInfo)
    //         }
    //       })
    //     }
    //   }
    // })
  },
  getbarcode(){
    wx.cloud.init()
    var path = 'pages/goods-details/goods-details' 
    var width = '430'
    var objectId = 433345

    wx.cloud.callFunction({
      name: 'getbarcode',
      data: {
        page: path,
        width: width,
        scene: objectId,
      },
      success: res => {
        console.log(0,res)


        wx.showToast({
          title: '生成成功!',
        })

      },
      fail: error => {
        console.log(JSON.stringify(error))
        wx.showToast({
          title: '生成失败!',
        })
      }
    });
  },
  bindGetUserInfo (e) {
    console.log(e.detail.userInfo)

  },
auth(){
  wx.openSetting({
    success (res) {
      console.log(res.authSetting)
      res.authSetting = {
        "scope.userInfo": true,
        "scope.userLocation": true
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