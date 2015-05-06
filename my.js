var img = new Image();
img.src = "image/bg6.jpg";
var theCanvas;  //当前画布
var context;    //上下文
var pass = 1; //代表当前关卡数
var myarray = [];   //用于随时记录目前关卡中球的信息
var row = 10;    //每排最多可放有10个球
var cwidth = 500;  //画布的宽度
var cheight = 600;  //画布的高度
var srad = cwidth/(2*row); //每个小球的半径
var colors = ['red','yellow','green','blue','purple']; //用于储存颜色组
var misslex = cwidth/2-srad;       //导弹图片的x位置
var missley = cheight-82;          //导弹图片的y位置
var height = Math.sqrt(3);       //根号3的比例系数
var nowball; //现在的球
var nextball;  //下一个球
var background = new Image();       //背景图片
background.src = 'image/bg1.jpg';
var missle = new Image();        //导弹图片
missle.src = "image/paodan.gif"
var box = new Box(150,510,90,570,'skyblue');
var ballfly = false;  //是否有球在飞
var tid;
var velocity = 40  //球的速度
var vx;   //球的水平速度
var vy;   //球的垂直速度
var piles = 0; //层数
var tid2;   //用于记录计算时间的id号
var tid3;  //计算分数
var begintime; //记录游戏开始的时间
var score;  //记录当前局的分数  
var music;  //当前的背景音乐
var lstuselaser = begintime;   //记录上次使用激光的时间
var warningline;  //警戒线
var maxpiles = 9;
var totalscore = 0;  //玩家的总分
var recordscore = 0; //记录

window.addEventListener("load", eventWindowLoaded, false);	

//Point类
function Point(x,y){
	this.x = x;
	this.y = y;
}

//框的构造函数
function Box(s1x,s1y,s2x,s2y,stylestring){
	this.s1x = s1x;
	this.s1y = s1y;
	this.s2x = s2x;
	this.s2y = s2y;
	this.stylestring = stylestring;
	this.draw = drawbox;
}

//画框的函数
function drawbox(){
	var s1x = this.s1x;
	var s1y = this.s1y;
	var s2x = this.s2x;
	var s2y = this.s2y;
	context.lineCap = 'round';
	context.lineJoin = 'round';
	context.strokeStyle = this.stylestring;
	context.lineWidth = 5;
	context.save();
	context.beginPath();
		context.moveTo(s1x,s1y);
		context.lineTo(s2x,s1y);
		context.lineTo(s2x,s2y);
		context.lineTo(s1x,s2y);
		context.quadraticCurveTo(s1x,cheight,misslex,cheight);
	context.stroke();
	context.restore();
}

//炸弹的构造函数
function Bomb(sx,sy,rad,stylestring){
	this.sx = sx;
	this.sy = sy;
	this.rad = rad;
	this.draw = drawbomb;
	this.move = movesphere;
	this.fillstyle = stylestring;
}

function drawbomb(){
	var x = this.sx;
	var y = this.sy;
	var r = this.rad;
	var rgt = context.createRadialGradient(x,y,1,x,y,r);
	rgt.addColorStop("0","magenta");
	rgt.addColorStop(".25","blue");
	rgt.addColorStop(".50","green");
	rgt.addColorStop(".75","yellow");
	rgt.addColorStop("1.0","red");
	context.fillStyle = rgt;
	context.beginPath();
	context.arc(this.sx,this.sy,this.rad,0,Math.PI*2,true);
	context.fill();
}

//球的构造函数
function Sphere(sx,sy,rad,stylestring){
	this.sx = sx;
	this.sy = sy;
	this.rad = rad;
	this.draw = drawsphere;
	this.move = movesphere;
	this.fillstyle = stylestring;
}

//画球的函数
function drawsphere(){
	context.fillStyle = this.fillstyle;
	context.beginPath();
	context.arc(this.sx,this.sy,this.rad,0,Math.PI*2,true);
	context.fill();
}

//球的移动函数
function movesphere(dx,dy){
	this.sx += dx;
	this.sy += dy;
}

//激光类
function Laser(x,y){
	this.x = x;
	this.y = y;
	this.draw = drawlaser;
	this.move = movelaser;
}
	
//画激光带的函数
function drawlaser(){
	context.save();
	var lgt = context.createLinearGradient(this.x,this.y,cwidth,this.y+5);
	lgt.addColorStop("0","magenta");
	lgt.addColorStop(".25","yellow");
	lgt.addColorStop(".50","green");
	lgt.addColorStop(".75","blue");
	lgt.addColorStop("1.0","red");
	context.fillStyle = lgt;
	context.fillRect(this.x,this.y,cwidth,5);
	context.restore();
}

function movelaser(dx){
	this.y -= dx;
}
	
