// pages/goods-details/goods-details.js
const WXAPI = require('apifm-wxapi')
const app = getApp();
const CONFIG = require('../../config.js')
const AUTH = require('../../utils/auth')
const SelectSizePrefix = "选择："
import Poster from 'wxa-plugin-canvas/poster/poster'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    wxlogin:true,
    shopNum:0,
    faved:0,
    goodsId:43341,
    hideShopPopup:true,
    canSubmit: false, //  选中规格尺寸时候是否允许加入购物车
    shopType: "addShopCar", //购物类型，加入购物车或立即购买，默认为加入购物车
    buyNumber: 0,
    buyNumMin: 1,
    buyNumMax: 0,
  },
  /**
   * 加入购物车
   */
  async addShopCar() {
    if (this.data.goodsDetail.properties && !this.data.canSubmit) {
      if (!this.data.canSubmit) {
        wx.showToast({
          title: '请选择规格',
          icon: 'none'
        })
      }
      this.bindGuiGeTap()
      return
    }
    if (this.data.buyNumber < 1) {
      wx.showToast({
        title: '请选择购买数量',
        icon: 'none'
      })
      return
    }
    const isLogined = await AUTH.checkHasLogined()
    if (!isLogined) {
      this.setData({
        wxlogin: false
      })
      return
    }
    const token = wx.getStorageSync('token')
    const goodsId = this.data.goodsDetail.basicInfo.id
    const sku = []
    if (this.data.goodsDetail.properties) {
      this.data.goodsDetail.properties.forEach(p => {
        sku.push({
          optionId: p.id,
          optionValueId: p.optionValueId
        })
      })
    }
    const res = await WXAPI.shippingCarInfoAddItem(token, goodsId, this.data.buyNumber, sku)
    if (res.code != 0) {
      wx.showToast({
        title: res.msg,
        icon: 'none'
      })
      return
    }

    this.closePopupTap();
    wx.showToast({
      title: '加入购物车',
      icon: 'success'
    })
    this.shippingCartInfo()
  },
// 数量加减
numJianTap: function() {
  if (this.data.buyNumber > this.data.buyNumMin) {
    var currentNum = this.data.buyNumber;
    currentNum--;
    this.setData({
      buyNumber: currentNum
    })
  }
},
numJiaTap: function() {
  if (this.data.buyNumber < this.data.buyNumMax) {
    var currentNum = this.data.buyNumber;
    currentNum++;
    this.setData({
      buyNumber: currentNum
    })
  }
},
/**
   * 选择商品规格
   * @param {Object} e
   */
  async labelItemTap(e) {
    const propertyindex = e.currentTarget.dataset.propertyindex
    const propertychildindex = e.currentTarget.dataset.propertychildindex

    const property = this.data.goodsDetail.properties[propertyindex]
    const child = property.childsCurGoods[propertychildindex]
    // 取消该分类下的子栏目所有的选中状态
    property.childsCurGoods.forEach(child => {
      child.active = false
    })
    // 设置当前选中状态
    property.optionValueId = child.id
    child.active = true
    // 获取所有的选中规格尺寸数据
    const needSelectNum = this.data.goodsDetail.properties.length
    let curSelectNum = 0;
    let propertyChildIds = "";
    let propertyChildNames = "";

    this.data.goodsDetail.properties.forEach(p => {
      p.childsCurGoods.forEach(c => {
        if (c.active) {
          curSelectNum++;
          propertyChildIds = propertyChildIds + p.id + ":" + c.id + ",";
          propertyChildNames = propertyChildNames + p.name + ":" + c.name + "  ";
        }
      })
    })
    let canSubmit = false;
    if (needSelectNum == curSelectNum) {
      canSubmit = true;
    }
    // 计算当前价格
    if (canSubmit) {
      const res = await WXAPI.goodsPrice(this.data.goodsDetail.basicInfo.id, propertyChildIds)
      if (res.code == 0) {
        let _price = res.data.price
        if (this.data.shopType == 'toPingtuan') {
          _price = res.data.pingtuanPrice
        }
        this.setData({
          selectSizePrice: _price,
          selectSizeOPrice: res.data.originalPrice,
          totalScoreToPay: res.data.score,
          propertyChildIds: propertyChildIds,
          propertyChildNames: propertyChildNames,
          buyNumMax: res.data.stores,
          buyNumber: (res.data.stores > 0) ? 1 : 0
        });
      }
    }
    let skuGoodsPic = this.data.skuGoodsPic
    if (this.data.goodsDetail.subPics && this.data.goodsDetail.subPics.length > 0) {
      const _subPic = this.data.goodsDetail.subPics.find(ele => {
        return ele.optionValueId == child.id
      })
      if (_subPic) {
        skuGoodsPic = _subPic.pic
      }
    }
    this.setData({
      goodsDetail: this.data.goodsDetail,
      canSubmit: canSubmit,
      skuGoodsPic
    })
  },
