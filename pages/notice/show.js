const app = getApp();
const WXAPI = require('apifm-wxapi')
Page({
  data: {
  // notice:""
  content:""
  },
  onLoad: function (options) {
    var that = this;
    WXAPI.noticeDetail(options.id).then(function (res) {
      if (res.code == 0) {
        that.setData({
          notice: res.data
        });
      }
    })
  },
  onShow(){
    this.setData({
      content:'<div blkclick="auto_nav" blktitle="图片" id="fc_B_pic"><div class="uni-blk-bt clearfix" data-sudaclick="blk_photo1"><a class="uni-blk-pic" target="_blank" href="http://slide.news.sina.com.cn/c/slide_1_2841_458958.html" style=""><img src="//n.sinaimg.cn/news/transform/350/w210h140/20200526/ee99-itzixrt5170953.jpg" width="105" height="70"><span>赌王何鸿燊去世</span></a><a class="uni-blk-pic" target="_blank" href="http://slide.news.sina.com.cn/w/slide_1_86058_458876.html" style="margin-left:19px;"><img src="//n.sinaimg.cn/news/transform/350/w210h140/20200526/4b50-itzixrt3910741.jpg" width="105" height="70"><span>日本解除紧急状态</span></a><a class="uni-blk-pic" target="_blank" href="http://slide.news.sina.com.cn/slide_1_86058_458899.html" style="margin-left:19px;"><img src="//n.sinaimg.cn/news/transform/350/w210h140/20200526/a7de-itzixrt3917587.jpg" width="105" height="70"><span>协和医院线上诊疗</span></a></div><ul class="uni-blk-list02 list-a" style="padding-top:7px; _zoom:1;" data-sudaclick="blk_photo2"><li><a target="_blank" href="http://slide.news.sina.com.cn/slide_1_86523_458887.html" class="liveNewsLeft photoNewsLeft">济南首批小学生复课倒计时：老师都做了哪些准备</a></li><li><a target="_blank" href="http://slide.news.sina.com.cn/slide_1_86523_458869.html" class="liveNewsLeft photoNewsLeft">浙江有个“手术刀”乐队 成立8年原创20余首音乐</a></li><li><a target="_blank" href="http://slide.news.sina.com.cn/slide_1_86058_458913.html" class="liveNewsLeft photoNewsLeft">中国抗疫医疗专家组离开津巴布韦前往赤道几内亚</a></li></ul><ul class="uni-blk-list02 list-a" data-sudaclick="blk_photo_fashion"><ul class="uni-blk-list02 list-a" data-sudaclick="blk_photo_fashion"><li><a class="photoNewsLeft linkRed01" target="_blank" href="http://slide.fashion.sina.com.cn/s/slide_24_84625_134451.html">倪妮夏夜花丛文艺感十足</a> <a target="_blank" href="http://slide.fashion.sina.com.cn/s/slide_24_84625_134366.html" class="linkRed01">李易峰银发化身漫画少年</a></li></ul></ul></div>'
    })
  },
  onShareAppMessage() {
  },
})