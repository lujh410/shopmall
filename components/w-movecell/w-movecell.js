// components/w-movecell/w-movecell.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    isopen:false,
    x_end:0,
    x_start:0,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    handlerstart(e){
      this.data.x_start=e.changedTouches[0].pageX
    },
    handlerend(e){
      this.data.x_end=e.changedTouches[0].pageX
      var d = this.data.x_end-this.data.x_start
      if (d>20){
        this.setData({isopen:false})
      }
      if(d<-20){
        this.setData({isopen:true})
      }
    }
  }
})