// 外部：立即购买
  tobuy: function() {
    this.setData({
      shopType: "tobuy"
    });
    this.bindGuiGeTap();
  },
  // 弹窗内的：立即购买
  buyNow: function(e) {
    let that = this
    let shoptype = e.currentTarget.dataset.shoptype
    console.log(shoptype)
    if (this.data.goodsDetail.properties && !this.data.canSubmit) {
      if (!this.data.canSubmit) {
        wx.showModal({
          title: '提示',
          content: '请选择商品规格！',
          showCancel: false
        })
      }
      this.bindGuiGeTap();
      wx.showModal({
        title: '提示',
        content: '请先选择规格尺寸哦~',
        showCancel: false
      })
      return;
    }
    if (this.data.buyNumber < 1) {
      wx.showModal({
        title: '提示',
        content: '购买数量不能为0！',
        showCancel: false
      })
      return;
    }
    //组建立即购买信息
    var buyNowInfo = this.buliduBuyNowInfo(shoptype);
    // 写入本地存储
    wx.setStorage({
      key: "buyNowInfo",
      data: buyNowInfo
    })
    this.closePopupTap();
    if (shoptype == 'toPingtuan') {
      if (this.data.pingtuanopenid) {
        wx.navigateTo({
          url: "/pages/pay-order/pay-order?orderType=buyNow&pingtuanOpenId=" + this.data.pingtuanopenid
        })
      } else {
        WXAPI.pingtuanOpen(wx.getStorageSync('token'), that.data.goodsDetail.basicInfo.id).then(function(res) {
          if (res.code == 2000) {
            that.setData({
              wxlogin: false
            })
            return
          }
          if (res.code != 0) {
            wx.showToast({
              title: res.msg,
              icon: 'none',
              duration: 2000
            })
            return
          }
          wx.navigateTo({
            url: "/pages/pay-order/pay-order?orderType=buyNow&pingtuanOpenId=" + res.data.id
          })
        })
      }
    } else {
      wx.navigateTo({
        url: "/pages/pay-order/pay-order?orderType=buyNow"
      })
    }

  },
  /**
   * 组建立即购买信息
   */
  buliduBuyNowInfo: function(shoptype) {
    var shopCarMap = {};
    shopCarMap.goodsId = this.data.goodsDetail.basicInfo.id;
    shopCarMap.pic = this.data.goodsDetail.basicInfo.pic;
    shopCarMap.name = this.data.goodsDetail.basicInfo.name;
    // shopCarMap.label=this.data.goodsDetail.basicInfo.id; 规格尺寸 
    shopCarMap.propertyChildIds = this.data.propertyChildIds;
    shopCarMap.label = this.data.propertyChildNames;
    shopCarMap.price = this.data.selectSizePrice;
    // if (shoptype == 'toPingtuan') { // 20190714 拼团价格注释掉
    //   shopCarMap.price = this.data.goodsDetail.basicInfo.pingtuanPrice;
    // }
    shopCarMap.score = this.data.totalScoreToPay;
    shopCarMap.left = "";
    shopCarMap.active = true;
    shopCarMap.number = this.data.buyNumber;
    shopCarMap.logisticsType = this.data.goodsDetail.basicInfo.logisticsId;
    shopCarMap.logistics = this.data.goodsDetail.logistics;
    shopCarMap.weight = this.data.goodsDetail.basicInfo.weight;

    var buyNowInfo = {};
    buyNowInfo.shopNum = 0;
    buyNowInfo.shopList = [];
    
    /*    var hasSameGoodsIndex = -1;
        for (var i = 0; i < toBuyInfo.shopList.length; i++) {
          var tmpShopCarMap = toBuyInfo.shopList[i];
          if (tmpShopCarMap.goodsId == shopCarMap.goodsId && tmpShopCarMap.propertyChildIds == shopCarMap.propertyChildIds) {
            hasSameGoodsIndex = i;
            shopCarMap.number = shopCarMap.number + tmpShopCarMap.number;
            break;
          }
        }
        toBuyInfo.shopNum = toBuyInfo.shopNum + this.data.buyNumber;
        if (hasSameGoodsIndex > -1) {
          toBuyInfo.shopList.splice(hasSameGoodsIndex, 1, shopCarMap);
        } else {
          toBuyInfo.shopList.push(shopCarMap);
        }*/

    buyNowInfo.shopList.push(shopCarMap);
    buyNowInfo.kjId = this.data.kjId;
    return buyNowInfo;
  },
  // 预览的图片
  previewImage(e){
    const url = e.currentTarget.dataset.url
    wx.previewImage({
      current: url, // 当前显示图片的http链接
      urls: [url] // 需要预览的图片http链接列表
    })
  },
  toAddShopCar: function() {
    this.setData({
      shopType: "addShopCar"
    })
    this.bindGuiGeTap();
  },
  /**
   * 规格选择弹出框
   */
  bindGuiGeTap: function() {
    this.setData({
      hideShopPopup: false,
      selectSizePrice: this.data.goodsDetail.basicInfo.minPrice,
      selectSizeOPrice: this.data.goodsDetail.basicInfo.originalPrice,
      skuGoodsPic: this.data.goodsDetail.basicInfo.pic
    })
  },
  /**
   * 规格选择弹出框隐藏
   */
  closePopupTap: function() {
    this.setData({
      hideShopPopup: true
    })
  },
  goShopCar: function() {
    wx.reLaunch({
      url: "/pages/shop-cart/shop-cart"
    });
  },

  async goodsFavCheck() {
    //检查商品的否被收藏
    WXAPI.goodsFavList({
      token: wx.getStorageSync('token')
    })
    const res = await WXAPI.goodsFavCheck(wx.getStorageSync('token'), this.data.goodsId)
    if (res.code == 0) {
      this.setData({
        faved: true
      })
    } else {
      this.setData({
        faved: false
      })
    }
  },

  async addFav(){
    //加收藏，用token和goodsID去服务器获取
    AUTH.checkHasLogined().then(isLogined => {
      this.setData({
        wxlogin: isLogined
      })
      if (isLogined) {
        if (this.data.faved) {
          // 取消收藏
          WXAPI.goodsFavDelete(wx.getStorageSync('token'), '', this.data.goodsId).then(res => {
            this.goodsFavCheck()
          })
        } else {
          // 加入收藏
          WXAPI.goodsFavPut(wx.getStorageSync('token'), this.data.goodsId).then(res => {
            this.goodsFavCheck()
          })
        }
      }
    })
  },
  //获取商品信息
  async getGoodsDetailAndKanjieInfo(goodsId) {
    const that = this;
    const goodsDetailRes = await WXAPI.goodsDetail(goodsId)
    const goodsKanjiaSetRes = await WXAPI.kanjiaSet(goodsId)
    if (goodsDetailRes.code == 0) {
      //无properties
      var selectSizeTemp = SelectSizePrefix;
      if (goodsDetailRes.data.properties) {
        for (var i = 0; i < goodsDetailRes.data.properties.length; i++) {
          selectSizeTemp = selectSizeTemp + " " + goodsDetailRes.data.properties[i].name;
        }
        that.setData({
          hasMoreSelect: true,
          selectSize: selectSizeTemp,
          selectSizePrice: goodsDetailRes.data.basicInfo.minPrice,
          selectSizeOPrice: goodsDetailRes.data.basicInfo.originalPrice,
          totalScoreToPay: goodsDetailRes.data.basicInfo.minScore
        });
      }
      //无shopId
      if (goodsDetailRes.data.basicInfo.shopId) {
        this.shopSubdetail(goodsDetailRes.data.basicInfo.shopId)
      }
      //无拼团
      if (goodsDetailRes.data.basicInfo.pingtuan) {
        that.pingtuanList(goodsId)
      }
      //给商品变量传值-------------------------------
      that.data.goodsDetail = goodsDetailRes.data;
      //1.视频需单独获取
      if (goodsDetailRes.data.basicInfo.videoId) {
        that.getVideoSrc(goodsDetailRes.data.basicInfo.videoId);
      }
      //2.砍价和拼团相关数据
      let _data = {
        goodsDetail: goodsDetailRes.data,
        selectSizePrice: goodsDetailRes.data.basicInfo.minPrice,
        selectSizeOPrice: goodsDetailRes.data.basicInfo.originalPrice,
        totalScoreToPay: goodsDetailRes.data.basicInfo.minScore,
        buyNumMax: goodsDetailRes.data.basicInfo.stores,
        buyNumber: (goodsDetailRes.data.basicInfo.stores > 0) ? 1 : 0
      }
      //以下砍价----------------------------
      if (goodsKanjiaSetRes.code == 0) {
        _data.curGoodsKanjia = goodsKanjiaSetRes.data[0]
        that.data.kjId = _data.curGoodsKanjia.id
        // 获取当前砍价进度
        if (!that.data.kjJoinUid) {
          that.data.kjJoinUid = wx.getStorageSync('uid')
        }
        const curKanjiaprogress = await WXAPI.kanjiaDetail(_data.curGoodsKanjia.id, that.data.kjJoinUid)
        const myHelpDetail = await WXAPI.kanjiaHelpDetail(wx.getStorageSync('token'), _data.curGoodsKanjia.id, that.data.kjJoinUid)
        if (curKanjiaprogress.code == 0) {
          _data.curKanjiaprogress = curKanjiaprogress.data
        }
        if (myHelpDetail.code == 0) {
          _data.myHelpDetail = myHelpDetail.data
        }
      }
      //以上是砍价----------------------------
      //以下是拼团--------------------
      if (goodsDetailRes.data.basicInfo.pingtuan) {
        const pingtuanSetRes = await WXAPI.pingtuanSet(goodsId)
        if (pingtuanSetRes.code == 0) {
          _data.pingtuanSet = pingtuanSetRes.data
          // 如果是拼团商品， 默认显示拼团价格
          _data.selectSizePrice = goodsDetailRes.data.basicInfo.pingtuanPrice
        }        
      }
      //以下是拼团--------------------
      that.setData(_data);
    }
  },
  getVideoSrc: function(videoId) {
    var that = this;
    WXAPI.videoDetail(videoId).then(function(res) {
      if (res.code == 0) {
        that.setData({
          videoMp4Src: res.data.fdMp4
        });
      }
    })
  },
  async drawSharePic() {
    const _this = this
    const qrcodeRes = await WXAPI.wxaQrcode({
      scene: _this.data.goodsDetail.basicInfo.id + ',' + wx.getStorageSync('uid'),
      page: 'pages/goods-details/goods-details',
      is_hyaline: true,
      autoColor: true,
      expireHours: 1
    })
    console.log(qrcodeRes)
    if (qrcodeRes.code != 0) {
      wx.showToast({
        title: qrcodeRes.msg,
        icon: 'none'
      })
      return
    }
    const qrcode = qrcodeRes.data
    const pic = _this.data.goodsDetail.basicInfo.pic
    console.log(qrcode,pic)
    wx.getImageInfo({
      src: pic,
      success(res) {
        const height = 490 * res.height / res.width
        _this.drawSharePicDone(height, qrcode)
      },
      fail(e) {
        console.error(e)
      }
    })
  },
  drawSharePicDone(picHeight, qrcode) {
    const _this = this
    const _baseHeight = 74 + (picHeight + 120)
    this.setData({
      posterConfig: {
        width: 750,
        height: picHeight + 660,
        backgroundColor: '#fff',
        debug: false,
        blocks: [
          {
            x: 76,
            y: 74,
            width: 604,
            height: picHeight + 120,
            borderWidth: 2,
            borderColor: '#c2aa85',
            borderRadius: 8
          }
        ],
        images: [
          {
            x: 133,
            y: 133,
            url: _this.data.goodsDetail.basicInfo.pic, // 商品图片
            width: 490,
            height: picHeight
          },
          {
            x: 76,
            y: _baseHeight + 199,
            url: qrcode, // 二维码
            width: 222,
            height: 222
          }
        ],
        texts: [
          {
            x: 375,
            y: _baseHeight + 80,
            width: 650,
            lineNum:2,
            text: _this.data.goodsDetail.basicInfo.name,
            textAlign: 'center',
            fontSize: 40,
            color: '#333'
          },
          {
            x: 375,
            y: _baseHeight + 180,
            text: '￥' + _this.data.goodsDetail.basicInfo.minPrice,
            textAlign: 'center',
            fontSize: 50,
            color: '#e64340'
          },
          {
            x: 352,
            y: _baseHeight + 320,
            text: '长按识别小程序码',
            fontSize: 28,
            color: '#999'
          }
        ],
      }
    }, () => {
      Poster.create();
    });
  },
  onPosterSuccess(){
    console.log("成功")
  },
  onPosterFail(){
    console.log("失败")
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (e) {
       //e.id = 235853
       if (e && e.scene) {
        const scene = decodeURIComponent(e.scene) // 处理扫码进商品详情页面的逻辑
        if (scene && scene.split(',').length >= 2) {
          e.id = scene.split(',')[0]
          wx.setStorageSync('referrer', scene.split(',')[1])
        }
      }
      this.data.goodsId = e.id
      const that = this
      this.data.kjJoinUid = e.kjJoinUid    
      this.setData({
        goodsDetailSkuShowType: CONFIG.goodsDetailSkuShowType,
        curuid: wx.getStorageSync('uid')
      })
      //this.reputation(e.id)
      this.shippingCartInfo()
    },  
    async shippingCartInfo(){
      const token = wx.getStorageSync('token')
      if (!token) {
        return
      }
      const res = await WXAPI.shippingCarInfo(token)
      if (res.code == 0) {
        this.setData({
          shopNum: res.data.number
        })
      }
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
    AUTH.checkHasLogined().then(isLogined => {
      if (isLogined) {
        this.setData({
          wxlogin: isLogined
        })
        this.goodsFavCheck()
      }
    })
    this.getGoodsDetailAndKanjieInfo(this.data.goodsId)
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