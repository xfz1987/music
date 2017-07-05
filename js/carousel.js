;(function($){
    var Carousel = function(poster){
        //保存单个旋转木马对象
        this.poster = poster;
        this.posterItemMain = poster.find('.poster-list');
        this.nextBtn = poster.find(".next");
        this.prevBtn = poster.find(".prev");
        this.posterItems = poster.find("li");
        if(this.posterItems.size()%2 === 0){//解决偶数张图片，左右不对称:克隆一个
            this.posterItemMain.append(this.posterItems.eq(0).clone());
            this.posterItems = this.posterItemMain.children();
        }
        this.posterFirstItem = this.posterItemMain.find('li:eq(0)');
        this.posterLastItem  = this.posterItems.last();
        this.canRotate = true;//能否旋转
        //默认参数
        this.setting = {
            'width':800,//整个幻灯片区域的宽度
            'height':270,//整个幻灯片区域的高度
            'posterWidth':640,//幻灯片第一帧的宽度
            'posterHeight':270,//幻灯片第一帧的高度
            'scale':0.9,//每张图片的大小递减比例（第二张图片与第一张图片显示比例）
            'speed':500,//切换速度:ms
            'verticalAlign':'middle',//图片展示的对齐方式
            'autoPlay':false,
            'delay':5000,
        };
        //扩展参数
        $.extend(true, this.setting, this.getSetting());
        this.setSettingValue();
        this.setPosterPos();
        this.initEvent();
    };
    Carousel.prototype = {
        autoPlay:function(){
            var me = this;
            me.timer = window.setInterval(function(){
                me.nextBtn.click();//这里this指的是window
            },me.setting.delay);
        },
        initEvent:function(){
            var me = this;
            //左旋转按钮
            me.nextBtn.on('click',function(){
                if(me.canRotate){
                    me.canRotate = false;
                    me.rotateRight();
                }
            });
            //右旋转按钮
            me.prevBtn.on('click',function(){
                if(me.canRotate){
                    me.canRotate = false;
                    me.rotateLeft();
                }
            });
            //是否开启自动播放
            if(this.setting.autoPlay){
                this.autoPlay();
            }
        },

        //左旋转
        rotateLeft:function(){
            var me = this;
            var zIndexArr = [];
            me.posterItems.each(function(){
                var prev = $(this).prev().get(0)?$(this).prev():me.posterLastItem,
                    width = prev.width(),
                    height = prev.height(),
                    zIndex = prev.css("zIndex"),
                    opacity = prev.css("opacity"),
                    left = prev.css("left"),
                    top = prev.css("top");
                zIndexArr.push(zIndex);
                //zIndex,不在这里过度，否则看起来很突兀
                $(this).animate({width:width,height:height,opacity:opacity,left:left,top:top},me.setting.speed,function(){
                    me.canRotate = true;
                });
            });
            //zIndex需要单独保存再设置，防止循环时候设置再取的时候值永远是最后一个的zindex
            me.posterItems.each(function(i){
                $(this).css("zIndex",zIndexArr[i]);
            });
        },
        //右旋转
        rotateRight:function(){
            var me = this;
            var zIndexArr = [];
            me.posterItems.each(function(){
                var next = $(this).next().get(0)?$(this).next():me.posterFirstItem,
                    width = next.width(),
                    height =next.height(),
                    zIndex = next.css("zIndex"),
                    opacity = next.css("opacity"),
                    left = next.css("left"),
                    top = next.css("top");
                zIndexArr.push(zIndex);
                $(this).animate({width:width,height:height,opacity:opacity,left:left,top:top},me.setting.speed,function(){
                    me.canRotate = true;
                });
            });
            //zIndex需要单独保存再设置，防止循环时候设置再取的时候值永远是第一个的zindex
            me.posterItems.each(function(i){
                $(this).css("zIndex",zIndexArr[i]);
            });
        },

        //设置剩余帧的位置关系
        setPosterPos:function(){
            var me = this,
                sliceItems = me.posterItems.slice(1),
                rightSlice = sliceItems.slice(0,sliceItems.size()/2);
                level = Math.floor(me.posterItems.size()/2),
                rw = me.setting.posterWidth,
                rh = me.setting.posterHeight,
                gap = ((me.setting.width-me.setting.posterWidth)/2)/level,
                firstLeft = (me.setting.width-me.setting.posterWidth)/2;

            //设置右边帧的位置关系、宽度、高度、top、left、opacity
            rightSlice.each(function(i){
                level--;
                rw *= me.setting.scale;
                rh *= me.setting.scale;
                var j = i;
                $(this).css({
                    'zIndex':level,
                    'width':rw,
                    'height':rh,
                    //'top':(me.setting.height-rh)/2,
                    'top':me.setVerticalAlign(rh),
                    'left':(firstLeft + me.setting.posterWidth + (++j)*gap - rw),
                    'opacity': 1/(++j)
                });
            });

            var leftSlice = sliceItems.slice(sliceItems.size()/2),
                lw = rightSlice.last().width(),
                lh = rightSlice.last().height();
                op = Math.ceil(me.posterItems.size()/2);
            //设置左边的位置关系
            leftSlice.each(function(i){
                $(this).css({
                    'zIndex':i,
                    'width':lw,
                    'height':lh,
                    'top':me.setVerticalAlign(lh),
                    'left':i*gap,
                    'opacity':1/op
                });
                lw = lw/me.setting.scale;
                lh = lh/me.setting.scale;
                op--;
            });

        },
        //设置配置参数值去控制基本的宽度、高度...
        setSettingValue:function(){
            this.poster.css({
                'width':this.setting.width+'px',
                'height':this.setting.height+'px'
            });
            this.posterItemMain.css({
                'width': this.setting.width+'px',
                'height':this.setting.height+'px'
            });
            //计算上下切换按钮的宽度
            var w = (this.setting.width-this.setting.posterWidth)/2;
            //设置切换按钮的宽高，层级关系
            this.nextBtn.css({
                'width':w,
                'height':this.setting.height,
                'zIndex':Math.ceil(this.posterItems.size()/2)
            });
            this.prevBtn.css({
                'width':w,
                'height':this.setting.height,
                'zIndex':Math.ceil(this.posterItems.size()/2)
            });
            this.posterFirstItem.css({
                'width':this.setting.posterWidth,
                'height':this.setting.posterHeight,
                'left':w,
                'top':0,
                'zIndex':Math.floor(this.posterItems.size()/2)//比如有9张图片，在第一张左右各有四张图片，那么他的层级就很明显了
            });
        },
        setVerticalAlign(height){
            var top = 0;
            switch(this.setting.verticalAlign){
                case 'middle':
                    top = (this.setting.height-height)/2;
                    break;
                case 'top':
                    top = 0;
                    break;
                case 'bottom':
                    top = this.setting.height-height;
                    break;
                default:
                    top = (this.setting.height-height)/2;
            }
            return top;
        },
        //获取人工配制参数
        getSetting(){
            var setting = this.poster.attr('data-setting');
            return (setting ? $.parseJSON(setting) : {});
        }
    };

    Carousel.init = function(posters){
        var me = this;//Carousel
        posters.each(function(){
            new me($(this));//this为循环中的每一个对象
        });
    };
    //全局注册，否则外面访问不到
    window['Carousel'] = Carousel;
})(jQuery);