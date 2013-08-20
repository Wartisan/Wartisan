// onload function
$(document).ready(function(){
	$("#updateb").click(function(){
		$("<li></li>").appendTo("#lupditem");
		//var inp=$("<input style='width: 230px; height: 20px'>");
		var inp=$("<span style='display: inline-block; vertical-align: middle'><textarea style='width: 230px; height: 100px; min-width: 230px; max-width: 230px;'></textarea></span>");	
		inp.attr("type", "text");
		inp.attr("id", "inp"+$("li").length);
		inp.attr("class", "inp");
		inp.attr("name", "inp"+$("li").length);
		inp.appendTo("li:last");
		
		var rem=$("<input style='width: 80px; height: 21px'>");
		rem.attr("type", "button");
		rem.attr("value", "Remove");
		rem.attr("id", "rem"+$("li").length);
		rem.attr("class", "rem");
		rem.attr("name", "rem"+$("li").length);
		rem.appendTo("li:last");
		rem.click(function(){
		var leng= $("li").length;
		var m= parseInt($(this).attr("id").substr($(this).attr("id").length-1));
		var n= parseInt(m)-1;
		var j= parseInt(m)+1;
		$("li:eq("+n+")").remove();
		if(m!=leng){
			for (var i=0; i< leng-m; i++){
				//$("#rem"+(j+i)).attr({id:"rem"+(m+i)});
				$("#rem"+(j+i)).attr("id", "rem"+(m+i));
				$("#rem"+(m+i)).attr("name", "rem"+(m+i));
				$("#inp"+(j+i)).attr("id", "inp"+(m+i));
				$("#inp"+(m+i)).attr({name:"inp"+(m+i)});
				}
			}
		});
		//alert($("ul li:last").attr("id"));
		$("li").css("border-bottom", "1px solid #000000");
		$("li:last").css("border-bottom", "none");
		//alert($("li:first").index(this))
//		for (var i=1; i<=$("li").length; i++){
//			$("#rem"+i).click(function(){
//				alert("#rem"+i);
//				alert("row1:"+i);
//				alert("row2:"+$("li").length);
//				var m = $(this).attr("id");
//				alert("row3:"+m);
//				var n= m.substr(m.length-1)-1;
//				alert("row4:"+n);
//				$("li:eq("+n+")").remove();
//				alert("row5:"+"li:eq("+n+")");
//			});
//		}
	});
});
