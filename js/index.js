enchant();

PLAYER_ROTATE_RADIUS = 200;
PLAYER_INIT_ROTATE_DEGREE = -90;
PLAYER_MOVE_ROTATE_DEGREE = 1.5;
PLAYER_SPRITE_SIZE = 48;
TRANSFORM_OPACITY_SPEED = 0.03;
PLAYER_TWEET_SHOW_TIME = 10;
PLAYER_TWEET_INTERVAL = 60;
var PlayerCircle = enchant.Class.create(enchant.Sprite,{
	initialize: function(game, players, radius, offset_x, offset_y){
		var degree = 360/players.length;
		var player;
		for(var i in players){
			player = new Player(game, players[i].text, players[i].profile_image_url, radius, offset_x, offset_y, i*degree, i*degree);
		}
	}
});

var PlayerBalloon = enchant.Class.create(enchant.Sprite,{
	initialize: function(game, image_name, player){
		enchant.Sprite.call(this, 105, 85);
		this.player = player;
		this.game = game;
		this.image = game.assets[image_name];
		// this.scale(0.3, 0.3);
		this.x = player.x;
		this.y = player.y - this.height;
		game.rootScene.addChild(this);
		
		// tweet
		this.label = new Label(player.tweet);
		this.label.x = player.x;
		this.label.y = player.y;
		game.rootScene.addChild(this.label);
	},
	remove: function(){
		this.game.rootScene.removeChild(this);
		delete this;
	}
});

var Player = enchant.Class.create(enchant.Sprite,{
	initialize: function(game, tweet, image_name, radius, offset_from_center_x, offset_from_center_y, rotate_degree_from_center, rotate_self_degree){
		enchant.Sprite.call(this, PLAYER_SPRITE_SIZE, PLAYER_SPRITE_SIZE);
		try{
			this.image = game.assets[image_name];
		}catch( e ){
		}
		// this.scale(0.5, 0.5);
		this.time = 0;
		this.rotate(rotate_self_degree);
		
		// game
		this.game = game;
		
		// initial pos
		this.scale_vector = 1;
		this.rotate_degree_from_center = rotate_degree_from_center;
		this.radius = radius;
		this.offset_from_center_x = offset_from_center_x;
		this.offset_from_center_y = offset_from_center_y;
		this.opacity = 0.1;
		var radian = (Math.PI / 180) * rotate_degree_from_center;
		var offset_radian = (Math.PI / 180) * PLAYER_INIT_ROTATE_DEGREE;
		var x = Math.cos(radian + offset_radian) * this.radius + this.offset_from_center_x;
		var y = Math.sin(radian + offset_radian) * this.radius + this.offset_from_center_y;
		this.x = x;
		this.y = y;
		
		// tweet
		this.tweet = tweet;
		// this.balloon = new PlayerBalloon(game, 'balloon.png', this);
		// this.tweet = tweet;
		// this.label = new Label(this.tweet);
		// this.label.x = this.x;
		// this.label.y = this.y;
		// game.rootScene.addChild(this.label);
		
		// frame
		this.frame = 0;
		
		this.addEventListener('enterframe', function(){
			this.show_tweet(this.tweet);
			this.transform_opacity();
			this.rotate_from_center();
			// this.balloon.x = this.x;
			// this.balloon.y = this.y - this.balloon.height;
		});
		game.rootScene.addChild(this);
	},
	remove: function(){
		this.game.rootScene.removeChild(this);
		delete this;
	},
	show_tweet: function(tweet){
		if(++this.frame >= 100){
			this.game.rootScene.removeChild(this.label);
		}
		//var label = new Label(this.tweet);
		// var label = new Label("test");
        // scene.addChild(label);
        //game.frame % 3
	},
	transform_opacity: function(){
		if(this.opacity >= 1){
			this.opacity = 1;
		}else{
			this.opacity += TRANSFORM_OPACITY_SPEED;
		}
	},
	rotate_from_center: function(){
		this.rotate_degree_from_center += PLAYER_MOVE_ROTATE_DEGREE * Math.random(); 
		var radian = (Math.PI / 180) * this.rotate_degree_from_center;
		var offset_radian = (Math.PI / 180) * PLAYER_INIT_ROTATE_DEGREE;
		var x = Math.cos(radian + offset_radian) * this.radius + this.offset_from_center_x;
		var y = Math.sin(radian + offset_radian) * this.radius + this.offset_from_center_y;
		this.x = x;
		this.y = y;
	},
	scaling: function(){
		var scale_speed_x = 0.01;
		var scale_speed_y = 0.01;
		this.scaleX += scale_speed_x * this.scale_vector;
		this.scaleY += scale_speed_y * this.scale_vector;
		if(this.scaleX >= 1){
			this.scaleX = 1;
			this.scaleY = 1;
			this.scale_vector *= -1;
		}else if(this.scaleX <= 0.2){
			this.scaleX = 0.2;
			this.scaleY = 0.2;
			this.scale_vector *= -1;
		}
	}
});

$(document).ready(function() {
	
	// load twitter information
	var twitter_results = Array();
	$.getJSON('http://search.twitter.com/search.json?q=%23metal&callback=?', function(json) {
		for(var i in json.results){
			if(json.results[i].profile_image_url.match(/\.(jpg|jpeg|png|bmp|gif)/i)){
				twitter_results.push(json.results[i]);
			}
		}
		game_main();
	});
	
	function game_main(){
		// game
		var game = new Game($(window).width(), $(window).height());
		
		// load images
		// TODO : need to handle when image cannot loaded
		try{
			for(var i in twitter_results){
				game.preload(twitter_results[i].profile_image_url);
			}
			game.preload('balloon.png');
		}catch( e ){
		}
	
		// onload
		game.onload = function() {
			// scene
			var scene = game.rootScene;
			scene.backgroundColor = "#FAFAFA";
			
			// label
			var label = new Label('tap screen and generate it.');
			label.color = '#C0C0C0';
			label.font = '24px helvetica';
			label.x = (scene.width - label.width)/2;
			label.y = (scene.height - label.height)/2;
			scene.addChild(label);
			
			// for debug
			var label_debug = new Label('debug');
			label_debug.color = '#C0C0C0';
			label_debug.font = '24px helvetica';
			label_debug.x = 0;
			label_debug.y = 0;
			label_debug.addEventListener('enterframe', function(){
				label_debug.text = game.frame;
			});
			scene.addChild(label_debug);

			// generate sprites by touch
			scene.addEventListener("touchend", function(e) {
			    new PlayerCircle(game, twitter_results, PLAYER_ROTATE_RADIUS*Math.random(), e.x, e.y);
			});
		};
		
		// game start
		game.start();
	}
});
