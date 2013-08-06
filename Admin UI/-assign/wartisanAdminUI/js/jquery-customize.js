//slide and hide subnav
function showMenu(e){
	$(e).click(function(){
		for (var i=1; i<=5; i++){
			if(i!= e.substr(e.length-1,e.length)){
				$(e.substr(0,e.length-1)+i+"_1").slideUp();
				$(e.substr(0,e.length-1)+i).css("background","url(images/bg_nav1.jpg) repeat-x");
			}
	  	}
	      
		$(e+"_1").slideToggle("fast", function(){
			if (jQuery(this).is(':hidden')) {
            //do something when close;
			$(e).css("background","url(images/bg_nav1.jpg) repeat-x");
       		} else {
            $(e).css("background","url(images/bg_dark-1x44.jpg) repeat-x");
       		}        
        	return false;	
		});
  });
}
// onload function
$(document).ready(function(){
	$("#lnav1").click(showMenu("#lnav1"));
	$("#lnav2").click(showMenu("#lnav2"));
	$("#lnav3").click(showMenu("#lnav3"));
	$("#lnav4").click(showMenu("#lnav4"));
	$("#lnav5").click(showMenu("#lnav5"));
	$(".bg01").css("background","url(images/bg_li_01.jpg) repeat-x");
	$(".bg02").css("background","url(images/bg_li_02.jpg) repeat-x");
	// mouse-over color changes
	$("ul li").mouseenter(function(){
		$(this).css("background","url(images/bg_dark-1x44.jpg) repeat-x");
	});
	$("ul li").mouseleave(function(){
		$(".bg01").css("background","url(images/bg_li_01.jpg) repeat-x");
		$(".bg02").css("background","url(images/bg_li_02.jpg) repeat-x");
	});
});