/* 用于每关开始前的初始化  */
function init(){
	//当到达一定的关数，就增加难度
	if(pass >= 2 && pass <5)colors = ['red','yellow','green','blue','purple','white'];
	if(pass >= 5 && pass <8 )colors = ['red','yellow','green','blue','purple','white','teal'];
	context.drawImage(background,0,0);
	context.drawImage(missle,misslex,missley);
	var line = 1+Math.round(pass/2);   //用于每关根据关数初始化行数
	var i;
	var j;
	for(var k = 0;k<20;++k){
		myarray[k] = new Array();
	}
	
	for(i = 0;i <= line; ++i){
		for(j =0;j < row-i%2; ++j){
			var num = Math.floor(Math.random()*colors.length);  //产生随机数
			var color = colors[num];
			var sphere = new Sphere(srad+(j*2+i%2)*srad,srad+i*height*srad,srad,color);
			sphere.draw();
			myarray[i][j] = sphere;
		}
	}
	piles = line;
	begintime = new Date();
	ballfly = false;
	score = 0;
	lstuselaser = begintime;
	
	var num = Math.floor(Math.random()*colors.length);  //产生随机数
	var color = colors[num];
	nowball = new Sphere(misslex+srad,missley-srad,srad,color);
	num = Math.floor(Math.random()*colors.length);  //产生随机数
	color = colors[num];
	nextball = new Sphere(120,540,srad,color);
	
	theCanvas.addEventListener('mousemove',moveit,false);   //鼠标移动的监听事件
	theCanvas.addEventListener('mousedown',shot,false);     //点击鼠标的监听事件
	
	var canvas = document.getElementById('canvasTwo');
	var ctx = canvas.getContext('2d');
	ctx.clearRect(0,0,400,100)
	textDraw("Barrier:",ctx,"bold 35px comic sans ms",100,50,false);
	textDraw(pass,ctx,"bold 35px comic sans ms",250,50,true);
	
	box.draw();
	nowball.draw();
	nextball.draw();
	warningline.draw();
	
	tid2 = setInterval(calculatetime,1000);     //计算时间
	tid3 = setInterval(calculatescore,100);     //计算分数
	
	var recordscorestring = localStorage.getItem("maxscore");
	if(recordscorestring != null){
		recordscore = Number(recordscorestring);
	}
}

function eventWindowLoaded () {
	canvasApp();
}

/*检测当前的浏览器是否支持html5 canvas */
function canvasSupport () {
  	return Modernizr.canvas;
}

function canvasApp () {
  		
  		if (!canvasSupport()) {
			 return;
  		}
		
		theCanvas = document.getElementById("canvasOne");
		context = theCanvas.getContext("2d"); 

		ask();

		music = document.getElementById('sound1');     //播放音乐
		
		warningline = new Laser(0,450);
}

//重绘时用到的函数
function drawall(){
	var i;
	var j;
	context.drawImage(background,0,0);
	warningline.draw();
	box.draw();
	nextball.draw();
	for(i=0;i<=piles;++i){
		for(j=0;j<myarray[i].length;++j){
		    if(!is_undefined(myarray[i][j]) && myarray[i][j]!=null)
				myarray[i][j].draw()
		}
	}
	if(ballfly){
		context.drawImage(missle,misslex,missley);
	}
}

/*让大炮跟随鼠标转动的函数,mx,my是鼠标的滑动时经过的坐标*/
function moveit(ev){
	var mx;
	var my;
	if(ev.layerX || ev.layerX == 0){
		mx = ev.layerX;
		my = ev.layerY;
	}
	else if(ev.offsetX || ev.offsetX == 0){
		mx = ev.offsetX;
		my = ev.offsetY;
	}
	context.clearRect(0,0,cwidth,cheight); //将原来的图擦掉重新绘制
	drawall();
	var x_dis = mx - cwidth/2;
	var y_dis = missley+40-my;
	var angle = Math.atan(x_dis/y_dis);   //计算出的偏离角度
	
	if(Math.abs(angle) >= Math.PI/3)
		if(angle > 0 )angle = Math.PI/3;
		else angle = -Math.PI/3;
	context.save();        //保存画布的状态
	context.translate(misslex+25,missley+40);   //改变圆心，便于旋转
	context.rotate(angle);
	context.drawImage(missle,-25,-40);
	nowball.sx = 0;
	nowball.sy = -65;
	nowball.draw();
	context.restore();    //回复画布的状态
	nowball.sx = misslex+25;
	nowball.sy = missley-25;
}	

//鼠标点击的事件函数
function shot(ev){
	if(ballfly)return;   //如果还有球在飞，鼠标点击无效
	ballfly = true;    //球在飞
	var mx;
	var my;
	if(ev.layerX || ev.layerX == 0){
		mx = ev.layerX;
		my = ev.layerY;
	}
	else if(ev.offsetX || ev.offsetX == 0){
		mx = ev.offsetX;
		my = ev.offsetY;
	}
	var x_dis = mx - cwidth/2;
	var y_dis = missley-srad-my;
	var hypotenuse = Math.sqrt(x_dis*x_dis+y_dis*y_dis);
	vx = (x_dis/hypotenuse)*velocity;      //计算出水平方向的速度
	vy = (y_dis/hypotenuse)*velocity;      //计算出垂直方向的速度
	if(vy<0)vy = -vy;
	if((Math.abs(vy)*height)<Math.abs(vx)){
		vy = Math.sqrt(3)*velocity/3;
		if(vx<0){
			vx = -vy*height;
		}
		else{
			vx = vy*height;
		}
	}
	tid = setInterval(fly,10);             //球在运动的动画
	theCanvas.removeEventListener('mousemove',moveit,false);      //移除鼠标运动的时间防止干扰
}

