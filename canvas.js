//频谱配置项
var spectrumOption={
	angle : 5,  //每一字音旋转的角度(2~9)
	spectrumStrokeColor : "#ACF8FE", //频谱块的边框颜色
	spectrumFillColor : "#5095D0",  //频谱块的填充颜色
	wallOfStrokeColor : "#0bdcf5"  //圆形遮罩的线条颜色
}


//获取canvas对象
var painting = document.getElementById("canvas");
//设置宽高为父元素的宽高
painting.setAttribute("width",painting.parentNode.style.width);
painting.setAttribute("height",painting.parentNode.style.height);
//获取指定绘图环境
var cxt = painting.getContext("2d");
//对音频上下文对象兼容
window.AudioContext = window.AudioContext || window.webkitAudioContext ||
	window.mozAudioContext || window.msAudioContext;
//实例化一个音频上下文对象
var audioContext = null;

try {
	audioContext = new window.AudioContext();
} catch (e) {
	Console.log('Your browser does not support AudioContext!');
}
//获取audio对象
var audio = document.getElementById('audio');
/* $("#play").click(function() {
	audio.play();
	drawSpectrum();
});
$("#noplay").click(function() {
	audio.pause();
}); */

//创建MediaElementSourceNode
var source = audioContext.createMediaElementSource(audio);
//创建AnalyserNode
var analyser = audioContext.createAnalyser();
//连接：source → analyser → destination
source.connect(analyser);
analyser.connect(audioContext.destination);

//创建数据
//8 位无符号整数值的类型化数组,new Uint8Array(length)60
var output = new Uint8Array(360);

//每一字音旋转的角度
var du = spectrumOption.angle;

//圆心坐标
var circle = {
	x: painting.width / 2,
	y: painting.height / 2
};

//圆半径
var R = circle.y * 2 / 3;

//线条宽度，绘制线谱时用到
var W = 2 * Math.PI * R / 360 * du - 1;

//对 请求动画帧 对象兼容
window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
	window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

//对 取消计划中的动画帧请求 对象兼容
window.cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;

//定义 请求动画帧 对象的ID
var requestID;

function drawSpectrum() {
	//获取频域数据
	analyser.getByteFrequencyData(output);
	//清出一个矩形画布
	cxt.clearRect(0, 0, painting.width, painting.height);
	//设置画笔颜色
	cxt.strokeStyle = spectrumOption.spectrumStrokeColor;
	//设置填充颜色
	cxt.fillStyle = spectrumOption.spectrumFillColor;
	//画线条
	for (var i = 0; i < output.length / du; i++) {
		var value = output[du * i] / 8;
		//新建路径
		cxt.beginPath();
		cxt.lineWidth = 3;
		
		var inR = (R - value);
		var outR = (R + value);

		//直线形式的频谱（偏离圆心）
		//R * cos (PI/180*一次旋转的角度数) ,-R * sin (PI/180*一次旋转的角度数)
		//cxt.moveTo((Math.sin((i * du) / 180 * Math.PI) * Rv1 + circle.y), -Math.cos((i * du) / 180 * Math.PI) * Rv1 + circle.x);
		//cxt.lineTo((Math.sin((i * du) / 180 * Math.PI) * Rv2 + circle.y), -Math.cos((i * du) / 180 * Math.PI) * Rv2 + circle.x);

		/* 绘制梯扇形频谱
		 * 梯扇形指上下底为圆弧的梯形
		 * 已知圆心O(x0,y0),半径R,以X轴正半轴为起始的角度a 
		 * 得弧度rad=a*2*PI/360=a*PI/180
		 * 弧度rad范围：-PI~+PI
		 * x=x0+R*Math.cos(rad) 
		 * y=y0+R*Math.sin(rad)
		 * 即圆上任一点A的坐标为(x,y) */
		//重定到内圆左
		cxt.moveTo(circle.x + inR * Math.cos(i * du * Math.PI / 180), circle.y + inR * Math.sin(i * du * Math.PI / 180));
		//画线到外圆左
		cxt.lineTo(circle.x + outR * Math.cos(i * du * Math.PI / 180), circle.y + outR * Math.sin(i * du * Math.PI / 180));
		//顺时针画外圆圆弧
		cxt.arc(circle.x, circle.y, outR, i * du * Math.PI / 180, (i + 1) * du * Math.PI / 180, false);
		//重定到外圆右
		cxt.moveTo(circle.x + outR * Math.cos((i + 1) * du * Math.PI / 180), circle.y + outR * Math.sin((i + 1) * du * Math.PI /
			180));
		//画线到内圆右
		cxt.lineTo(circle.x + inR * Math.cos((i + 1) * du * Math.PI / 180), circle.y + inR * Math.sin((i + 1) * du * Math.PI /
			180));
		//逆时针画内圆圆弧
		cxt.arc(circle.x, circle.y, inR, (i + 1) * du * Math.PI / 180, i * du * Math.PI / 180, true);
		//设置不透明度
		cxt.globalAlpha = 0.4;
		//填充颜色，fill()，自动闭合所有未闭合路径
		cxt.fill();
		cxt.globalAlpha = 1;
		//绘制到画布，stroke()
		cxt.stroke();
	}
	//画一个空心小圆,安静显示
	cxt.beginPath();
	cxt.lineWidth = 5;
	cxt.strokeStyle = spectrumOption.wallOfStrokeColor;
	//绘制弧形arc(圆心X，圆心Y，半径，起始弧度，结束弧度，可选顺逆时针)
	cxt.arc(circle.x, circle.y, R, 0, 2 * Math.PI, false);
	cxt.globalAlpha = 0.4;
	cxt.fill();
	cxt.stroke();
	//闭合路径
	cxt.closePath();
	//开启动画，请求下一帧
	requestID = requestAnimationFrame(drawSpectrum);
	//如果音频停止，取消动画请求
	/* if(audio.paused){
		cancelAnimationFrame(requestID);
	} */
};
drawSpectrum();
