//获取canvas对象
var wrap = document.getElementById("wrap");
//获取指定绘图环境
var cxt = wrap.getContext("2d");
//对音频上下文对象兼容
window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext;
//实例化一个音频上下文对象
var audioContext = null;
try {
	audioContext = new window.AudioContext();
} catch (e) {
	Console.log('Your browser does not support AudioContext!');
}
//获取audio对象
var audio = document.getElementById('audio');
$("#play").click(function() {
	audio.play();
});
$("#noplay").click(function() {
	audio.pause();
});
//创建MediaElementSourceNode
var source = audioContext.createMediaElementSource(audio);
//创建AnalyserNode
var analyser = audioContext.createAnalyser();
//连接：source → analyser → destination
source.connect(analyser);
analyser.connect(audioContext.destination);
//创建数据
//8 位无符号整数值的类型化数组,new Uint8Array(length)60
var output = new Uint8Array(60);
var du = 360/output.length; //角度
var potInt = {
	x: wrap.width/2,
	y: wrap.height/2
}; //起始坐标
var R = potInt.y*2/3; //半径
var W = 2*Math.PI*R/360*du-1; //宽
function drawSpectrum() {
	//获取频域数据
	analyser.getByteFrequencyData(output);
	//清出一个矩形画布
	cxt.clearRect(0, 0, wrap.width, wrap.height);
	//设置画笔颜色，#477cac
	cxt.strokeStyle = "#cbfffc";
	//画线条
	for (var i = 0; i < output.length; i++) {
		var value = output[i] / 10;
		//新建路径
		cxt.beginPath();
		cxt.lineWidth = W;
		var Rv1 = (R - value);
		var Rv2 = (R + value);

		//移到圆心
		//R * cos (PI/180*一次旋转的角度数) ,-R * sin (PI/180*一次旋转的角度数)
		cxt.moveTo((Math.sin((i * du) / 180 * Math.PI) * Rv1 + potInt.y), -Math.cos((i * du) / 180 * Math.PI) * Rv1 + potInt.x);
		cxt.lineTo((Math.sin((i * du) / 180 * Math.PI) * Rv2 + potInt.y), -Math.cos((i * du) / 180 * Math.PI) * Rv2 + potInt.x);
		//绘制到画布，stroke()
		cxt.stroke();
	}
	//填充颜色，fill()，自动闭合所有未闭合路径
	cxt.fill();
	//画一个空心小圆，将线条覆盖
	cxt.beginPath();
	cxt.lineWidth = 1;
	cxt.strokeStyle = "#0bdcf5";
	//绘制弧形arc(圆心X，圆心Y，半径，起始弧度，结束弧度，可选顺逆时针)
	cxt.arc(potInt.x, potInt.y, potInt.y*2/3, 0, 2 * Math.PI, false);
	cxt.stroke();
	//闭合路径
	cxt.closePath();
	//请求下一帧
	requestAnimationFrame(drawSpectrum);
};
drawSpectrum();
