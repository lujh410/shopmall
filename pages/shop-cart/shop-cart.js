const WXAPI = require('apifm-wxapi')
const TOOLS = require('../../utils/tools.js')
const AUTH = require('../../utils/auth')

const app = getApp()

Page({
  data: {
    wxlogin: true,
    ishidden: false,

    goodsList: {
      saveHidden: true,
      totalPrice: 0,
      allSelect: true,
      noSelect: false,
      list: []
    },
    delBtnWidth: 120, //删除按钮宽度单位（rpx）
  },

  //获取元素自适应后的实际宽度
  getEleWidth: function(w) {
    var real = 0;
    try {
      var res = wx.getSystemInfoSync().windowWidth
      var scale = (750 / 2) / (w / 2)
      // console.log(scale);
      real = Math.floor(res / scale);
      return real;
    } catch (e) {
      return false;
      // Do something when catch error
    }
  },
  initEleWidth: function() {
    var delBtnWidth = this.getEleWidth(this.data.delBtnWidth);
    this.setData({
      delBtnWidth: delBtnWidth
    });
  },
  onLoad: function() {
    this.initEleWidth();

    AUTH.checkHasLogined().then(isLogined => {
      this.setData({
        wxlogin: isLogined
      })
      if (isLogined) {
        this.shippingCarInfo()
      }
    }) 
  },
  onTabItemTap(){
    AUTH.checkHasLogined().then(isLogined => {
      this.setData({
        wxlogin: isLogined
      })
      if (isLogined) {
        this.shippingCarInfo()
      }
    }) 
  },
  onShow: function() {

  },
  async shippingCarInfo(){
    const token = wx.getStorageSync('token')
    if (!token) {
      return
    }
    const res = await WXAPI.shippingCarInfo(token)
    if (res.code == 0) {
      var shopList = res.data.items
      this.data.goodsList.list = shopList;
      this.setGoodsList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), shopList);
      this.bindAllSelect()
    } else {
      let  goodsList= this.data.goodsList
      goodsList.list = null
      this.setData({
        goodsList: goodsList
      })
    }
  },
  toIndexPage: function() {
    wx.switchTab({
      url: "/pages/index/index"
    });
  },

  touchS: function(e) {
    if (e.touches.length == 1) {
      this.setData({
        startX: e.touches[0].clientX
      });
    }
  },
  touchM: function(e) {
    const index = e.currentTarget.dataset.index;
    if (e.touches.length == 1) {
      var moveX = e.touches[0].clientX;
      var disX = this.data.startX - moveX;
      var delBtnWidth = this.data.delBtnWidth;
      var left = "";
      if (disX == 0 || disX < 0) { //如果移动距离小于等于0，container位置不变
        left = "margin-left:0px";
      } else if (disX > 0) { //移动距离大于0，container left值等于手指移动距离
        left = "margin-left:-" + disX + "px";
        if (disX >= delBtnWidth) {
          left = "left:-" + delBtnWidth + "px";
        }
      }
      this.data.goodsList.list[index].left = left
      this.setData({
        goodsList: this.data.goodsList
      })
    }
  },

  touchE: function(e) {
    var index = e.currentTarget.dataset.index;
    if (e.changedTouches.length == 1) {
      var endX = e.changedTouches[0].clientX;
      var disX = this.data.startX - endX;
      var delBtnWidth = this.data.delBtnWidth;
      //如果距离小于删除按钮的1/2，不显示删除按钮
      var left = disX > delBtnWidth / 2 ? "margin-left:-" + delBtnWidth + "px" : "margin-left:0px";
      this.data.goodsList.list[index].left = left
      this.setData({
        goodsList: this.data.goodsList
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
  jiaBtnTap: function(e) {
    var that = this
    var index = e.currentTarget.dataset.index;
    var list = that.data.goodsList.list;
    list[index].active = true
    if (index !== "" && index != null) {
      // 添加判断当前商品购买数量是否超过当前商品可购买库存
      var carShopBean = list[parseInt(index)];
      var carShopBeanStores = 0;
      WXAPI.goodsDetail(carShopBean.goodsId).then(function(res) {
        carShopBeanStores = res.data.basicInfo.stores;
        if (list[parseInt(index)].number < carShopBeanStores) {
          list[parseInt(index)].number++;
          that.setGoodsList(that.getSaveHide(), that.totalPrice(), that.allSelect(), that.noSelect(), list);
          that.changeCarNumber(e)
        }
        that.setData({
          curTouchGoodStore: carShopBeanStores
        })
      })
    }
  },
  jianBtnTap: function(e) {
    var index = e.currentTarget.dataset.index;
    var list = this.data.goodsList.list;
    list[index].active = true
    if (index !== "" && index != null) {
      if (list[parseInt(index)].number > 1) {
        list[parseInt(index)].number--;
        this.setGoodsList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);
        this.changeCarNumber(e)
      }
    }
  },

  // async jiaBtnTap(e) {
  //   const index = e.currentTarget.dataset.index;
  //   const item = this.data.shippingCarInfo.items[index]
  //   const number = item.number + 1
  //   const token = wx.getStorageSync('token')
  //   const res = await WXAPI.shippingCarInfoModifyNumber(token, item.key, number)
  //   this.shippingCarInfo()
  // },
  // async jianBtnTap(e) {
  //   const index = e.currentTarget.dataset.index;
  //   const item = this.data.shippingCarInfo.items[index]
  //   const number = item.number-1
  //   if (number <= 0) {
  //     // 弹出删除确认
  //     wx.showModal({
  //       content: '确定要删除该商品吗？',
  //       success: (res) => {
  //         if (res.confirm) {
  //           this.delItemDone(item.key)
  //         }
  //       }
  //     })
  //     return
  //   }
  //   const token = wx.getStorageSync('token')
  //   const res = await WXAPI.shippingCarInfoModifyNumber(token, item.key, number)
  //   this.shippingCarInfo()
  // },
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
  },
  changeCarNumber(e){
    const key = e.currentTarget.dataset.key
    const index = e.currentTarget.dataset.index
    const num = e.detail.value || this.data.goodsList.list[index].number
    if (e.detail.value){
      console.log(index,this.data.goodsList.list)
      this.data.goodsList.list[index].number = e.detail.value
    }
    const token = wx.getStorageSync('token')
    WXAPI.shippingCarInfoModifyNumber(token, key, num).then(res => {
      //this.shippingCarInfo()
      TOOLS.showTabBarBadge()
    })
  },
  editTap: function() {
    var list = this.data.goodsList.list;
    for (var i = 0; i < list.length; i++) {
      var curItem = list[i];
      curItem.active = false;
    }
    this.setData({
      delimghidden:false
    })
    this.setGoodsList(!this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);
  },
  saveTap: function() {
    var list = this.data.goodsList.list;
    for (var i = 0; i < list.length; i++) {
      var curItem = list[i];
      curItem.active = true;
    }
    this.setData({
      delimghidden:true
    })
    this.setGoodsList(!this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);
  },
  getSaveHide: function() {
    var saveHidden = this.data.goodsList.saveHidden;
    return saveHidden;
  },
  totalPrice: function() {
    var list = this.data.goodsList.list;
    var total = 0;
    for (var i = 0; i < list.length; i++) {
      var curItem = list[i];
      if (curItem.active) {
        total += parseFloat(curItem.price) * curItem.number;
      }
    }
    total = parseFloat(total.toFixed(2)); //js浮点计算bug，取两位小数精度
    return total;
  },
  allSelect: function() {
    var list = this.data.goodsList.list;
    var allSelect = false;
    for (var i = 0; i < list.length; i++) {
      var curItem = list[i];
      if (curItem.active) {
        allSelect = true;
      } else {
        allSelect = false;
        break;
      }
    }
    return allSelect;
  },
  noSelect: function() {
    var list = this.data.goodsList.list;
    var noSelect = 0;
    for (var i = 0; i < list.length; i++) {
      var curItem = list[i];
      if (!curItem.active) {
        noSelect++;
      }
    }
    if (noSelect == list.length) {
      return true;
    } else {
      return false;
    }
  },
  setGoodsList: function(saveHidden, total, allSelect, noSelect, list) {
    this.setData({
      goodsList: {
        saveHidden: saveHidden,
        totalPrice: total,
        allSelect: allSelect,
        noSelect: noSelect,
        list: list
      }
    });
    var shopCarInfo = {};
    var tempNumber = 0;
    shopCarInfo.shopList = list;
    for (var i = 0; i < list.length; i++) {
      tempNumber = tempNumber + list[i].number
    }
    shopCarInfo.shopNum = tempNumber;
    wx.setStorage({
      key: "shopCarInfo",
      data: shopCarInfo
    })
  },
  selectTap: function(e) {
    var index = e.currentTarget.dataset.index;
    var list = this.data.goodsList.list;
    if (index !== "" && index != null) {
      list[parseInt(index)].active = !list[parseInt(index)].active;
      this.setGoodsList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);
    }
  },
  setGoodsList: function(saveHidden, total, allSelect, noSelect, list) {
    this.setData({
      goodsList: {
        saveHidden: saveHidden,
        totalPrice: total,
        allSelect: allSelect,
        noSelect: noSelect,
        list: list
      }
    });
    var shopCarInfo = {};
    var tempNumber = 0;
    shopCarInfo.shopList = list; 
    for (var i = 0; i < list.length; i++) {
      tempNumber = tempNumber + list[i].number
    }
    shopCarInfo.shopNum = tempNumber;  //购物车商品总数量
    wx.setStorage({
      key: "shopCarInfo",
      data: shopCarInfo
    })
  },
  bindAllSelect: function() {
    var currentAllSelect = this.data.goodsList.allSelect;
    var list = this.data.goodsList.list;
    if (currentAllSelect) {
      for (var i = 0; i < list.length; i++) {
        var curItem = list[i];
        curItem.active = false;
      }
    } else {
      for (var i = 0; i < list.length; i++) {
        var curItem = list[i];
        curItem.active = true;
      }
    }

    this.setGoodsList(this.getSaveHide(), this.totalPrice(), !currentAllSelect, this.noSelect(), list);
  },
  toPayOrder: function() { // 去接下单结算
    const token = wx.getStorageSync('token');
    if (!token) {
      app.goLoginPageTimeOut()
      return
    }
    WXAPI.checkToken(token).then(function (res) {
      if (res.code != 0) {
        wx.removeStorageSync('token')
        app.goLoginPageTimeOut()
      }
    })
    wx.checkSession({
      fail() {
        app.goLoginPageTimeOut()
      }
    })
    wx.showLoading();
    var that = this;
    if (this.data.goodsList.noSelect) {
      wx.hideLoading();
      return;
    }
    // 重新计算价格，判断库存
    var shopList = [];
    var shopCarInfoMem = wx.getStorageSync('shopCarInfo');
    if (shopCarInfoMem && shopCarInfoMem.shopList) {
      // shopList = shopCarInfoMem.shopList
      shopList = shopCarInfoMem.shopList.filter(entity => {
        return entity.active;
      });
    }
    if (shopList.length == 0) {
      wx.hideLoading();
      return;
    }
    var isFail = false;
    var doneNumber = 0;
    var needDoneNUmber = shopList.length;
    for (let i = 0; i < shopList.length; i++) {
      if (isFail) {
        wx.hideLoading();
        return;
      }
      let carShopBean = shopList[i];
      // 获取价格和库存
      if (!carShopBean.propertyChildIds || carShopBean.propertyChildIds == "") {
        WXAPI.goodsDetail(carShopBean.goodsId).then(function(res) {
          doneNumber++;
          if (res.data.properties) {
            wx.showModal({
              title: '提示',
              content: res.data.basicInfo.name + ' 商品已失效，请重新购买',
              showCancel: false
            })
            isFail = true;
            wx.hideLoading();
            return;
          }
          if (res.data.basicInfo.stores < carShopBean.number) {
            wx.showModal({
              title: '提示',
              content: res.data.basicInfo.name + ' 库存不足，请重新购买',
              showCancel: false
            })
            isFail = true;
            wx.hideLoading();
            return;
          }
          if (res.data.basicInfo.minPrice != carShopBean.price) {
            wx.showModal({
              title: '提示',
              content: res.data.basicInfo.name + ' 价格有调整，请重新购买',
              showCancel: false
            })
            isFail = true;
            wx.hideLoading();
            return;
          }
          if (needDoneNUmber == doneNumber) {
            that.navigateToPayOrder();
          }
        })
      } else {
        WXAPI.goodsPrice({
          goodsId: carShopBean.goodsId,
          propertyChildIds: carShopBean.propertyChildIds
        }).then(function(res) {
          doneNumber++;
          if (res.data.stores < carShopBean.number) {
            wx.showModal({
              title: '提示',
              content: carShopBean.name + ' 库存不足，请重新购买',
              showCancel: false
            })
            isFail = true;
            wx.hideLoading();
            return;
          }
          if (res.data.price != carShopBean.price) {
            wx.showModal({
              title: '提示',
              content: carShopBean.name + ' 价格有调整，请重新购买',
              showCancel: false
            })
            isFail = true;
            wx.hideLoading();
            return;
          }
          if (needDoneNUmber == doneNumber) {
            that.navigateToPayOrder();
          }
        })
      }

    }
  },
  navigateToPayOrder: function() {
    wx.hideLoading();
    wx.navigateTo({
      url: "/pages/to-pay-order/index"
    })
  }


})