//球在飞的动画函数
function fly(){
	if(!ballfly)return;
	context.clearRect(0,0,cwidth,cheight);
	drawall();
	wallcheck();
	nowball.move(vx*0.1,-vy*0.1);
	nowball.draw();
	crashcheck();
}

//检测球有没有碰墙
function wallcheck(){
	if(nowball.sx<=srad || nowball.sx >= (cwidth-srad))
		vx = -vx;
}

/*碰撞检测函数*/
function crashcheck(){
	var i;
	var j;
	for(i=0;i<=piles;++i){
		for(j=0;j<myarray[i].length;++j){
			if(is_undefined(myarray[i][j]) || myarray[i][j] == null)continue;
			var dis_x = nowball.sx-myarray[i][j].sx;
			var dis_y = nowball.sy-myarray[i][j].sy;
			var dis = dis_x*dis_x + dis_y*dis_y;
			//和球相碰或者和最顶端相碰就进行检测
			if(dis <= 4*srad*srad || nowball.sy <= srad){
				var music = document.getElementById('bomb');
				music.play();
				clearInterval(tid);
				var point;
				if (nowball.sy <= srad) point = paste();
				else point = find_fit_place(i,j);   //得到球粘的位置
				elimination(point);
				return;
			}
		}
	}
}

//如果和顶端相撞
function paste(){
	var x = Math.round((nowball.sx-srad)/(2*srad));
	var y = srad;
	nowball.sx = srad*(1+2*x);
	nowball.sy = y;
	myarray[0][x] = nowball;
	updatepiles();
	context.clearRect(0,0,cwidth,cheight);
	drawall();
	var point = new Point(0,x);
	return point;
}
	
/*根据坐标选择最接近的正六边形位置*/	
function find_fit_place(i,j){
	var x = myarray[i][j].sx;
	var y = myarray[i][j].sy;
	var m1x = x-2*srad;   //六边形的左边
	var m1y = y;
	var m2x = x-srad;    //左上
	var m2y = y-height*srad
	var m3x = x+srad;   //右上
	var m3y = m2y;
	var m4x = x+2*srad;   //右边
	var m4y = y;
	var m5x = m2x;         //左下
	var m5y = y+height*srad;
	var m6x = m3x;         //右下
	var m6y = m5y;
	var dis = 100000;      //预先设置比较大的值
	var result_x;
	var result_y;
	
	var diff = 0;
	if(i%2 == 0)diff = 1;
	
	if(check_boder(m1x,m1y) && (is_undefined(myarray[i][j-1]) || myarray[i][j-1] == null)){
		var temp = dist(nowball.sx,nowball.sy,m1x,m1y);
		if(temp < dis)dis = temp;
		x = m1x;
		y = m1y;
		result_x = i;
		result_y = j-1;
	}
	
	if(check_boder(m2x,m2y) &&(is_undefined(myarray[i-1][j-diff]) || myarray[i-1][j-diff]==null)){
		var temp = dist(nowball.sx,nowball.sy,m2x,m2y);
		if(temp < dis){
			dis = temp;
			x = m2x;
			y = m2y;
			result_x = i-1;
			result_y = j-diff;
		}
	}
	
	if(check_boder(m3x,m3y) && (is_undefined(myarray[i-1][j-diff+1]) || myarray[i-1][j-diff+1] == null)){
		var temp = dist(nowball.sx,nowball.sy,m3x,m3y);
		if(temp < dis){
			dis = temp;
			x = m3x;
			y = m3y;
			result_x = i-1;
			result_y = j-diff+1;
		}
	}
	
	if(check_boder(m4x,m4y) && (is_undefined(myarray[i][j+1]) || myarray[i][j+1]==null)){
		var temp = dist(nowball.sx,nowball.sy,m4x,m4y);
		if(temp < dis){
			dis = temp;
			x = m4x;
			y = m4y;
			result_x = i;
			result_y = j+1;
		}
	}
	
	if(check_boder(m5x,m5y) &&(is_undefined(myarray[i+1][j-diff]) || myarray[i+1][j-diff]==null)){
		var temp = dist(nowball.sx,nowball.sy,m5x,m5y);
		if(temp < dis){
			dis = temp;
			x = m5x;
			y = m5y;
			result_x = i+1;
			result_y = j-diff;
		}
	}
	
	if(check_boder(m6x,m6y) &&(is_undefined(myarray[i+1][j-diff+1]) || myarray[i+1][j-diff+1]==null)){
		var temp = dist(nowball.sx,nowball.sy,m6x,m6y);
		if(temp < dis){
			dis = temp;
			x = m6x;
			y = m6y;
			result_x = i+1;
			result_y = j-diff+1;
		}
	}
	nowball.sx = x;
	nowball.sy = y;
	//var sphere = new Sphere(nowball.sx,nowball.sy,srad,nowball.fillstyle);
	myarray[result_x][result_y] = nowball;
	updatepiles();       //更新层数
	context.clearRect(0,0,cwidth,cheight);
	drawall();
	var point = new Point(result_x,result_y);
	return point;
}
	
