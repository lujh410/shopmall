// pages/home/home.js
import {
  getMultiData,
  getProduct
} from "../../service/home.js"

import {
  POP,
  SELL,
  NEW,
  BACK_TOP_POSITION
} from '../../common/const.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    banners: [],
    recommends:[],
    titles:[[POP],[NEW],[SELL]],
    goods:{
      //指定是变量加[]，调用的时候需要this.data.goods[type].page
      [POP]: { page: 1, list: [] },
      [NEW]: { page: 1, list: [] },
      [SELL]: { page: 1, list: [] },

    },
    currenttype:[POP],
    currentIndex:0,
    showBackTop:false,
    showTabControl:false,
    tabControlTop:0,
    scrollPosition:600,
    swiper_height:3000
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //1.请求轮播图和推荐的数据
    this._getData()
  },
  /**
   * 处理网络请求------------------------------------
   */
    // 网络请求相关方法
    _getData() {
      this._getMultiData(); // 获取上面的数据
      this._getProductData(POP);
      this._getProductData(NEW);
      this._getProductData(SELL);
    },
  _getMultiData(){
      //1.请求轮播图和推荐的数据
      getMultiData().then(res=>{
        //取出轮播图和推荐的数据
        //console.log(res)
        const banners  = res.data.banner.list;
        const recommends = res.data.recommend.list;
        //2.设置数据
        this.setData({
          banners:banners,
          recommends:recommends
        })
      })
  },
  _getProductData(type){
       // 1.获取数据对应的页码
       const page = this.data.goods[type].page;

       // 2.请求数据
       getProduct(type, page).then(res => {
         // 1.取出数据
         const list = res.data.list;

         // 2.将数据临时获取
         const goods = this.data.goods;
        //...表示每个值以append方式追加到列表中,不能使用直接赋值方法，因为下拉商品是越来越多
         goods[type].list.push(...list)
         goods[type].page += 1;
   
         // 3.最新的goods设置到goods中
         this.setData({
           goods: goods
         })
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
    this._getProductData(this.data.currenttype)
    // setTimeout(this.changeheight ,1000)
    //this.changeheight()
    let systemInfo = wx.getSystemInfoSync()
    console.log(systemInfo)
    
  },
  changeheight(){
    wx.createSelectorQuery().select('#goods_id').boundingClientRect((rect) =>{
      console.log(rect)
      var height = rect.bottom
      if (this.data.swiper_height<=height){
      this.setData({
        swiper_height:height
      })
    }
      //console.log(this.data.swiper_height)
    }).exec()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
   /**
   * 处理事件监听------------------------------
   */
  tabclick(e){
    this.setData({
      currenttype : this.data.titles[e.detail.index],
      currentIndex:e.detail.index
    })
  },

    // 获取滚动条当前位置
    onPageScroll: function (e) {
      //--------显示回到顶部控件------------------
      if (e.scrollTop > this.data.scrollPosition) {
        this.setData({
          showBackTop: true
        });
      } else {
        this.setData({
          showBackTop: false
        });
      }
      //获取tabbar控件的位置,判定高度，如果小于0，则显示
      wx.createSelectorQuery().select('.tab-control').boundingClientRect((rect) => {
        const show = rect.top > 0
        if (this.data.showTabControl == show){
          this.setData({
            showTabControl: !show
          })}
      }).exec()

     // this.changeheight()
    },
    //图片加载完成，获取tabbar的位置
    onImageLoad(){
      wx.createSelectorQuery().select('.tab-control').boundingClientRect((rect) => {
        this.setData({
          tabControlTop: rect.top
        })
      }).exec()
    }
   

})