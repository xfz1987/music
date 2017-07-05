;(function(){
	var MusicPlay = function(options){
		this.backBtn = options.backBtn;
    	this.playBtn = options.playBtn;
    	this.forwardBtn = options.forwardBtn;
    	this.titleNode = options.titleNode;
    	this.authorNode = options.authorNode;
    	this.timeNode = options.timeNode;
    	this.progressBarNode = options.progressBarNode;
    	this.progressNowNode = options.progressNowNode;
    	this.icon = options.icon;
    	this.iconStatusClass = options.iconStatusClass;
    	this.timer = null;
    	this.musicIndex = 0;
    	this.musicList = [];
    	this.music = null;
    	this._init();
	};
	MusicPlay.prototype = {
		_init: function(){
			this.music = new Audio();
			this.music.autoplay = true;
			this.music.shouldUpdate = true;
			var _this = this;
			this._getMusic(function(list){
				_this.musicList = list;
				_this._loadMusic(list[_this.musicIndex]);
				_this._initEvent();
			});
		},
		_getMusic: function(callback){
			var xhr = new XMLHttpRequest(),_this = this;
      		xhr.open('get', 'music.json', true);
      		xhr.send();
      		xhr.onload = function() {
      		  if((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304){
      		    callback(JSON.parse(xhr.responseText));
      		  }
      		};
		},
		_loadMusic: function(songObj){
			this.music.src = songObj.src;
			this.titleNode.innerText = songObj.title;
			this.authorNode.innerText = songObj.auther;
		},
		_initEvent: function(){
			var _this = this;
			this.playBtn.addEventListener('click', function(){
				debugger;
      			_this.icon.classList.contains(_this.iconStatusClass.play) ? _this.music.play() : _this.music.pause();
      			_this.icon.classList.toggle(_this.iconStatusClass.play);
      			_this.icon.classList.toggle(_this.iconStatusClass.pause);
			}, false);

      		this.forwardBtn.addEventListener('click', function(){
      			_this.loadNPMusic('next');
      		}, false);

      		this.backBtn.addEventListener('click', function(){
      			_this.loadNPMusic('prev');
      		}, false);

      		this.music.addEventListener('ended', function(){
      			_this.loadNPMusic('next');
      		}, false);

      		this.music.addEventListener('playing', function(){
      			_this.timer = setInterval(function(){
        			_this.updateProgress();
      			}, 1000)
      		}, false);

      		this.music.addEventListener('pause', function(){
      			clearInterval(_this.timer);
      		}, false);

      		this.progressBarNode.addEventListener('click', function(e){
      			var percent = e.offsetX / parseInt(getComputedStyle(this).width);
      			_this.music.currentTime = percent * _this.music.duration;
      			_this.progressNowNode.style.width = percent * 100 + "%";
      		}, false);
		},
		loadNPMusic(type){
			if(type == 'next'){
				this.musicIndex++;
      			this.musicIndex = this.musicIndex % this.musicList.length;
			}else{
				this.musicIndex--;
     	 		this.musicIndex = (this.musicIndex + this.musicList.length) % this.musicList.length;
			}
			this._loadMusic(this.musicList[this.musicIndex]);
		},
		updateProgress: function(){
			var percent = (this.music.currentTime / this.music.duration) * 100 + '%';
      		this.progressNowNode.style.width = percent;
      		var minutes = parseInt(this.music.currentTime / 60),
      			seconds = parseInt(this.music.currentTime % 60) + '';
      		seconds = seconds.length == 2 ? seconds : '0' + seconds;
      		this.timeNode.innerText = minutes + ':' + seconds;
		}
	};
	MusicPlay.init = function(config){
		new MusicPlay(config);
	};
	window['MusicPlay'] = MusicPlay;
})();