//消除的函数
function elimination(point){
	var elimarray = [];   //存放将要删去的球的坐标
	var indexarray = [];  //存放未检测的球的坐标
	var color = nowball.fillstyle;  //获取颜色
	elimarray.push(point);
	indexarray.push(point);

	
	//内部函数，防止重复
	function search(point){
		for(var i = 0;i < elimarray.length;++i)
			if(elimarray[i].x == point.x && elimarray[i].y == point.y)return true;
		return false;
	}
	
		
	//如果是炸弹,black标识炸弹
	if(color == 'black'){
		var p1 = atop(nowball.sx-2*srad,nowball.sy);
		var p2 = atop(nowball.sx-srad,nowball.sy-height*srad);
		var p3 = atop(nowball.sx+srad,nowball.sy-height*srad);
		var p4 = atop(nowball.sx+2*srad,nowball.sy);
		var p5 = atop(nowball.sx-srad,nowball.sy+height*srad);
		var p6 = atop(nowball.sx+srad,nowball.sy+height*srad);
		if(pcheck(p1))elimarray.push(p1);
		if(pcheck(p2))elimarray.push(p2);
		if(pcheck(p3))elimarray.push(p3);
		if(pcheck(p4))elimarray.push(p4);
		if(pcheck(p5))elimarray.push(p5);
		if(pcheck(p6))elimarray.push(p6);
	}else{
	//如果不是炸弹，当未检索完一直循环
	while(indexarray.length>0){
		var p = indexarray[indexarray.length-1];
		indexarray.pop();   //取出检索中的点，从indexarray中数组清除
		var diff = 0;
		if(p.x%2 == 0)diff = 1;
		var p1 = new Point(p.x,p.y-1);   //左
		var p2 = new Point(p.x,p.y+1);   //右
		var p3 = new Point(p.x-1,p.y-diff);   //左上
		var p4 = new Point(p.x-1,p.y-diff+1);   //右上
		var p5 = new Point(p.x+1,p.y-diff);   //左下
		var p6 = new Point(p.x+1,p.y-diff+1);   //右下
		//检测左边的球，如果坐标合法，有这个球，并且颜色一致，没有被检测过，就放进数组中
		if(pcheck(p1) && !is_undefined(myarray[p1.x][p1.y]) &&myarray[p1.x][p1.y]!=null){
			if((myarray[p1.x][p1.y].fillstyle == color) && !search(p1)){
				elimarray.push(p1);
				indexarray.push(p1);
			}
		}
		//检测右边的球
		if(pcheck(p2) && !is_undefined(myarray[p2.x][p2.y]) &&myarray[p2.x][p2.y]!=null){
			if((myarray[p2.x][p2.y].fillstyle == color) && !search(p2)){
				elimarray.push(p2);
				indexarray.push(p2);
			}
		}
		//检测左上球
		if(pcheck(p3) && !is_undefined(myarray[p3.x][p3.y])&&myarray[p3.x][p3.y]!=null){
			if((myarray[p3.x][p3.y].fillstyle == color) && !search(p3)){
				elimarray.push(p3);
				indexarray.push(p3);
			}
		}
		//检测右上球
		if(pcheck(p4) && !is_undefined(myarray[p4.x][p4.y])&&myarray[p4.x][p4.y]!=null){
			if((myarray[p4.x][p4.y].fillstyle == color) && !search(p4)){
				elimarray.push(p4);
				indexarray.push(p4);
			}
		}
		//检测左下球
		if(pcheck(p5) && !is_undefined(myarray[p5.x][p5.y])&&myarray[p5.x][p5.y]!=null){
			if((myarray[p5.x][p5.y].fillstyle == color) && !search(p5)){
				elimarray.push(p5);
				indexarray.push(p5);
			}
		}
		//检测右下球
		if(pcheck(p6) && !is_undefined(myarray[p6.x][p6.y])&&myarray[p6.x][p6.y]!=null){
			if((myarray[p6.x][p6.y].fillstyle == color) && !search(p6)){
				elimarray.push(p6);
				indexarray.push(p6);
			}
		}
	}
	}
	
	//如果有3个或3个以上的相同球，就消除
	if(elimarray.length >= 3 || color == 'black'){
		scoring(elimarray.length);
		for(var i = 0;i<elimarray.length;++i){
			var p = elimarray[i];
			myarray[p.x][p.y] = null;
		}
	}
	reelimination();    //消除没有连着的球
	ballfly = false;
	update();    //更新信息,当前球和下一个球
	updatepiles();
	drawall();
	nowball.draw();
	context.drawImage(missle,misslex,missley);
	theCanvas.addEventListener('mousemove',moveit,false);   //鼠标移动的监听事件
	if(checkwin())dowin();
	else if(checklose())dolose();
}

