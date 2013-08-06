/*******************************************
功能： index.js 主要控制index.html页面的所有动态操作。
建立日期： 2013年7月23日。
作者： Doris

********************************************/
window.onload = function(){

	/***************************老大提供的代码段*******************************/
	(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
	(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
	m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-41924210-1', 'wartisan.com');
ga('send', 'pageview');
/***********************************************************************/
var defaultEmail = "Your e-mail";
getClientInfor();//获取客户信息

/************************* 添加事件响应  ******************/
//*******设置submit按钮鼠标移动时的样式
$("#submit").mouseenter(function(){
	$(this).css("opacity", "0.7");
}).mouseout(function(){
	$(this).css("opacity", "1");
});
//end
/***********************************************************************/

//*******设置email的默认值
document.getElementById("email").onfocus = function(){
	this.value = "";
	var container = document.getElementById("signup");

	var errorRemind = document.getElementById("errormessage");
	if(errorRemind){
		container.removeChild(errorRemind);
		var submitBtn = document.getElementById("submit");
		submitBtn.disabled = false;
	}
}
//end

document.getElementById("email").onblur = function(){
	if(this.value == ""){
		this.value = defaultEmail;
	}
}
//end
/*************使用colorbox插件显示小视频***************************/
//$(".collaboration").colorbox({iframe:true, innerWidth:640, innerHeight:390});
$(".management").colorbox({iframe:true, innerWidth:640, innerHeight:390});
$(".timeline").colorbox({iframe:true, innerWidth:640, innerHeight:390});

/***************************************************************/


/*************email注册提交*************************/
//提交email
document.getElementById("submit").onclick = function(){
	var email = document.getElementById("email").value;
	if((!isValidmail(email))||(email==defaultEmail)){
		var text = "Please enter a valid email!";
		var errorRemind = document.createElement("p");
		var errorText =  document.createTextNode(text);
		errorRemind.id = "errormessage";
		errorRemind.appendChild(errorText);
		var container = document.getElementById("signup");
		var submitBtn = document.getElementsByClassName("cbutton")[0];
		var submitbutton = document.getElementById("submit");
		container.insertBefore(errorRemind, submitBtn);
		submitbutton.disabled = true;
		return;

	}
	//获取当前时间
	var t = getCurTime();
	
	var emailsent = "Sign Up Email: "+ email + "   time: "+t;
	$.ajax({
		type: "POST",
		url: "storedata.php",
		data: "mailbox="+emailsent,
		success: function(msg){
			var text = "Thanks for your attention!";
			window.location="features.html"; 
		}
	});


	//正则判断email有效性
	function isValidmail(sEmail){
		var reMail = /^(?:[a-z\d]+[_\-\+\.]?)*[a-z\d]+@(?:([a-z\d]+\-?)*[a-z\d]+\.)+([a-z]{2,})+$/i;
		var bValid = reMail.test(sEmail);
		return bValid;
	}

}
/**************************************************************/

/**************************给视频添加监听事件*****************************/
var video = document.getElementById("video");
video.addEventListener("timeupdate", function (){
	var vTime = video.currentTime;
	console.log(vTime);
});
video.onpause = function(){
	getInfo();
}
video.onended = function(){
	getInfo();
}



/*********************************各类方法*****************************************/

//向服务器发送数据
function postdata(datasent){

	$.ajax({
		type: "POST",
		url: "storedata.php",
		data: "mailbox="+datasent,
		success: function(msg){
			return;
		}

	});

}

//获取视频播放时长信息
function getInfo(){
	var time;
	var pl=document.getElementById("video");
	time = "Video Played: " + pl.currentTime.toFixed(1) +"s";
	postdata(time);
	//sleep(2);
}


//获取客户的IP、国家等信息
function getClientInfor(){
	var client = "*************************Client***************************";
	var t = getCurTime();
	$.getJSON('http://smart-ip.net/geoip-json?callback=?', function(data) {
		client =  client +'\nVisit Time: '+ t +'\nIP: ' + data.host + ' CountryName: ' + data.countryName + ' CityName: ' +data.city;
		postdata(client);
	});
}

function getCurTime(){
	//获取当前时间
	var d = new Date();
	var t = d.getDate() + "-" +(d.getMonth()+1) + "-" + d.getFullYear() + "   " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
	return t;
}

}
