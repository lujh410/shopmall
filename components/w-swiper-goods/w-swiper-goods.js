// components/w-swiper-goods/w-swiper-goods.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    goods:{
      type:Object,
      value:{
        a:{list:[]},
        b:{list:[]},
        c:{list:[]}
      }
    },
    currentIndex:{
      type:Number,
      value:0
    },
    swiper_height:{
      type:Number,
      value:3000
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    handlerswiper(e){
      this.triggerEvent("swiperchange",{"index":e.detail.current},{})
    },
    
  }
})