//消去没连住的球
function reelimination(){
	var remainarray = []; //仍然存在的和顶端连着的球
	var elimarray = [];  //要删去的球
	var indexarray = []; //正在检索的球
	var cloud = []; //表示一组相连的球
	
	//内部函数，检测球有没有在remainarray
	function search(point){
		for(var i = 0;i < remainarray.length;++i)
			if(remainarray[i].x == point.x && remainarray[i].y == point.y)return true;
		return false;
	}
	
	//将第一排存在的球先放进去
	for(var i = 0;i<myarray[0].length;++i){
		if(myarray[0][i] != null){
			var p = new Point(0,i);
			remainarray.push(p);
			indexarray.push(p);
		}
	}
	
	//当未检索完一直循环
	while(indexarray.length>0){
		var pp = indexarray[indexarray.length-1];
		indexarray.pop();   //取出检索中的点，从indexarray中数组清除
		cloud.push(pp);
		//根据顶端的一个球，找到相连的所有球
		while(cloud.length>0){
			var p = cloud[cloud.length-1];
			cloud.pop();
			var diff = 0;
			if(p.x%2 == 0)diff = 1;
			var p1 = new Point(p.x,p.y-1);   //左
			var p2 = new Point(p.x,p.y+1);   //右
			var p3 = new Point(p.x-1,p.y-diff);   //左上
		    var p4 = new Point(p.x-1,p.y-diff+1);   //右上
			var p5 = new Point(p.x+1,p.y-diff);   //左下
			var p6 = new Point(p.x+1,p.y-diff+1);   //右下
			//检测左边的球，如果坐标合法，有这个球，并且不再remainarray中，就放进去
			if(pcheck(p1) && !is_undefined(myarray[p1.x][p1.y]) &&myarray[p1.x][p1.y]!=null){
				if( !search(p1)){
					remainarray.push(p1);
					cloud.push(p1);
				}
			}
			//检测右边的球
			if(pcheck(p2) && !is_undefined(myarray[p2.x][p2.y]) &&myarray[p2.x][p2.y]!=null){
				if( !search(p2)){
					remainarray.push(p2);
					cloud.push(p2);
				}
			}
			//检测左上球
			if(pcheck(p3) && !is_undefined(myarray[p3.x][p3.y])&&myarray[p3.x][p3.y]!=null){
				if(!search(p3)){
					remainarray.push(p3);
					cloud.push(p3);
				}
			}
			//检测右上球
			if(pcheck(p4) && !is_undefined(myarray[p4.x][p4.y])&&myarray[p4.x][p4.y]!=null){
				if(!search(p4)){
					remainarray.push(p4);
					cloud.push(p4);
				}
			}
			//检测左下球
			if(pcheck(p5) && !is_undefined(myarray[p5.x][p5.y])&&myarray[p5.x][p5.y]!=null){
				if(!search(p5)){
					remainarray.push(p5);
					cloud.push(p5);
				}
			}
			//检测右下球
			if(pcheck(p6) && !is_undefined(myarray[p6.x][p6.y])&&myarray[p6.x][p6.y]!=null){
				if(!search(p6)){
					remainarray.push(p6);
					cloud.push(p6);
				}
			}
		}
	}
	//检索完毕
	var num = 0;
	for(var i = 0;i<= piles;++i){
		for(var j = 0;j< myarray[i].length;++j){
			if(!searchinarray(i,j)&&myarray[i][j]!=null){
				myarray[i][j]=null;
				num++;
			}
		}
	}
	
	//内部函数
	function searchinarray(i,j){
		for(var k =0;k<remainarray.length;++k){
			if(remainarray[k].x ==i && remainarray[k].y == j)return true;
		}
		return false;
	}
	scoring(num);
}
	
//计算两点之间距离的平方	
function dist(x1,y1,x2,y2){
	return (x1-x2)*(x1-x2)+(y1-y2)*(y1-y2);
}

//用于判断对象的类型是不是undefined
function is_undefined(object) { 
return typeof object == "undefined"; 
}

//用于检查球是否在边界
function check_boder(x,y){
	if(x<10 || y<10)return false;
	if(x>(cwidth-10))return false;
	return true;
}

//根据坐标计算出在数组中的位置
function atop(x1,y1){
	var y = Math.ceil(x1/(2*srad))-1;  //列
	var x = Math.round((y1-srad)/(height*srad));  //行
	var point = new Point(x,y);
	return point;
}

//用于检测点是否合法
function pcheck(point){
    var max;
	if(point.y <0 || point.x<0)return false;
	
	if(point.x%2 == 0)max = 9;
	else max = 8;
	
	if(point.y > max)return false;
	if(point.x > piles)return false;
	return true;
}

//更新当前球的信息
function update(){
	var num = Math.floor(Math.random()*colors.length);  //产生随机数
	var color = colors[num];
	nowball = nextball;
	nowball.sx = misslex+srad;
	nowball.sy = missley-srad;
	
	
	//小概率随机产生炸弹
	var number = Math.floor(Math.random()*100);  //产生随机数
	if(number < 93)
		nextball = new Sphere(120,540,srad,color);
	else
		nextball = new Bomb(120,540,srad,"black");  //用Black来标识炸弹
}	

//更新层数
function updatepiles(){
	for(var i = 0;i<myarray.length;++i){
		var t = 0;
		for(var j = 0;j<myarray[i].length;++j){
			if(is_undefined(myarray[i][j]) || myarray[i][j] == null)t++;
		}
		if(t == myarray[i].length){
			piles = i-1;
			return;
		}
	}
}

//加速
function upspeed(){
	if(velocity >= 60){
		alert("It is the maxium speed,you can not speed up anymore.");
		return;
	}
	velocity *= 1.2;
	vx *= 1.2;
	vy *= 1.2;
}

//减速
function downspeed(){
	if(velocity <= 10){
		alert("It is the minium speed,you can not slow down anymore.");
		return;
	}
	velocity /= 1.2;
	vx /= 1.2;
	vy /= 1.2;
}

function textDraw(sample,ctx,font,x,y,fill){
  var text = sample;
  ctx.font = font;
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  if(fill){
    ctx.fillStyle = "#ccc";
    ctx.fillText(text,x,y);
  }else{
    ctx.strokeStyle = "#666";
    ctx.strokeText(text,x,y);
  }
}

//更新时间
function calculatetime(){
  var endtime = new Date();
  var difftime = endtime - begintime;
  var seconds = Math.floor(difftime/1000+0.5);
  var canvas = document.getElementById('canvasTwo');
  var ctx = canvas.getContext('2d');
  ctx.clearRect(0,100,400,100);
  textDraw("TIME:",ctx,"bold 35px comic sans ms",100,150,false);
  textDraw(seconds,ctx,"bold 35px comic sans ms",250,150,true);
}

//更新分数
function calculatescore(){
	var canvas = document.getElementById('canvasTwo');
	var ctx = canvas.getContext('2d');
	ctx.clearRect(0,200,400,200);
	textDraw("SCORE:",ctx,"bold 35px comic sans ms",100,250,false);
	textDraw(score,ctx,"bold 35px comic sans ms",250,250,true);
	textDraw("Sum:",ctx,"bold 35px comic sans ms",100,350,false);
	textDraw(totalscore,ctx,"bold 35px comic sans ms",250,350,true);
}

//根据消掉球的个数计算得分
function scoring(number){
	var i = number -3;
	if(number>0){
		score += 300;
		totalscore += 300;
	}
	var base = 100;
	for(;i>=0;i--){
		base += 100;
		score += base;
		totalscore += base;
	}
	
	var s = localStorage.getItem("maxscore");
	if( s == null )localStorage.setItem("maxscore",totalscore);
	else if(totalscore > Number(s)){
		localStorage.setItem("maxscore",totalscore);
	}
}

//播放音乐
function playSound(){
	music.play();
}

//暂停音乐
function pauseSound(){
	music.pause();
}

//更换音乐
function changemusic(){
	if(!music.paused)
		music.pause();
	if(document.form1.musiclabel.value =="Baa")music = document.getElementById('sound1');
	else if(document.form1.musiclabel.value =="Do You Ears Hang Low")music = document.getElementById('sound2');
	else if(document.form1.musiclabel.value =="We Wish You A Merry Christmas")music = document.getElementById('sound3');
	else if(document.form1.musiclabel.value =="kanong")music = document.getElementById('sound4');
	else if(document.form1.musiclabel.value =="coward")music = document.getElementById('sound5');
	music.play();
}

//更换背景图片
function changebackground(){
	if(document.form1.backgroundlabel.value =="bg1")background.src = "image/bg1.jpg";
	else if(document.form1.backgroundlabel.value =="bg2")background.src = "image/bg2.jpg";
	else if(document.form1.backgroundlabel.value =="bg3")background.src = "image/bg3.jpg";
	else if(document.form1.backgroundlabel.value =="bg4")background.src = "image/bg4.jpg";
	else if(document.form1.backgroundlabel.value =="bg5")background.src = "image/bg5.jpg";
	document.form1.backgroundlabel.onblur = function(){
		context.clearRect(0,0,cwidth,cheight);
		context.drawImage(background,0,0);
		drawall();
		nowball.draw();
		context.drawImage(missle,misslex,missley);
	}
}

//使用激光
function uselaser(){
	//如果球还在飞，不允许使用激光
	if(ballfly){
		alert("The ball is flying,you can't use laser!");
		return;
	}
	if(!checktime())return;
	
	var laser = new Laser(0,450);
	laser.draw();
	theCanvas.removeEventListener('mousemove',moveit,false);      //移除鼠标运动的时间防止干扰
	var tid = setInterval(lasermove,20);
	score -= 3000;
	totalscore -= 3000;
	
	function lasermove(){
		theCanvas.removeEventListener('mousedown',shot,false);     //点击鼠标的监听事件
		laser.move(5);
		context.clearRect(0,0,cwidth,cheight);
		drawall();
		nowball.draw();
		context.drawImage(missle,misslex,missley);
		laser.draw();
		
		if(laser.y <= (height*piles*srad+srad)){
			for(var i =0;i<myarray[piles].length;++i){
				if(myarray[piles][i] != null){
					myarray[piles][i] = null
				}
			}
			context.clearRect(0,0,cwidth,cheight);
			drawall();
			nowball.draw();
			context.drawImage(missle,misslex,missley);
			clearInterval(tid);
			theCanvas.addEventListener('mousemove',moveit,false); 
			theCanvas.addEventListener('mousedown',shot,false);     //点击鼠标的监听事件
			updatepiles();
			if(checkwin())dowin();
		}
	}
	
	function checktime(){
		var endtime = new Date();
		var difftime = endtime - lstuselaser;
		var seconds = Math.floor(difftime/1000+0.5);
		if(seconds<60){
			alert("The interval is: "+seconds+"seconds.The time is not enough for 60 seconds,please wait "+(60-seconds)+"seconds and reclick!");
			return false;
		}
		lstuselaser = endtime;  //更新最近使用激光的时间
		return true;
	}
}
	
//检查是否有输赢
function checkwin (){
	if(piles > 0)return false;
	for(var i = 0 ; i<10;++i){
		if(myarray[0][i] != null)return false;
	}
	return true;
}

//检查是不是输了
function checklose(){
	if(piles > maxpiles)return true;
	return false;
}

//如果输了，执行以下代码
function dolose(){
	alert("sorry,you lose the game.");
	for(var i = 0 ; i<=piles;i++){
		for(var j = 0 ;j< myarray[i].length;++j){
			if(myarray[i][j] != null)myarray[i][j] = null;
		}
	}
	ask();
}

function dowin(){
	alert("wonderful,you pass!");
	for(var i = 0 ; i<=piles;i++){
		for(var j = 0 ;j< myarray[i].length;++j){
			if(myarray[i][j] != null)myarray[i][j] = null;
		}
	}
	pass++;
	ask();
	
	if(totalscore > maxscore){
		alert("new record! Your score is:"+totalscore);
	}
}

//询问面板
function ask(){
	var t;
	clearInterval(tid2,1000);
	context.clearRect(0,0,cwidth,cheight);
	
	context.drawImage(img,0,0);
	theCanvas.removeEventListener('mousemove',moveit,false);      //移除鼠标运动的时间防止干扰
	theCanvas.removeEventListener('mousedown',shot,false);     //点击鼠标的监听事件
	textDraw("Start",context,"40px comic sans ms",250,100,false);
	textDraw("Quit",context,"40px comic sans ms",250,200,false);
	textDraw("Record",context,"40px comic sans ms",250,300,false);
	textDraw("Save",context,"40px comic sans ms",250,400,false);
	textDraw("Load",context,"40px comic sans ms",250,500,false);
	
	theCanvas.addEventListener('mousemove',doit,false);   
	theCanvas.addEventListener('mousedown',next,false);	
	
	function next(ev){
		var mx;
		var my;
		if(ev.layerX || ev.layerX == 0){
			mx = ev.layerX;
			my = ev.layerY;
		}
		else if(ev.offsetX || ev.offsetX == 0){
			mx = ev.offsetX;
			my = ev.offsetY;
		}
		if(mx >= 180 && mx <=320 && my >= 50 && my <=150){
			theCanvas.removeEventListener('mousemove',doit,false);   
			theCanvas.removeEventListener('mousedown',next,false);	
			init();
		}
		else if(mx >= 200 && mx <=300 && my >= 150 && my <=250){
			windowclose();
		}
		else if(mx >= 180 && mx <=320 && my >= 250 && my <=350){
			var x = localStorage.getItem("maxscore");
			if(x!=null){
				alert("The record is:"+Number(x));
			}
			else{
				alert("No record");
			}
		}
		else if(mx >= 200 && mx <=300 && my >= 350 && my <=450){
			localStorage.setItem("barrier",pass);
			localStorage.setItem("score",totalscore);
			alert("Save successfully!");
		}
		else if(mx >= 200 && mx <=300 && my >= 450 && my <=550){
			var x = localStorage.getItem("barrier");
			if(x == null){
				alert("you did not saved before,load failed");
				return;
			}
			totalscore = Number(localStorage.getItem("score"));
			pass = Number(x);
			theCanvas.removeEventListener('mousemove',doit,false);   
			theCanvas.removeEventListener('mousedown',next,false);
			t = setInterval(process,40);
		}		
		else{
			return;
		}
	}
	
	var a = 0;
	function process(){
		if(a >= 400){
			clearInterval(t);
			init();
			return;
		}
		context.clearRect(0,0,cwidth,cheight);
		context.strokeRect(50,500,400,50);
		context.save();
		var lgt = context.createLinearGradient(50,500,400,50);
		lgt.addColorStop("0","blue");
		lgt.addColorStop(".25","red");
		lgt.addColorStop(".75","blue");
		lgt.addColorStop("1.0","yellow");
		context.fillStyle = lgt;
		context.fillRect(50,500,a,50);
		context.restore();
		a+=4;
		textDraw((a/4-1)+"%",context,"40px comic sans ms",150,450,true);	
	}
	
	function doit(ev){
		var mx;
		var my;
		if(ev.layerX || ev.layerX == 0){
			mx = ev.layerX;
			my = ev.layerY;
		}
		else if(ev.offsetX || ev.offsetX == 0){
			mx = ev.offsetX;
			my = ev.offsetY;
		}
		if(mx >= 180 && mx <=320 && my >= 50 && my <=150){
			context.clearRect(0,0,cwidth,cheight);
			context.drawImage(img,0,0);
			textDraw("Start",context,"bold 60px comic sans ms",250,100,true);
			textDraw("Quit",context,"40px comic sans ms",250,200,false);
			textDraw("Record",context,"40px comic sans ms",250,300,false);	
			textDraw("Save",context,"40px comic sans ms",250,400,false);
			textDraw("Load",context,"40px comic sans ms",250,500,false);	
		}
		else if(mx >= 200 && mx <=300 && my >= 150 && my <=250){
			context.clearRect(0,0,cwidth,cheight);
			context.drawImage(img,0,0);
			textDraw("Start",context,"40px comic sans ms",250,100,false);
			textDraw("Quit",context,"bold 60px comic sans ms",250,200,true);
			textDraw("Record",context,"40px comic sans ms",250,300,false);
			textDraw("Save",context,"40px comic sans ms",250,400,false);
			textDraw("Load",context,"40px comic sans ms",250,500,false);			
		}
		else if(mx >= 180 && mx <=320 && my >= 250 && my <=350){
			context.clearRect(0,0,cwidth,cheight);
			context.drawImage(img,0,0);
			textDraw("Start",context,"40px comic sans ms",250,100,false);
			textDraw("Quit",context,"40px comic sans ms",250,200,false);
			textDraw("Record",context,"bold 60px comic sans ms",250,300,true);	
			textDraw("Save",context,"40px comic sans ms",250,400,false);
			textDraw("Load",context,"40px comic sans ms",250,500,false);			
		}
		else if(mx >= 200 && mx <=300 && my >= 350 && my <=450){
			context.clearRect(0,0,cwidth,cheight);
			context.drawImage(img,0,0);
			textDraw("Start",context,"40px comic sans ms",250,100,false);
			textDraw("Quit",context,"40px comic sans ms",250,200,false);
			textDraw("Record",context,"40px comic sans ms",250,300,false);	
			textDraw("Save",context,"bold 60px comic sans ms",250,400,true);
			textDraw("Load",context,"40px comic sans ms",250,500,false);			
		}		
		else if(mx >= 200 && mx <=300 && my >= 450 && my <=550){
			context.clearRect(0,0,cwidth,cheight);
			context.drawImage(img,0,0);
			textDraw("Start",context,"40px comic sans ms",250,100,false);
			textDraw("Quit",context,"40px comic sans ms",250,200,false);
			textDraw("Record",context,"40px comic sans ms",250,300,false);	
			textDraw("Save",context,"40px comic sans ms",250,400,false);
			textDraw("Load",context,"bold 60px comic sans ms",250,500,true);			
		}	
		else{
			context.clearRect(0,0,cwidth,cheight);
			context.drawImage(img,0,0);
			textDraw("Start",context,"40px comic sans ms",250,100,false);
			textDraw("Quit",context,"40px comic sans ms",250,200,false);
			textDraw("Record",context,"40px comic sans ms",250,300,false);	
			textDraw("Save",context,"40px comic sans ms",250,400,false);
			textDraw("Load",context,"40px comic sans ms",250,500,false);			
		}
	}
}

function windowclose() {
    var browserName = navigator.appName;
    if (browserName=="Netscape") {
        window.open('', '_self', '');
        window.close();
    }
    else {
        if (browserName == "Microsoft Internet Explorer"){
            window.opener = "whocares";
            window.opener = null;
            window.open('', '_top');
            window.close();
        }
    }
}
