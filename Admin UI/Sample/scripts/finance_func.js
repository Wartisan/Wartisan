/**
 * @author liuchang
 */

/**addSubAccount，存储子账户信息的二维数组；
 */
var subAccount = new Array();

/** 存储临时的二级分类
 */
var tempCategory2 = new Array();

/**currentTbAccountType，当前的用户类型
 */
var currentTbAccountType = -1;

/** 1,收入；0，支出；2，转账；
 */
var currentBillType = -1;

/** 当前资产状况
 */
var myAllBalance = 0;

/** 当前的父账户id
 */
var currentAid = -1;

/** 当前的子账户id
 */
var currentSid = -1;

/*
 * 是否按照有时间参数，长度为0则有，>0则为有
 */
var isDuration = "";

/** 页面确认按钮提交状态值
 * false 未提交
 * true 正在提交，避免重复提交，提交事件结束后将其赋值为false；
 */
var submitStatus = false;

//payee 临时存储支付对象
var tempPayee = new Array();

/** 金融机构分类
 */
var classBank = 0;
var classFinance = 1;
var classPay = 2;

/*
 * 最后处理的id
 * -1：未处理，0，删除，>0，添加或修改的ID
 */

var editNewPayeeId = -1; //支付对象
var curNewPayeeId = -1;  //编辑状态时之前用户的选择
var editNewBankId = -1;	//金融机构
var curNewBankId = -1;  //编辑状态时之前用户的选择
var isDeleteSubAccount = false; //是否编辑了

//获取账单账户
var getCreditAccount=-1

/*
 * 
 */
var deleteTips =[
	"删除账户将同时删除与该账户关联的所有收入、支出及转账记录，且不可恢复！是否确认删除？",
	"确认删除这笔记录吗？",
	"确认删除该记录？"
]
/*
 * 用于记账校验处理时赋值
 */
var transFormId=[""];

// 编辑账户时的全局变量，默认值为add，为添加；edit为编辑
var accountHandleType = "add";

//全局变量
var currentBankId = "";

// currentTransData,二维数组,下标0，记录了id，下标1； 下标1标记为选择 0，未选择，1，选择；标记2显示，0不显示，1，显示；
var currentTransDataId = [];

var today = new Array();

//被选择的筛选条件  下标0记录了 条件的divid，下标1记录了升降序，0，为升序；1，为降序；
var conditionSelected = ["con1",0];

//批量修改是否显示false为不显示，初始值，true为显示
var batchIsView = false;

var resWidth = 0;
var resHeight = 0;

// 存储批量修改的id数组
var transArray = [];

//取得币种类型；
var listCurrency = getCurrencyInfo();
//取得所有的账户信息；
var listAccount;

/** 获取当前的日期
 */
function getToday(){
	var a = new Date();
	var month = "";
	var date = "";
	if (((a.getMonth() + 1) + "").length == 1)
		month = "0" + (a.getMonth() + 1);
	else
		month = a.getMonth() + 1;
	if ((a.getDate()+"").length == 1)
		date = "0" + a.getDate();
	else
		date = a.getDate();
	today.push(a.getFullYear());
	today.push(month);
	today.push(date);
}

/** 重新载入时，初始化值
 */
function clearAmountAndComment(){
     $(".dRDetail input[name='iAmount']").val("0");
     $(".dRDetail textarea[name='comment']").val("");
	 selectOption("#dROut", "sCategory", 10065);
	 selectOption("#dRIn", "sCategory", 10066);
	 selectOption("#dRTrans", "sCategory", 10066);
	 selectOption("#dRBalance", "sCategory", 10066);
}
 
/** 启动时执行
 */
$(function() {
	getToday();
	createMonthView();
	customizeRadio();
	//数据分类生成，将此部分移至显示方法内
	createLotTransSelectConditions();
	createSingleCalendar(" .sdate", "");
	$("#con1").show();
	$(document).unbind("keypress").keypress (function(event) {
		if (event.keyCode == 13) {
			event.preventDefault();
		}
	});

	var flagSave = {
	    "dRout": false,
        "dRIn": false,
        "dRTrans": false,		
	    "dRBalance": false
	}; //是否有保存操作
	
	//渲染上方的三个按钮
	$(".dRightButton").unbind().click(function (event) {
		if (typeof(window.event) != "undefined") {  
			window.event.cancelBubble = true;
		}
		event.stopPropagation();
		//图片替换
		a = $(this).attr("relbox");
		//modified by liuchang 3368
		if($("#" + a).is(":visible")){
			//关闭逻辑
			$("#" + a).slideUp();
            if (a == "dBatchEdit"){
                batchIsView = false;
				lotIconView("hide");
            }
		} else {
			//显示逻辑
			//edited by liuchang;3.1添加了针对dBatchEdit的处理
			if (a == "dBatchEdit") {
				selectOption("#dBatchEdit", "lotPayee", "-1")
				selectOption("#dBatchEdit", "lotCategory2", "-1");
				batchIsView = true;
				lotIconView("show");
			}
	        var iAmount = $("#" + a + " input[name='iAmount']").val();
			var comment = $("#" + a + " textarea[name='comment']").val(); //取出iAmount, comment
			var categoryValue = $("#" + a + " input[name='sCategory']").val();
			var payeeValue = $("#" + a + " input[name='sPayee']").val(); //取出
	        
	        $("#" + a).find('.dValidation').html('');
	
			if ($("#" + a).css("top") == "42px") {
				//新建
			} else {
				//编辑
				flagSave[a] = true;
			}
			$("#" + a).css("top", 42);
			//生成dataPicker,根据状况是否要显示当前日期
			var date = $("#" + a + " input[name='sdate']").val();
			
			$("#" + a + " input[name='transId1']").val(0);
			//设定账户下拉框内容
			$("#" + a + " input[name='sAccount']").parents(".dRDRSelect").html('<select name="sAccount"></select>');
			//设定账户下拉框内容
			if ((currentAid != -1) && (currentAid != "")) {
				//选定了父账户；
				if ($("#accountList .dSubAccount div[aid='" + currentAid + "']").length > 1) {
					//最少两个子账户
					$("#" + a + " select[name='sAccount']").append(renderAccount("", currentAid));
				} else {
					//只有一个子账户
					//隐藏星号
					//$("#" + a + " select[name='sAccount']").parent().next().hide();
					//赋值
					var aTid = $("#" + currentAid).attr("tid");
					var childId = 0;
					var SACurrency = "";
					var parentName = $("#" + currentAid + " .sMAName").attr("fullname");
	
	
					if ((aTid == 2) || (aTid == 3)) {
						//有2,3类有子账户
						childId = $("#accountList .dSubAccount div[aid='" + currentAid + "']").attr("bid");
						var childName = $("#sa" + childId + " .dSAName").html();
						SACurrency = getCurrencyDesc($("#sa" + childId).attr("currency"));
						$("#" + a + " select[name='sAccount']").replaceWith("<input type='text' class='iDisabled' disabled value='" + parentName + "->" + childName + "'>");
					} else {
						childId = $("#" + currentAid).attr("bid");
						SACurrency = getCurrencyDesc($("#" + currentAid).attr("currency"));
						$("#" + a + " select[name='sAccount']").replaceWith("<input type='text' class='iDisabled' disabled value='" + parentName + "'>");
					}
					$("#" + a + " .currencyName").html(SACurrency + "：");
					//添加hidden的input框
					$("#" + a + " .iDisabled").after("<input id = 'sAccount' name='sAccount' type='hidden' value='" + childId + "'>");
				}
			} else if ((currentSid != -1) && (currentSid != "")) {
				//选定子账户情况
				//隐藏星号
				$("#" + a + " select[name='sAccount']").parent().next().hide();
				//赋值
				var parentId = $("#sa" + currentSid).attr("aid");
				var parentName = $("#" + parentId + " .sMAName").attr("fullname");
				var SAName = $("#sa" + currentSid + " .dSAName").html();
				var SACurrency = getCurrencyDesc($("#sa" + currentSid).attr("currency"));
				$("#" + a + " select[name='sAccount']").after("<input type='text' id='temp' class='iDisabled' disabled value='" + parentName + "->" + SAName + "'>");
				$("#" + a + " .currencyName").html(SACurrency + "：");
				//移除select框；
				$("#" + a + " select[name='sAccount']").remove();
				//添加hidden的input框
				$("#" + a + " .iDisabled").after("<input name='sAccount' type='hidden' value='" + currentSid + "'>");
			} else {
				//所有账户
				$("#" + a + " select[name='sAccount']").html(renderAccount());
			}
			$("#" + a + " input[name='sAccount2']").parents(".dRDRSelect").html('<select name="sAccount2"></select>');
			$("#" + a + " select[name='sAccount2']").html(renderAccount());
			$("#" + a + " input[name='iAmount']").val(0);
			$("#" + a + " textarea[name='comment']").val("");
			//定制下拉框
			customizeSelect("#" + a);
			$("#" + a + " .iDelete").hide();
	
	        //设定背景图
			$("#" + a + " .dRTBg").removeClass(a + "Bg1");
			$("#" + a + " .dRTBg").addClass(a + "Bg");
			$("#" + a + " .dRTContent").css("top", "20px");
	
			$("#" + a + " .dValidation .error").replaceWith("");
			if (flagSave[a] == true) {
			    if (a == "dROut") {
			       selectOption("#" + a, "sCategory", 10065);
		        } else {
			       selectOption("#" + a, "sCategory", 10066);
			    }
				selectOption("#" + a, "sPayee", 0);
				var myDate = new Date(),
				    myYear = myDate.getFullYear(),
					myMonth = myDate.getMonth() + 1 >= 10 ? myDate.getMonth() + 1 : "0" + eval(myDate.getMonth() + 1),
					myDate = myDate.getDate() >= 10 ? myDate.getDate() : "0" + myDate.getDate();
				var nowDate = [myYear, myMonth, myDate];
				var date = nowDate.join("-");
				$('#' + a + " input[name='sdate']").val(date);
				flagSave[a] = false;
			} else {
			    selectOption("#" + a, "sCategory", categoryValue);
				selectOption("#" + a, "sPayee", payeeValue);
				$("#" + a + " input[name='iAmount']").val(iAmount);
				$("#" + a + " textarea[name='comment']").val(comment);
				$('#' + a + " input[name='sdate']").val(date);
			}
	
			if ($(".dRDetail").is(":visible")) {
				//有未关闭的窗口，则关闭该窗口
				$(".dRDetail:visible").hide();
				$("#" + a).show("slide", { direction: "up" }, 250, function() {$(this).find("input[name='iAmount']").focus().select();});
			} else {
				//没有未关闭的窗口
				$("#" + $(this).attr("relbox")).show("slide", { direction: "up" }, 250, function() {$(this).find("input[name='iAmount']").focus().select();});
				$("#iAmount2Area").hide();
			}
			selectOption("#" + a, "sAccount", $("#" + a + " input[name='sAccount']").siblings(".list").children(".option:first").attr("val"));
	        $("#" + a).unbind('keypress').keypress(function(e){//添加键盘事件
				e.stopPropagation();
				if (e.keyCode == 13){
				   e.preventDefault();
				   $("#" + a + " .iSave").click();
				}else if (e.keyCode == 27){
				   $("#" + a + " .iCancel").click();
				}
		    });
		}
	});
	
	
	$(".dRDetail").click(function (event) {
		event.stopPropagation();
	});
	//收起所有弹出框
	$(document).click(function () {
		$(".dRDetail:visible").hide("slide", { direction: "up" }, 250);
	});
	//点取消键时收起所有弹出框
	$(".iCancel").click(function(e) {
		var form_id = "#" + $(this).parents("form").attr("id");
		//清除所有验证信息
		$(form_id + " .dValidation .error").replaceWith("");
		$(".dRDetail:visible").hide("slide", { direction: "up" }, 250);
		flagSave[a] = true;
		$("#iAmount2Area").hide();
	});
	
	
	//点确定时的动作
	$(".iSave").unbind().click( function () {
		//通知设置页余额有变动
		try {
			MoneyHubJSFuc("SetParameter","BalanceChanged", "1"); //余额有变动时通知管理页
			MoneyHubJSFuc("SetParameter","BalanceChangedR", "1");   //余额有变动时通知统计报表页
			MoneyHubJSFuc("SetParameter","BalanceChangedS", "1");   //余额有变动时通知提示频道
		} catch (e) {
            logCatch(e.toString());
		}

		form_id = "#" + $(this).parents("form").attr("id");
        
        //判断当前是否存在账户
        if (!isExistAccount()){
            $(form_id + " input[name = 'sAccount']").parents('.dRDRField').find('.dValidation').css('color', 'red').html('请您新建一个账户');
            return false;
        }

		if (form_id == "#addTrans") {
			if(getCurrentAccountStatus()){
				//一个子账户
				sAccount = $("#dRTrans input[name='sAccount']").attr("value");
			}else{
				//多个子账户
				sAccount = $("#dRTrans input[name='sAccount']").val();
			}
			var sAccount2 = $("#dRTrans input[name='sAccount2']").val();
			if (getSubAccountCurrencyId(sAccount) == getSubAccountCurrencyId(sAccount2)) {
				//如果币种相同，则iAmount2 = iAmount
				$("#dRTrans input[name='iAmount2']").val($("#dRTrans input[name='iAmount']").val());;
			}
		}
		if (myFormValidate(form_id)) {
			transId1 = $(form_id + " input[name='transId1']").val();
			amount = $(form_id + " input[name='iAmount']").val();
			if (transId1 == 0) {
				if (form_id == "#addTrans") {
					//新建转账
					addTransList();
				} else {
					//新建收支
					addList(form_id);
				}
			} else {
				if (form_id == "#addTrans") {
					//编辑转账
					editTransList();
				} else {
					//编辑收支
					editList(form_id);
				}
			}
			$(".dRDetail:visible").hide("slide", { direction: "up" }, 250);
			flagSave[a] = true;
			$("#iAmount2Area").hide();
		}
	});

	//点击导入账户
	$("#dRBImport").click(function() {
		if ($(this).attr("bankid") == 0) {
			//显示选择银行对话框
			showAdd("chooseBank");
		} else {
			//直接访问银行页面
			sendGetBillInterface($(this).attr("bankid"), $(this).attr("accounttype"), $(this).attr("aid"), $(this).attr("keyinfo"));
		}
	});
	
	//点击新建账户
	$("#iNewAccount").click(function() {
		try {
			MoneyHubJSFuc("SetParameter","ShowAddAccount", "1");
		} catch (e) {
            logCatch(e.toString());
		}
		window.open('set.html');
	});

	//点击新建分类
	$(".iNewCategory").click(function() {
		if ($(this).parents(".dRDetail").attr("id") == "dROut") {
			showAddCategory = "0";
		} else {
			showAddCategory = "1";
		}
		try {
			MoneyHubJSFuc("SetParameter","ShowAddCategory", showAddCategory);
		} catch (e) {
            logCatch(e.toString());
		}
		window.open('set.html');
	});

	//点击新建收付款方
	$(".iNewPayee").click(function() {
		try {
			MoneyHubJSFuc("SetParameter","ShowAddPayee", "1");
		} catch (e) {
            logCatch(e.toString());
		}
		window.open('set.html');
	});

	//定制卷滚条
	//mCustomScrollbars();

	//适应IE6
	$('#addMyBank').bgiframe();                                                                                                                   

	//渲染左侧账户列表
	createAccountTree();

	//生成12个月账单列表
    createBillMonth();
    
	//渲染右侧账本详情
	renderTransView();

	//调整屏幕尺寸
	initSize();

	//设定分类下拉框内容
	$("#dROut select[name='sCategory']").html(renderCategory(0));
	$("#dRIn select[name='sCategory']").html(renderCategory(1));
	//设定收付款人下拉框内容
	$("select[name='sPayee']").html(renderPayee());

	//定制下拉框
	customizeSelect();
	clearAmountAndComment();
	$("body").css("top", "0px");
});

/** 窗口被激活时调用
 */
function TabActivated() {
	var newUser = "Guest";
	payeeChanged = "-1";
	reloadFinance = "-1";
	try {
		//newUser = MoneyHubJSFuc("GetCurrentUserID");
		payeeChanged = MoneyHubJSFuc("GetParameter","PayeeChanged");
		MoneyHubJSFuc("SetParameter","PayeeChanged", "-1");
		reloadFinance = MoneyHubJSFuc("GetParameter","ReloadFinance");
		MoneyHubJSFuc("SetParameter","ReloadFinance", "-1");
	} catch (e) {
            logCatch(e.toString());
	}
	if (reloadFinance != "-1" && reloadFinance != '') {
	   window.location.reload();
	}
	/*if (newUser != currentUser) {
	   window.location.reload();
	}*/
	if (payeeChanged != "-1" && payeeChanged != "") {
		//收付款方发生了变化
		if (!$("#dRIn").is(":visible")) {
			oldPayee = $("#dRIn input[name='sPayee']").val();
		}
		if (!$("#dROut").is(":visible")) {
			oldPayee = $("#dROut input[name='sPayee']").val();
		}
		$("input[name='sPayee']").each(function () {
			$(this).parent().replaceWith("<select name='sPayee'></select>");
		});
		$("select[name='sPayee']").html(renderPayee());
		customizeSelect("#dRIn");
		customizeSelect("#dROut");
		renderTransView(currentAid, currentSid);
		if ($("#dRIn").is(":visible")) {
			selectOption("#dRIn", "sPayee", payeeChanged);
		} else {
			selectOption("#dRIn", "sPayee", oldPayee);
		}
		if ($("#dROut").is(":visible")) {
			selectOption("#dROut", "sPayee", payeeChanged);
		} else {
			selectOption("#dROut", "sPayee", oldPayee);
		}
		
		//批量修改时的收付款方下拉框
		$("input[name='lotPayee']").parent().replaceWith('<select id="lotPayee" name="lotPayee"><option value="-1">收付款方修改为</option></select>');
		$("#lotPayee").append(renderPayee());
		$("#lotPayee").attr("value", "-1");
		customizeSelect("#dBatchEdit");
	}
	
	var categoryChanged = "-1";
	try {
		categoryChanged = MoneyHubJSFuc("GetParameter","CategoryChanged");
		MoneyHubJSFuc("SetParameter","CategoryChanged", "-1");
	} catch (e) {
            logCatch(e.toString());
	}
	if (categoryChanged != "-1" && categoryChanged != "") {
		//分类发生了变化
		if (!$("#dRIn").is(":visible")) {
			oldCatIn = $("#dRIn input[name='sCategory']").val();
		} else {
			oldCatIn = 10066;
		}
		if (!$("#dROut").is(":visible")) {
			oldCatOut = $("#dROut input[name='sCategory']").val();
		} else {
			oldCatOut = 10065;
		}
		$("input[name='sCategory']").each(function () {
			$(this).parent().replaceWith("<select name='sCategory'></select>");
		});
		$("#dROut select[name='sCategory']").html(renderCategory(0));
		$("#dRIn select[name='sCategory']").html(renderCategory(1));
		customizeSelect("#dRIn");
		customizeSelect("#dROut");
		renderTransView(currentAid, currentSid);
		if ($("#dRIn").is(":visible")) {
			selectOption("#dRIn", "sCategory", categoryChanged);
		} else {
			selectOption("#dRIn", "sCategory", oldCatIn);
		}
		if ($("#dROut").is(":visible")) {
			selectOption("#dROut", "sCategory", categoryChanged);
		} else {
			selectOption("#dROut", "sCategory", oldCatOut);
		}

		//批量修改时的分类下拉框
		$("input[name='lotCategory2']").parent().replaceWith('<select id="lotCategory2" name="lotCategory2"><option value="-1">分类修改为</option></select>');
		$("#lotCategory2").append(renderNoTypeCategory());
		$("#lotCategory2").attr("value", "-1");
		customizeSelect("#dBatchEdit");
	}

	var accountChanged = "-1";
	try {
		accountChanged = MoneyHubJSFuc("GetParameter","AccountChanged");
		MoneyHubJSFuc("SetParameter","AccountChanged", "-1");
	} catch (e) {
            logCatch(e.toString());
	}
	if (accountChanged != "-1" && accountChanged != "") {
		//账户发生了变化
		//渲染左侧账户列表
		createAccountTree();
		//检查当前选中的账户是否被删除
		var foundId = false;
		var foundSubId = false;
		if (currentSid != "") {
			$.each(listAccount, function(i, n) {
				if (n.bid == currentSid) {
					foundSubId = true;
					return false;
				}
			});
			if (!foundSubId) {
				currentSid = "";
			}
		} else if (currentAid != "") {
			$.each(listAccount, function(i, n) {
				if (n.aid == currentAid) {
					foundId = true;
					return false;
				}
			});
			if (!foundId) {
				currentAid = "";
			}
		}
		//渲染右侧
		renderTransView(currentAid, currentSid);
	}
}

/** 屏幕大小改变时执行
 */
function initSize() {
	try {
		screenSize = MoneyHubJSFuc("GetScreenSize").split("x");
		resWidth = screenSize[0];
		resHeight = screenSize[1] - 30;
	} catch (e) {
            logCatch(e.toString());
		resWidth = 1680;
		resHeight = 468;
	}

	if ($("#main").parent().attr("tagName") != "BODY") {
		$("#main").parent().center();
	}
	if ($("#addMyPayee").parent().attr("tagName") != "FORM") {
		$("#addMyPayee").parent().center();
	}
	if ($("#getCreditCardBillList").parent().attr("tagName") != "FORM") {
		$("#getCreditCardBillList").parent().center();
	}
	if ($("#addMyBank").parent().attr("tagName") != "FORM") {
		$("#addMyBank").parent().center();
	}

	$("#dLeftAccount").height(resHeight - $("#dLeftHeader").height() - 1);
	$("#dLeftDragger").height($("#dLeftAccount").height());

	//右下角交易列表区高度
	RRHeight = resHeight - $("#ui-headtabs").height() - $("#dRightButtons").height() - 95;
	dRDHidden = false;
	if($('#dRightDetail').is(':visible')) {
		RRHeight = RRHeight - $("#dRightDetail").height();
	} else {
		dRDHidden = true;
	}
	$("#dRightRecords").height(RRHeight);
	$("#dRightRecords #dRRDetail").height(RRHeight - 70);
	$("#dRightDragger").height($("#dRRDetail").height() - 2);
	
	$("body").width(resWidth);
	$(".dLeft").width(210);
	$(".dRight").width(resWidth - 220);
	$("#dRightRecords").width($(".dRight").width() - 10);
	if (dRDHidden) {
		$('#dRightDetail').hide();
	}

	//调整列表表格宽度
	$(".dRRBCenter").each(function (index) {
		$(this).width($(this).parent().parent().width() - 18);
	});
	/*$(".container").each(function (index) {
		$(this).width($(this).parent().width() - 12);
	});*/

	//左侧账户列表名字宽度
	$(".sMAName").width($("#accountList").width() - 65);
	$(".sMAName").each(function(i) {
		maxLen = Math.floor(($(".sMAName").width() - 1) / 13);
		var finalFullName = $(this).attr("fullname").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
		if ($(this).attr("fullname").length > maxLen) {
			$(this).html(finalFullName.substring(0, maxLen - 1) + "…");
		} else {
			$(this).html(finalFullName);
		}
	});
	
	//上部交易区宽度
	$("#dRDBack4").width($("#dRightDetail").width() - 52 - $("#dRDBack2").width());

	//中间桔色条的宽度
	$("#accountBack2").width($(".dRight").width() - 34);
	//中间月份条宽度
	$("#dRDCenter").width($(".dRight").width() - 200);
	
	//添加空行
	$("#dRightTableTrans").append(generateEmptyLines("#dRightTableTrans", 7, "$(\"#dRBOut\").click()"));

	setTransTDWidth();
}


/** 设定右侧交易区表格列宽
 */
function setTransTDWidth() {
	nTDWidth = $("#dRTHeader").width() * 0.13;
    if (nTDWidth < 115) nTDWidth = 115;
	$("#dRightRecords #dRTHeader td:nth-child(1)").width(nTDWidth);
	$("#dRightRecords #dRTHeader td:nth-child(2)").width(nTDWidth);
	$("#dRightRecords #dRTHeader td:nth-child(3)").width(nTDWidth);
	$("#dRightRecords #dRTHeader td:nth-child(4)").width(nTDWidth);
	$("#dRightRecords #dRTHeader td:nth-child(5)").width(nTDWidth);
	$("#dRightRecords #dRTHeader td:nth-child(6)").width(nTDWidth);

	$("#dRightTableTrans td:nth-child(1)").width(nTDWidth);
	$("#dRightTableTrans td:nth-child(2)").width(nTDWidth);
	$("#dRightTableTrans td:nth-child(3)").width(nTDWidth);
	$("#dRightTableTrans td:nth-child(4)").width(nTDWidth);
	$("#dRightTableTrans td:nth-child(5)").width(nTDWidth);
	$("#dRightTableTrans td:nth-child(6)").width(nTDWidth);
}

function changeExchangeRate() {
	$("#iAmount2Content").html("(100" + getCurrencyDesc(getSubAccountCurrencyId($('#dRTrans input[name="sAccount"]').val())) + "约折合" + getMyExchange($('#dRTrans input[name="iAmount"]').val(), $('#dRTrans input[name="iAmount2"]').val()) + getCurrencyDesc(getSubAccountCurrencyId($('#dRTrans input[name="sAccount2"]').val())) + ")");
}

/** 编辑交易记录
 * @param event 发生点击的事件
 */
function editTransaction(event) {
	event.stopPropagation();
	$(".dRDetail").hide();
	targetRow = $(event.target).parents("tr");

	//给选定的行上色
	$("#dRightTableTrans tr").removeClass("transSelected");
	$("#trans" + targetRow.attr("id").substr(5)).addClass("transSelected");

	if (targetRow.attr("type") == 1) {
		divName = "#dRIn";
	} else {
		divName = "#dROut";
	}	
	if (targetRow.attr("category") == 10067) divName = "#dRBalance";
	if (targetRow.attr("category") == 10059 || targetRow.attr("category") == 10060) divName = "#dRTrans";
	$(divName + " input[name='sAccount']").parents(".dRDRSelect").html("<input type='text' class='iDisabled' disabled value='" + targetRow.attr("satext") + "' />"
		+ "<input type='hidden' name='sAccount' value='" + targetRow.attr("saccount") + "' />");

	//生成dataPicker,根据状况是否要显示当前日期
	$(divName + " .sdate").val(targetRow.attr("transdate"));
	$(divName + " .currencyName").html(targetRow.attr("currency") + "：");
	$(divName + " input[name='iAmount']").val(targetRow.attr("amount"));
	$(divName + " input[name='transId1']").val(targetRow.attr("id").substr(5));
	$(divName + " textarea[name='comment']").val(targetRow.attr("comment").replace(/\<m\> \<\/m\>/g, "\n"));
	
	if ((divName == "#dRIn") || (divName == "#dROut")) {
		selectOption(divName, "sCategory", targetRow.attr("category"));
		selectOption(divName, "sPayee", targetRow.attr("payeeid"));
	}
	
	if (targetRow.attr("category") == 10059) {
		//转账支出
	    $(divName + " input[name='transId1']").val(targetRow.attr("id").substr(5));
		$(divName + " input[name='transId2']").val(targetRow.attr("direction"));
	    var saccount1 = targetRow.attr("saccount1");
	    var name = getSubAccountName(saccount1);
		$(divName + " input[name='sAccount2']").parents(".dRDRSelect").html("<input type='text' class='iDisabled' disabled value='" + name + "' />"
		    + "<input type='hidden' name='sAccount2' value='" + saccount1 + "' />");

		var sAccount = $("#dRTrans input[name='sAccount']").val();
		var sAccount2 = $("#dRTrans input[name='sAccount2']").val();
		if ((sAccount != "") && (sAccount2 != "") && (sAccount != sAccount2) && (getSubAccountCurrencyId(sAccount) != getSubAccountCurrencyId(sAccount2))) {
			//两个账户币种不同
			$("#iAmount2Area").show();
		} else {
			$("#iAmount2Area").hide();
		}
		try {
			//获得转账对方金额
			result1 = MoneyHubJSFuc("QuerySQL","SELECT amount AS myAmount2, tbSubAccount_id FROM tbtransaction WHERE mark = 0 and id = " + parseInt(targetRow.attr("direction")));
			result1 = JSON.parse(result1);
		} catch (e) {
            logCatch(e.toString());
		    //alert(e.message);
		}
		$("#iAmount2").val(result1[0].myAmount2);
		changeExchangeRate();
	} else if (targetRow.attr("category") == 10060) {
		//转账收入
	    $(divName + " input[name='transId1']").val(targetRow.attr("direction"));
		$(divName + " input[name='transId2']").val(targetRow.attr("id").substr(5));
	    var saccount1 = targetRow.attr("saccount1");
	    var name = getSubAccountName(saccount1);
	    $(divName + " input[name='sAccount2']").parents(".dRDRSelect").html("<input type='text' class='iDisabled' disabled value='" + targetRow.attr("satext") + "' />"
		    + "<input type='hidden' name='sAccount2' value='" + targetRow.attr("saccount") + "' />");
	    $(divName + " input[name='sAccount']").parents(".dRDRSelect").html("<input type='text' class='iDisabled' disabled value='" + name + "' />"
		    + "<input type='hidden' name='sAccount' value='" + saccount1 + "' />");

		var sAccount = $(divName + " input[name='sAccount']").val();
		var sAccount2 = $(divName + " input[name='sAccount2']").val();
		currencyId = getSubAccountCurrencyId(sAccount);
		currencyId2 = getSubAccountCurrencyId(sAccount2);
		if ((sAccount != "") && (sAccount2 != "") && (sAccount != sAccount2) && (currencyId != currencyId2)) {
			//两个账户币种不同
			$("#iAmount2Area").show();
		} else {
			$("#iAmount2Area").hide();
		}
		try {
			//获得转账对方金额
			result1 = MoneyHubJSFuc("QuerySQL","SELECT amount AS myAmount2, tbSubAccount_id FROM tbtransaction WHERE id=" + targetRow.attr("direction"));
			result1 = JSON.parse(result1);
		} catch (e) {
            logCatch(e.toString());
		}
		$(divName + " .currencyName").html(getCurrencyDesc(currencyId) + "：");
		$(divName + " input[name='iAmount2']").val($(divName + " input[name='iAmount']").val());
		$(divName + " input[name='iAmount']").val(result1[0].myAmount2);
		changeExchangeRate();
	}

	createSingleCalendar(divName + " .sdate");
	$(divName + " .iDelete").show().unbind("click").click(function () {
		if (confirm(deleteTips[1])) {
			//通知设置页余额有变动
			try {
				MoneyHubJSFuc("SetParameter","BalanceChanged", "1"); //余额有变动时通知管理页
			    MoneyHubJSFuc("SetParameter","BalanceChangedR", "1");   //余额有变动时通知统计报表页
			    MoneyHubJSFuc("SetParameter","BalanceChangedS", "1");   //余额有变动时通知提示频道
			} catch (e) {
            logCatch(e.toString());
			}
			$(divName).hide("slide", { direction: "up" }, 250);
			deleteList(divName);
		}
	});

	//弹出编辑框
	if (targetRow.offset().top < resHeight - 205) {
		$(divName).css("top", targetRow.offset().top + 30);
		$(divName + " .dRTBg").removeClass(divName.substr(1) + "Bg1");
		$(divName + " .dRTBg").addClass(divName.substr(1) + "Bg");
		$(divName + " .dRTContent").css("top", "20px");
		$(divName).hide();
		$(divName).show("slide", { direction: "up" }, 250, function() {$(this).find("input[name='iAmount']").focus().select();});
	} else {
		$(divName).css("top", targetRow.offset().top - 200);
		$(divName + " .dRTBg").removeClass(divName.substr(1) + "Bg");
		$(divName + " .dRTBg").addClass(divName.substr(1) + "Bg1");
		$(divName + " .dRTContent").css("top", "30px");
		$(divName).hide();
		$(divName).show("slide", { direction: "down" }, 250, function() {$(this).find("input[name='iAmount']").focus().select();});
	}
}

/** 根据主图层名称和编辑状态处理对话框底部按钮的事件
 * @param dialogName 对话框ID
 * @param id 主账户编号 
 */
function changeButton(dialogName, id) {
	var BoxName = "#" + dialogName + "boxBg";
	$(BoxName + ' .boxBg8 .oplist').html("<li><span class='yes_btn'></span></li><li><span class='cancel_btn'></span></li>");

	switch (dialogName) {
		case "getCreditCardBillList":
			//导入账单窗口有两个按钮：确定和取消
			$('#getCreditCardBillListboxBg .boxBg8 .oplist .del_btn').parent().hide();
			$('#getCreditCardBillListboxBg .boxBg8 .oplist .yes_btn').unbind().click( function(){
				myFormValidate('#billForm');
			});
			$("#getCreditCardBillListboxBg .cancel_btn").unbind("click").click(function () {
				cancelAdd("getCreditCardBillList");
			});
			break;
			
		case "autoMerge":
			if($("#dAMSelectAll").length>0) $("#dAMSelectAll").remove();
			$(BoxName + ' .boxBg8').append("<div id='dAMSelectAll' value='0'><span class='sCheckBox'></span>全选</div>");
			$(BoxName + ' .boxBg8 .oplist').html("<li><span class='convtran_btn'></span></li><li><span class='pause_btn'></span></li>");
			$(BoxName + ' .boxBg8 #dAMSelectAll .sCheckBox').unbind().click( function(){
				allSelectAutoMerge();
				//将全选重置
				$("#dAMSelectAll").attr("value",0);
			});
			$(BoxName + ' .boxBg8 .oplist .convtran_btn').unbind().click( function(){
				//关闭窗口
				cancelAdd(dialogName);
				aMListener1 = setInterval(autoMergeListener1,20);
			});
			$(BoxName + ' .boxBg8 .oplist .pause_btn').unbind().click( function(){
				//关闭窗口
				cancelAdd(dialogName);
				//将全选重置
				aMListener2 = setInterval(autoMergeListener2,20);
			});
			break;
			
		case "deleteManu":
			$(BoxName + ' .boxBg8 .oplist').html("<li><span class='delrec_btn'></span></li><li><span class='pause_btn'></span></li>");
			$(BoxName + ' .boxBg8 .oplist .delrec_btn').unbind().click( function(){
				//关闭窗口
				cancelAdd(dialogName);
				dMListener1 = setInterval(deleteManuListener1,20);
			});
			$(BoxName + ' .boxBg8 .oplist .pause_btn').unbind().click( function(){
				//直接回归住流程
				cancelAdd(dialogName);
				dMListener2 = setInterval(deleteManuListener2,20);
			});	
			break;
		
		// modified by liuchang 添加确定按钮
		case "importAccount":
			$(BoxName + ' .boxBg8 .oplist .cancel_btn').parent().hide();
			$(BoxName + ' .boxBg8 .oplist .yes_btn').unbind().click( function(){
				//关闭窗口
				cancelAdd(dialogName);
				iAListener = setInterval(importAccountListener,20);
			});
			break;
		// add by liuchang 添加确定按钮
		case "lastMessage":
			$(BoxName + ' .boxBg8 .oplist .cancel_btn').parent().hide();
			$(BoxName + ' .boxBg8 .oplist .yes_btn').unbind().click( function(){
				//关闭窗口
				cancelAdd(dialogName);
				//showWait("true");
			});
			break;
			
		default:
			$('.boxBg8 .oplist .del_btn').parent().hide();
			$('.boxBg8 .oplist .yes_btn').unbind().click( function(){
				cancelAdd(dialogName);
			});
			break;
	}
}

/** 显示弹出对话框
 * @param dialogName 对话框ID
 * @param id 主账户编号 
 */
function showAdd(dialogName, id) {
	//首先处理底部按钮事件
	changeButton(dialogName, id);
	$("#scover").show();
	$("#" + dialogName).parent().show();
	//importAccount 作为特殊处理  隐藏$('.boxClose')，在处理事件中显示
	if(dialogName == "importAccount" || dialogName == "autoMerge" || dialogName == "deleteManu") $('.boxClose').hide();

	//清除所有验证信息
	$("#" + dialogName + " .dValidation .error").replaceWith("");

	//重定义回车事件
	$("#" + dialogName).unbind('keypress').keypress(function (event) {
		event.stopPropagation();
		if (event.keyCode == 13) {
			event.preventDefault();
			$("#" + dialogName).parents(".boxBg").find(".yes_btn").click();
		}
	});
	
	$("#" + dialogName + " .editArea").unbind('keypress').keypress(function (event) {
		event.stopPropagation();
		if (event.keyCode == 13) {
			event.preventDefault();
			$("#" + dialogName + " .editArea .bAdd").click();
		}
	});
	
	adjustWH(dialogName);
}

/** 调整弹出框高度和宽度
 * @param dialogName 弹出框名
 */
function adjustWH(dialogName) {
	//创建自定义select
	customizeSelect("#" + dialogName);
	if (($("#" + dialogName + " #addAccount_step2").is(":hidden")) || (!$("#" + dialogName + " #addAccount_step2").html())) {
		$("#" + dialogName).boxwidth($("#" + dialogName + " .dStep1").width() + 10);
		$("#" + dialogName).boxheight($("#" + dialogName + " .dStep1").height() + 10);
	} else {
		$("#" + dialogName).boxwidth($("#" + dialogName + " .dStep1").width() + $("#addAccount_step2").width() + 20);
		$("#" + dialogName).boxheight($("#" + dialogName + " #addAccount_step2").height() + 10);
	}
	$("#" + dialogName).parent().center();	
}

/** 关闭添加账户等对话框
 * @param dialogName 对话框ID
 */
function cancelAdd(dialogName) {
	$("#scover").hide();
	$("#" + dialogName).parent().hide();
}

/** 定制卷滚条
 */
function mCustomScrollbars() {
	$("#dLeftAccount").mCustomScrollbar("vertical",0,"easeOutCirc",1.05,"auto","yes","no",0);
	$("#dRRDetail").mCustomScrollbar("vertical",0,"easeOutCirc",1.05,"auto","yes","no",0);
}

/** 生成日历事件
 * @param calDivId 日历控件编号
 * @param notNull 如果有值，则显示当前日期，否则显示一个空日历 
 */
function createSingleCalendar(calDivId, notNull) {
	$.datepicker.setDefaults($.datepicker.regional["zh-CN"]);
	$(calDivId).datepicker({
		//changeMonth: true,
		//changeYear: true
	});
	if (notNull != undefined) {
		$(calDivId).datepicker('setDate', new Date());
	}
	var showOn = $(calDivId).datepicker("option", "showOn");
	$("#ui-datepicker-div").click(function (event) {
		event.stopPropagation();
	});
}

//根据当前时间生成随机数
function createTimeRandom() {
	var date=new Date();
	var yy=date.getYear();
	var MM=date.getMonth() + 1;
	var dd=date.getDay();
	var hh=date.getHours();
	var mm=date.getMinutes();
	var ss=date.getSeconds();
	var sss=date.getMilliseconds();
	var result=Date.UTC(yy,MM,dd,hh,mm,ss,sss);
	return result;
}

/** 生成左侧账户树
 */
function createAccountTree() {
    listAccount = getAccountList();
	//取得账户与子账户的对应情况
	try {
		result1 = JSON.parse(MoneyHubJSFuc("QuerySQL","SELECT COUNT(DISTINCT(b.id)) AS myNumber, a.id AS aid FROM tbAccount a, tbSubAccount b WHERE a.mark =0 and b.mark = 0 and a.id=b.tbAccount_id AND a.tbaccountType_id in (2, 3) GROUP BY a.id"));
	} catch (e) {
            logCatch(e.toString());
		result1 = [{
			"myNumber": 1,
			"aid": 1
		},{
			"myNumber": 1,
			"aid": 2
		}];
	}
	

	//清空数据层
	var aId = "";
	var content = "";
	var accountSonNumber = 0;
	var k = 0;
    
	$.each(listAccount, function(i, n) {
		//判断是否为统一账户    8
		//判断是否为1对1账户
		if (aId == n.aid)
			k++;
		else {
			aId = n.aid;
			k = 0;
		} 
		if (n.keyInfo == undefined) n.keyInfo = "";
		if ((n.tid == 2) || (n.tid == 3)) {
			$.each(result1, function(j, m) {
				if (m.aid == n.aid) {
					//取得当前的子分类的总数
					accountSonNumber = m.myNumber;
					return false;
				}
			});
			
			//有子分类的
			if (k == 0) {
				//新的，第一个
				content += "<div class='dMainAccount dMainAccountU' id='" + n.aid + "' aid='" + n.aid + "' bankid='" + n.bankId + "' tid='" + n.tid + "' keyinfo='" + n.keyInfo
					+ "' onmouseout='$(\"#accountSetup_" + n.aid + "\").hide();' onclick='renderTransView(\"" + n.aid + "\", \"\");'>";
				content += "<span class='sLeftTree' id='action_" + n.aid + "' style='background:url(\"../images/tree1.gif\") no-repeat 7px 10px' onclick='myToggle(" + n.aid + ");'></span>";
				content += "<span id='sMAName' fullname='" + n.aname.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/'/g, "&#39;")
					+ "' class='sMAName'>" + n.aname.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/'/g, "&#39;") + "</span>";
				content += "</div>";

				//生成子账户层
				content += "<div id='sub_" + n.aid + "' class='dSubAccount' >";
				content += "<div id='sa" + n.bid + "' bankid='" + n.bankId + "' aid='" + n.aid + "' bid='" + n.bid + "' tid='" + n.tid + "' currency='" + n.tbCurrency_id + "' keyinfo='" + n.keyInfo
					+ "' class='dSubAccountItemFirst' onclick='renderTransView(\"\"," + n.bid + ")'><div class='dSAName'>" + n.bname.replace(/&/, "&amp;") + "</div></div>";
				//只有一个的
				if (accountSonNumber == 1) {
					content += "</div>";
				} 
			} else {
				//老的
				content += "<div id='sa" + n.bid + "' bankid='" + n.bankId + "' aid='" + n.aid + "' bid='" + n.bid + "' tid='" + n.tid + "' currency='" + n.tbCurrency_id + "' keyinfo='" + n.keyInfo
					+ "' class='dSubAccountItem' onclick='renderTransView(\"\"," + n.bid + ")'><div class='dSAName'>" + n.bname.replace(/&/, "&amp;")+ "</div></div>";
				//最后一个，结束div
				if (k == (accountSonNumber - 1)) {
					content += "</div>";
				}
			}
		} else {
			//无子账户或者只有一个子账户
			var legalName = n.aname.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/'/g, "&#39;");
			content += "<div class='dMainAccount dMainAccountU' id='" + n.aid + "' aid='" + n.aid + "' bid='" + n.bid + "' bankid='" + n.bankId + "' tid='" + n.tid + "' currency='" + n.tbCurrency_id + "' keyinfo='" + n.keyInfo
				+ "' onmouseout='$(\"#accountSetup_"+n.aid+"\").hide();' onclick='renderTransView(\"" + n.aid + "\", " + n.bid + ")'>";
			content += "<span id='sMAName' fullname='" + legalName + "' class='sMAName'>" + legalName + "</span>";
			content += "</div>";
		}
	});
	$("#accountList").html(content);

	//左侧账户列表名字宽度
	$(".sMAName").width($("#accountList").width() - 65);
	$(".sMAName").each(function(i) {
		maxLen = $(".sMAName").width() / 13;
		var finalFullName = $(this).attr("fullname").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
		if ($(this).attr("fullname").length > maxLen) {
			$(this).html(finalFullName.substring(0, maxLen - 1) + "…");
		} else {
			$(this).html(finalFullName);
		}
	});
}

/** 抓取账单之前，将账户id赋值给currentAid，刷新交易区；
 * @param id 主账户id
 */
function myToggle(aid) {
	//阻止事件冒泡传递
	if (window.event)
		window.event.cancelBubble = true;

	if ($("#action_" + aid).css('background-image').indexOf("tree2.gif") != -1)
		$("#action_" + aid).css('background', 'url(../images/tree1.gif) no-repeat 7px 10px');
	else
		$("#action_" + aid).css('background', 'url(../images/tree2.gif) no-repeat 7px 10px');
	$("#sub_"+aid).toggle();
	
}

/** 生成当前账户的信息
 * @param aid 主账号编号
 * @param sid 子账号编号
 */
function renderCurrentAccount(aid, sid) {
	$("#myYear").html(today[0] + "年");
	if((typeof(aid) != "undefined" || aid != "")) {
		currentAid = aid;
	}
	if((typeof(sid) != "undefined" || sid != "")) {
		currentSid = sid;
	}
	var sql = "";
	var result = "";
	var desc = "当前帐户：";
	
	var keyInfoMessage = "";
	
	var idRMB = 1;
	var list = getRMBExchangeInfo(idRMB);
	if (((typeof(aid) == "undefined") || (aid == "")) && ((typeof(sid) == "undefined") || (sid == ""))) {
		//所有账户
		getAllBalance();
		$("#dAIName").html(desc + "所有账户");
		if (myAllBalance == "-0.00") {
			myAllBalance = "0.00";
		}
		//alert("renderCurrentAccount="+myAllBalance);
		$("#dAIValue").html(myAllBalance);
		
		$(".dMainAccount").css("background", "url(images/mabg.png) repeat-x");
		$(".dMainAccount").css("color", "#105D91");
		$(".dSubAccountItemFirst").css("background", "url(images/sabg1.png) repeat-x");
		$(".dSubAccountItem").css("background", "#E8EFF3");
		$(".dSubAccountItemFirst").css("color", "#105D91");
		$(".dSubAccountItem").css("color", "#105D91");
		$("#dLeftHeader").css("background", "url(images/allbg_s.png) repeat scroll 0 0 transparent");
		$("#dLeftHeader").css("color", "white");
	} else if (aid != "") {
		//指定父账户
		$("#dLeftHeader").css("background", "none repeat scroll 0 0 #E9F1F7");
		$("#dLeftHeader").css("color", "#105D91");
		$(".dMainAccount").css("background", "url(images/mabg.png) repeat-x");
		$(".dMainAccount").css("color", "#105D91");
		$(".dSubAccountItemFirst").css("background", "url(images/sabg1.png) repeat-x");
		$(".dSubAccountItem").css("background", "#E8EFF3");
		$(".dSubAccountItemFirst").css("color", "#105D91");
		$(".dSubAccountItem").css("color", "#105D91");
		$("#" + aid).css("background", "url(images/mabg_s.png) repeat-x");
		$("#" + aid).css("color", "white");
		sql = "SELECT a.name AS aname, SUM((case tbcurrency_id ";
		$.each(list, function(i, n) {
			sql += " when " + n.id + " then balance/100*" + n.rate + " ";
		});
		sql += " end )) AS SumAmount FROM tbsubaccount b, tbaccount a WHERE a.mark = 0 and b.mark =0 and a.id=b.tbaccount_id AND a.id=" + aid;
		try {
			result = MoneyHubJSFuc("QuerySQL",sql);
		} catch (e) {
            logCatch(e.toString());
			result = [{
				"aname": "aaa",
				"SumAmount": 300
			}];
		}
		if (typeof result == 'string') {
			result = JSON.parse(result);
		}
		
		try{
			var list = getAccountKeyInfo(aid);
			if( !(list[0].key === undefined) && list[0].key!=""){
				 if(list[0].tid == 2 ) keyInfoMessage = "（已关联"+list[0].bankName+"卡号**** **** **** "+list[0].key+"）";
				 else if( list[0].tid == 4 ) keyInfoMessage ="（已关联"+list[0].bankName+"账号"+list[0].key+"）";
			}
		} catch(e){
            logCatch(e.toString());
		}
		
		$.each(result, function(i, n) {
			$("#dAIName").html(desc + replaceHtmlStr(n.aname) + keyInfoMessage);
			$("#dAIValue").html(n.SumAmount);
		});
	} else {
		//指定子账户
		$("#dLeftHeader").css("background", "none repeat scroll 0 0 #E9F1F7");
		$("#dLeftHeader").css("color", "#105D91");
		$(".dMainAccount").css("background", "url(images/mabg.png) repeat-x");
		$(".dMainAccount").css("color", "#105D91");
		$(".dSubAccountItemFirst").css("background", "url(images/sabg1.png) repeat-x");
		$(".dSubAccountItem").css("background", "#E8EFF3");
		$(".dSubAccountItemFirst").css("color", "#105D91");
		$(".dSubAccountItem").css("color", "#105D91");
		$("#sa" + sid).css("background", "url(images/sabg_s.png) repeat-x");
		$("#sa" + sid).css("color", "white");
		sql = "SELECT a.name AS aname, b.name AS bname, SUM((case tbcurrency_id ";
		$.each(list, function(i, n) {
			sql += " when " + n.id + " then balance/100*" + n.rate + " ";
		});
		sql += " end )) AS SumAmount FROM tbsubaccount b, tbaccount a WHERE a.mark = 0 AND b.mark = 0 AND a.id = b.tbaccount_id AND b.id=" + sid + " GROUP BY b.id";
		try {
			result = MoneyHubJSFuc("QuerySQL",sql);
		} catch (e) {
            logCatch(e.toString());
			result = [{
				"aname": "&amp;&amp;",
				"bname": "bbb",
				"SumAmount": 400
			}];
		}
		if (typeof result == 'string') {
			result = JSON.parse(result);
		}
		var list = getAccountKeyInfo(aid, sid);
		if (list.length > 0) {
			if ((!(list[0].key === undefined)) && (list[0].key != "")) {
				if (list[0].tid == 2)
					keyInfoMessage = "（已关联" + list[0].bankName + "卡号**** **** **** " + list[0].key + "）";
				else if (list[0].tid == 4)
					keyInfoMessage = "（已关联" + list[0].bankName + "账号" + list[0].key + "）";
			}
		}
		$.each(result, function(i, n) {
			$("#dAIName").html(desc+replaceHtmlStr(n.aname) + "：" + replaceHtmlStr(n.bname)+keyInfoMessage);
			$("#dAIValue").html(n.SumAmount);
		});
	}
}

/** 生成收付款方下拉框
 * @param id 被选中的收付款方
 */
function renderPayee() {
	var Rs = "";
	var list = getPayeeInfo();//取得支付对象；
	$.each(list, function(i, n) {
		Rs += "<option value='" + n.id + "'>" + n.Name.replace(/&/g, "&amp;") + "</option>";
	});
	Rs += "<option value='0' selected>(空)</option>";
	return Rs;
}

/** 生成分类下拉框内容
 * @param type 分类类型，1为收入，0为支出
 * @param id 已选中的分类编号
 */
function renderCategory(type) {
	var Rs = "";
	var list = getCategoryInfo();
	var class1 = "";
	var currentCate = "";
	$.each(list, function(i, n) {
		if (type == n.Type) {
			//当前的主分类名和现在的不一样，新开始
			if (n.name2 == "CATA420") {			
				Rs += "<option value='" + n.id2 + "' mhvalue='" + n.name1 + "' son='" + n.name2 + "'>" + n.name1 + "</option>";                                                                                                                                                                                                                                                                                                                          
			} else {
				Rs += "<option value='" + n.id2 + "' mhvalue='" + n.name1 + " : " + n.name2 + "'>" + n.name2 + "</option>";                                                                                                                                                                                                                                                                                                                          
			}
		}
	});
	if (type == 0) {
		//支出
		Rs += "<option value='10065'>(空)</option>";
	} else {
		//收入
		Rs += "<option value='10066'>(空)</option>";
	}
	return Rs;
}

/** 生成账户下拉框内容
 * @param id 子账户分类id
 * @param aid 父账户分类id
 */
function renderAccount(id, aid) {
	var Rs = "";
	$.each(listAccount, function(i, n) {
		if (aid === undefined) {
			//未指定主账户
			if ((n.tid == 2) || (n.tid == 3)) {
				//有子账户的情况
				Rs += "<option value='" + n.bid + "'";
				if (id == n.bid) {
					 Rs += " selected ";	
				}
				Rs += ">" + n.aname.replace(/&/g, "&amp;") + "：" + n.bname.replace(/&/g, "&amp;") + "</option>";
			} else {
				//没有子账户的情况
				Rs += "<option value='" + n.bid + "'";
				if (id == n.bid) {
					 Rs += " selected ";	
				}
				Rs += ">" + n.aname.replace(/&/g, "&amp;") + "</option>";
			}
		} else {
			//指定主账户
			if (aid == n.aid) {
				if ((n.tid == 2) || (n.tid == 3)) {
					//有子账户的情况
					Rs += "<option value='" + n.bid + "'";
					if (id == n.bid){
						 Rs += " selected ";	
					}
					Rs += ">" + n.aname.replace(/&/g, "&amp;") + "：" + n.bname.replace(/&/g, "&amp;") + "</option>";
				} else {
					//没有子账户的情况
					Rs += "<option value='" + n.bid + "'";
					if (id == n.bid) {
						 Rs += " selected ";	
					}
					Rs += ">" + n.aname.replace(/&/g, "&amp;") + "</option>";
				}
			}
		}
	});	
	return Rs;
}

/** 记账功能
 * @param divName 区分是收入还是支出
 */
function addList(divName) {
	if (divName == "#addOut") {
		currentBillType = 0;
	} else {
		currentBillType = 1;
	}
	var transactionClasses = 0;

	//数据截取
	var tbSubAccount_id = $(divName + " input[name='sAccount']").val();
	var amount = $(divName + " input[name='iAmount']").val();
	var transdate = $(divName + " .sdate").val();

	var tbCategory2_id = $(divName + " input[name='sCategory']").val();
	var payee_id = $(divName + " input[name='sPayee']").val();
	if (divName == "#addBalance") {
		tbCategory2_id = "10067";
		payee_id = "0";
	}

	var comment = $(divName + " textarea[name='comment']").val();
	var exchangerate = "";
	var direction = "";
	var tbSubAccount_id1 = "";
	//记账添加执行
	var tempListId = addTransaction(transdate, payee_id, tbCategory2_id, amount, direction, tbSubAccount_id, exchangerate, comment, tbSubAccount_id1, transactionClasses);
	var modify = modifySubAccountBalance(tbSubAccount_id);
	endTrans(transdate, tempListId);
}

/** 编辑交易
 * @param divName 区分是收入还是支出
 */ 
function editList(divName) {
	var id = $(divName + " input[name='transId1']").val()
	//数据截取
	var tbSubAccount_id = $(divName + " input[name='sAccount']").val();
	var amount = $(divName + " input[name='iAmount']").val();
	var transdate = $(divName + " .sdate").val();
	if (divName == "#addBalance") {
		tbCategory2_id = 10067;
		payee_id = 0;
	} else {
		tbCategory2_id = $(divName + " input[name='sCategory']").val();
		payee_id = $(divName + " input[name='sPayee']").val();
	}

	var comment = $(divName + " textarea[name='comment']").val();
	var exchangerate = "";
	var direction = "";
	if (tbCategory2_id == 10000) {
		//支出
		tbCategory2_id = 10065;
	} else if (tbCategory2_id == 10001) {
		tbCategory2_id = 10066;
	}
	var tempListId = editTrans(transdate, payee_id, tbCategory2_id, amount, direction, exchangerate, comment, id);
	var modify = modifySubAccountBalance(tbSubAccount_id);
	endTrans(transdate, id);
}

/** 删除交易
 * @param divName 区分是收入还是支出
 */
function deleteList(divName) {
	if(divName=="#dRTrans"){
		//转账处理
		var transId1= $("#dRTrans input[name='transId1']").attr("value");
		var transId2= $("#dRTrans input[name='transId2']").attr("value");
		var sAccount = $("#dRTrans input[name='sAccount']").attr("value");
		var sAccount2 = $("#dRTrans input[name='sAccount2']").attr("value");
		//删除两条交易记录
		MoneyHubJSFuc("ExecuteSQL","UPDATE tbTransaction SET mark = 1, UT = " + getUT() + " WHERE id = " + transId1);//new
		MoneyHubJSFuc("ExecuteSQL","UPDATE tbTransaction SET mark = 1, UT = " + getUT() + " WHERE id = " + transId2);
		//调整余额
		modifySubAccountBalance(sAccount);
		modifySubAccountBalance(sAccount2);
	} else {
		//收入支出处理
		var id = $(divName + " input[name='transId1']").val()
	//数据截取
		var tbSubAccount_id = $(divName + " input[name='sAccount']").val();
	
		try {
			MoneyHubJSFuc("ExecuteSQL","UPDATE tbTransaction SET mark = 1, UT = " + getUT() + " WHERE id = " + id);//new
		} catch (e) {
            logCatch(e.toString());
		}
	
		var modify = modifySubAccountBalance(tbSubAccount_id);	
	}
	endTrans();
}

/** 点击某交易后的响应事件
 * @param event 点击事件
 */
function clickTransaction(event) {
	editTransaction(event);
}

/** 生成右侧下方账本区
 * @param aid 主账户编号
 * @param sid 子账户编号
 * @param transId 交易编号 
 * @param isDuration；未定义则为添加时间条件，有值则为按时间条件筛选
 */
function renderTransView(aid, sid, transId, isDuration) {
	//移除批量的checkbox样式
	if($("#dBatchEditAllSelect").hasClass('sCheckBox2')) {
		$("#dBatchEditAllSelect").removeClass('sCheckBox2');
		$("#dBatchEditAllSelect").attr('value',0);
	}
	var list = "";
	var BankId = 0;
	var AccountType = 0;
	var AccountId = 0;
	var KeyInfo = "";
	if (transId == undefined) transId = 0;
	if (!(aid === undefined) && aid != "") {
		//选定了主账户
		currentAid = aid;
		AccountId = $("#" + aid).attr("aid");
		KeyInfo = $("#" + aid).attr("keyinfo");
		BankId = $("#" + aid).attr("bankid");
		AccountType = $("#" + aid).attr("tid");
		renderCurrentAccount(aid, "");
		if (isDuration === undefined) {
			list = getTransaction(aid);
		} else {
			list = getTransaction(aid, "", isDuration);
		}
	} else if (!(sid === undefined) && sid != "") {
		//选定了子账户
		currentSid = sid;
		AccountId = $("#sa" + sid).attr("aid");
		KeyInfo = $("#sa" + sid).attr("keyinfo");
		BankId = $("#sa" + sid).attr("bankid");
		AccountType = $("#sa" + sid).attr("tid");
		renderCurrentAccount("", sid);
		if (isDuration === undefined) {
			list = getTransaction("", sid);
		} else {
			list = getTransaction("", sid, isDuration);
		}
	} else {
		//选定了所有账户
		renderCurrentAccount("", "");
		if (isDuration === undefined) {
			list = getTransaction();
		} else {
			list = getTransaction("", "", isDuration);
		}
	}
	$("#dRBImport").hide();
	if (AccountType == 0) {
		//如果选择的是所有账户
		$("#dRBImport").attr("bankid", "0");
		$("#dRBImport").show();
	}
	if (AccountType == 2) {
		//目前只支持信用卡账单的导入
		//添加了中行
		if ((BankId == "a003") || (BankId == "a004") || (BankId == "a006") || (BankId == "a007") || (BankId == "a001")) {
		//if ((BankId == "a003") || (BankId == "a004") || (BankId == "a006") || (BankId == "a007")) {
			//而且只有这四家银行的可以导
			$("#dRBImport").attr("bankid", BankId);
			$("#dRBImport").attr("accounttype", AccountType);
			$("#dRBImport").attr("aid", AccountId);
			$("#dRBImport").attr("keyinfo", KeyInfo);
			$("#dRBImport").show();
		}
	}
	if (AccountType == 4) {
		//目前也支持支付账户账单的导入
		if (BankId == "e001") {
			//但只支持支付宝
			$("#dRBImport").attr("bankid", BankId);
			$("#dRBImport").attr("accounttype", AccountType);
			$("#dRBImport").attr("aid", AccountId);
			$("#dRBImport").attr("keyinfo", KeyInfo);
			$("#dRBImport").show();
		}
	}
	var class1 = "tDetail1";
	var class2 = "tDetail2";
	var currentClass = "";
	var modifyType = "";
	var content = "";
	var currentTransDataId = [];
	
	if (list) {
		//下面这段会造成严重的性能问题，建议优化
		/*
		 * modified by liuchang
		 * 将getTransaction方法增加了返回内容，移除了each循环中的数据库操作
		 */ 
		
		$.each(list, function(i, n) {
			//将id置入数组中
			var temp = new Array();
			temp.push(n.aid); 
			temp.push(0);
			temp.push(0);
			currentTransDataId.push(temp);
			//表格背景色交替显示
			if (currentClass == class1)
				currentClass = class2;
			else
				currentClass = class1;
			if (n.direction != "")
				modifyType = 2;
			else
				modifyType = n.Type;
			//获得账户名
			var saName = "";
			if ((n.tid != 2) && (n.tid != 3))
				saName = replaceHtmlStr(n.aname);
			else
				saName = replaceHtmlStr(n.aname) + "：" + replaceHtmlStr(n.dname);
			
			//如果是系统导入的账，则要求字体颜色不同
			systemClass = "";
			if (n.transactionClasses == 1) systemClass = " tDetail3";
			//生成内容
			content += '<tr mhcontent="true" class="' + currentClass + systemClass + '" id="trans' + n.aid + '" type="' + n.Type + '" transdate="' + n.TransDate + '" amount="' + n.Amount
				+ '" category="' + n.tbCategory2_id + '" payeeid="' + n.tbPayee_id + '" saccount="' + n.tbSubAccount_id + '" saccount1="' + n.tbSubAccount_id1 + '" direction="' + n.direction
				+ '" satext="' + saName + '" comment="' + n.acomment + '" currency="' + n.fname + '">';
			content += '<td><nobr><span id="check_'+n.aid+'" class="CheckBox" style="display:none">&nbsp;</span>' + n.TransDate + '</nobr></td>';
			//以下为分类判断
			if (n.cname == "未定义收入" || n.cname == "未定义支出") {
				content += '<td></td>';
			} else {
				if (n.bname == "CATA420") {
					//选择的是主分类
					content += '<td><nobr>' + n.cname + '</nobr></td>';
				} else {
					content += '<td><nobr>' + n.cname + ":" + n.bname + '</nobr></td>';	
				}	
			}
			
			if (n.Type == 0) {
				if (n.tbCategory2_id == 10067) {
					//调整余额
					content += '<td>&nbsp;</td>';
					content += '<td>&nbsp;</td>';
				} else {
					//支出
					content += '<td>&nbsp;</td>';
					content += '<td><nobr>' + n.Amount + '</nobr></td>';
				}
			} else {
				//收入
				content += '<td><nobr>' + n.Amount + '</nobr></td>';
				content += '<td>&nbsp;</td>';
			}
			content += '<td><nobr>' + saName + '</nobr></td>';
			if (!(n.payeeName === undefined) && n.payeeName != "")
				content += '<td><nobr>' + replaceHtmlStr(n.payeeName) + '</nobr></td>';

			else
				content += '<td></td>';
			if (n.tbCategory2_id == 10067) {
				//调整余额
				content += '<td><nobr>余额调整至：' + n.Amount + '。' + replaceHtmlStr(n.acomment) + '</nobr></td>';
			} else {
				content += '<td><nobr>' + replaceHtmlStr(n.acomment) + '</nobr></td>';
			}

			content += '</tr>';
		});
	}
	if (list.length > -1) {
		$("#dRightTableTrans").empty();
	    TransRenderFinished = false;

	    //showWait("tshow");
		intTransRender = setInterval(checkTransRender, 10);
		htmlContent = content;
		setTimeout("showContent(" + transId + ")", 5);
	} else {
		$("#dRightTableTrans").html(content);
		$("#dRightTableTrans").append(generateEmptyLines("#dRightTableTrans", 7, "$(\"#dRBOut\").click()"));
		setTransTDWidth();
	}
}

var htmlContent;
var intTransRender;
var TranRenderFinished;

/** 延时调用显示内容
 * @param id 需要高亮显示的交易号
 */ 
function showContent(id) {
	$("#dRightTableTrans").html(htmlContent);
	$("#dRightTableTrans tr").unbind().click(function (event) {
		clickTransaction(event);
	});
	if (id != 0) {
		$("#dRightTableTrans tr").removeClass("transSelected");
		$("#trans" + id).addClass("transSelected");
	}

	$("#dRightTableTrans").append(generateEmptyLines("#dRightTableTrans", 7, "$(\"#dRBOut\").click()"));
	setTransTDWidth();
	//根据3.1需求修改，batchIsView 
	if(batchIsView) lotIconView( "show" );
	TransRenderFinished = true;
}

function checkTransRender() {
	if (TransRenderFinished) {
    	showWait("thide");
		
		clearInterval(intTransRender);
	}
}

/** 生成空白行
 * @param tableId 表格名称
 * @param tdCount 列数
 * @return 生成的HTML代码
 */   
function generateEmptyLines(tableId, tdCount, clickEvent) {
	ELHTML = "";
	tableElement = $(tableId);
	$(tableId + " tr[mhcontent!='true']").remove();
	contentRows = $(tableId + " tr[mhcontent='true']").length;

	totalRows = (tableElement.closest("#dRRDetail").height() - 22) / 30;
	emptyRows = totalRows - contentRows;
	
	if (emptyRows > 0) {
		//需要显示空行
		if (contentRows % 2 == 0) currentClass = "tDetail1";
		else currentClass = "tDetail2";
	
		for (i=0; i<emptyRows; i++) {
			ELHTML += "<tr class='" + currentClass + "' onclick='" + clickEvent + "'>";
			for (j=0; j<tdCount; j++) {
				ELHTML += "<td>&nbsp;</td>";
			}
			ELHTML += "</tr>";
			if(currentClass == "tDetail1")
				currentClass = "tDetail2";
			else
				currentClass = "tDetail1";
		}
	}
	return ELHTML;
}

//计算当前所有账户总值
function getAllBalance() {
	try {
		var idRMB = 1;
		var list = getRMBExchangeInfo(idRMB);
		var sql1 = " select sum(balance) as allBalance from (select b.tbcurrency_id , (case b.tbcurrency_id ";
		$.each(list, function(i, n) {
			sql1 += " when " + n.id + " then sum(balance)/100*" + n.rate + " ";
		});
		sql1 += " end ) as balance from tbAccount a, tbsubAccount b where a.mark = 0 and b.mark = 0 and a.id = b.tbaccount_id group by b.tbcurrency_id) t"
		//debug("getAllBalance="+sql1+"\n");
		var result;
		try {
			result = MoneyHubJSFuc("QuerySQL",sql1);
		} catch (e) {
            logCatch(e.toString());
			result = {
				"allBalance": 134.00
			};
		}
		if (typeof result == 'string') {
			//修改了bug3320，在无账户时会抛出exception
			if(result.length>4){
				result = JSON.parse(result);
				$.each(result, function(i, n) {
					myAllBalance = n.allBalance;
				});
			} else {
				myAllBalance = "0.00";
			}
		}
	} catch(e) {
        logCatch(e.toString());
	}
}

/**抓取账单响应事件
 * @param id：账户id，以此id为依据，根据账单币种，更新到相应的子账户中。
 * @param bankId 银行编号 
 */
function getCreditCardList(id, bankId) {
	//根据当前日期渲染生成的月份
	currentBankId = bankId;
	currentAid = id;
	getCreditAccount=id;
	showAdd("getCreditCardBillList");
}

/** 导账单确定事件
 * @param BankId 银行编号
 */
function submitCreditCardBillList(BankId) {
	cancelAdd("chooseBank");
	try {
		MoneyHubJSFuc("creditCardBillList",temp, 2, $("#selectMonth").val(), BankId);
		currentBankId = "";
	} catch (e) {
            logCatch(e.toString());
		//测试合并账目对话框
		showAdd("autoMerge");
		//测试删除手工账对话框
		//showAdd("deleteManu");
	}
}

/** 关闭电子账单,账单事件的回调函数
 */
function closeBillList() {
	renderTransView(currentAid, "");
}

/** 生成之前的12个月
 */
function createBillMonth() {
	var content = "";
	var d = new Date();
	var curMonth = "";
	for (var i=0; i<11; i++) {
		//today清空
		d.setMonth(d.getMonth() - 1);
		if((d.getMonth() + 1 + "").length == 1)
			curMonth = "0" + (d.getMonth() + 1);
		else {
			curMonth = (d.getMonth() + 1);
		}
		content += "<option value='" + d.getFullYear() + curMonth + "'>" + d.getFullYear() + "年" + (d.getMonth() + 1) + "月</option>";
	}	
	$("#selectMonth").html(content);
}

/** 测试用户数据
 */
function initCurrentDay() {
	var cDate = new date();
	$("#").attr("value", cDate.getFullYear() + "-" + (cDate.getMonth() + 1) + "-" + cDate.getDay());
}

/** 获取子账户币种
 * @param id 子账户编号
 * @return 币种编号 
 */
function getSubAccountCurrencyId(id) {
	try {
		result = MoneyHubJSFuc("QuerySQL","SELECT tbcurrency_id AS cid FROM tbsubaccount WHERE id=" + id);
		result = JSON.parse(result);
	} catch (e) {
            logCatch(e.toString());
		if (id == 1) {
			result = [{
				"cid": 2
			}];
		} else {
			result = [{
				"cid": 3
			}];
		}
	}
	$.each(result, function(i, n) {
		result = n.cid;
	});
	return result;
}

/** 处理转账时的联动事件
 */
function getIamount2Status() {
	var iAmount = $("#iAmount").val();
	var imount2Value = 0;

	var sAccount = $("#dRTrans input[name='sAccount']").val();
	var sAccount2 = $("#dRTrans input[name='sAccount2']").val();
	var test1 = getSubAccountCurrencyId(sAccount);
	var test2 = getSubAccountCurrencyId(sAccount2);
	if ((sAccount != "") && (sAccount2 != "") && (sAccount != sAccount2) && (test1 != test2)) {
		//两个账户币种不同
		var iAmount2 = getMyValue(test1, test2, iAmount);
		$("#iAmount2Area").show();
		$("#iAmount2").attr("value", iAmount2);
		
		if (test1 == 1) {
			//账户1为人民币
			$("#iAmount2Content").html("(100" + getCurrencyDesc(test2) + "约折合" + getRMBExchangeInfo1(test2) + getCurrencyDesc(test1) + ")");
		} else {
			if (test2 == 1) {
				//账户2为人民币
				$("#iAmount2Content").html("(100" + getCurrencyDesc(test1) + "约折合" + getRMBExchangeInfo1(test1) + getCurrencyDesc(test2) + ")");
			} else {
				$("#iAmount2Content").html("(100" + getCurrencyDesc(test1) + "约折合" + getRMBExchangeInfo1(test1, test2) + getCurrencyDesc(test2) + ")");
			}
		}
	} else {
		$("#iAmount2Area").hide();
		$("#iAmount2").val(iAmount);
	}
}

/** 获取币种转换结果
 * @param cid1 币种1
 * @param cid2 币种2
 * @param value1 币种1金额
 * @return 币种2的金额 
 */
function getMyValue(cid1, cid2, value1) {
	var result = "";
	if (cid1 == 1 || cid2 == 1) {
		//判断是不是人民币账户转其他账户
		if(cid1 == 1) {
			//人民币转外币
			result = Math.round(value1 * 10000 / getRMBExchangeInfo1(cid2)) / 100;
		} else {
			//外币转人民币
			result = Math.round(value1 * getRMBExchangeInfo1(cid1)) / 100;
		}
	} else {
		//外币之间的转换
		result = Math.round(value1 * getRMBExchangeInfo1(cid1, cid2)) / 100;
	}
	return result;
}

/** 计算出当前的汇率
 * @param value1 币种1的金额
 * @param value2 币种2的金额 
 */
function getMyExchange(value1, value2) {
	return Math.round(value2 * 10000 / value1) / 100;
}

/** 添加转账交易记录
 */
function addTransList() {
	if(!submitStatus) {
		//将提交状态锁定
		submitStatus=true;
		var sAccount = "";
		if(getCurrentAccountStatus()){
			//一个子账户
			sAccount=$("#dRTrans input[name='sAccount']").attr("value");
		}else{
			//多个子账户
			sAccount=$("#dRTrans input[name='sAccount']").val();
		}
		var sAccount2 = $("#dRTrans input[name='sAccount2']").val();
		var iAmount = $("#dRTrans input[name='iAmount']").attr("value");
		var iAmount2 = $("#dRTrans input[name='iAmount2']").attr("value");
		var sDate = $("#dRTrans .sdate").attr("value");
		var comment = $("#dRTrans textarea[name='comment']").attr("value");

		//转出
		var cateOut = 10059;
		//转入
		var cateIn = 10060;
		//修改bug2994,添加transactionClasses
		var transactionClasses = 0;
		
		var directionIn = addTransaction(sDate, '0', cateOut, iAmount, '', sAccount, '', comment, sAccount2,transactionClasses);
		var directionOut = addTransaction(sDate, '0', cateIn, iAmount2, directionIn, sAccount2, '', comment, sAccount,transactionClasses);
		//alert(directionIn+"::::"+directionOut);
		MoneyHubJSFuc("ExecuteSQL","update tbTransaction set direction = " + directionOut + ", UT = " + getUT() + " where id = " + directionIn);
		//debug("update tbTransaction set direction = " + directionOut + "  where id = " + directionIn+"\n");
		//更新两子账户余额
		//调整余额
		modifySubAccountBalance(sAccount);
		modifySubAccountBalance(sAccount2);
		//将提交状态解锁
		submitStatus=false;
		endTrans(sDate, directionIn);
	} else {
	}
}

/** 编辑转账交易记录
 */
function editTransList() {
	try {
		if(!submitStatus) {
			//将提交状态锁定
			submitStatus=true;
			var transId1 = $("#dRTrans input[name='transId1']").attr("value");
			var transId2 = $("#dRTrans input[name='transId2']").attr("value");
			var sAccount = $("#dRTrans input[name='sAccount']").attr("value");
			var sAccount2 = $("#dRTrans input[name='sAccount2']").attr("value");
			var iAmount = $("#dRTrans input[name='iAmount']").attr("value");
			var iAmount2 = $("#dRTrans input[name='iAmount2']").attr("value");
			var sDate = $("#dRTrans .sdate").attr("value");
			var comment = $("#dRTrans textarea[name='comment']").attr("value");
			
			result1 = JSON.parse(MoneyHubJSFuc("QuerySQL","SELECT id, transdate, amount, transactionclasses FROM tbtransaction WHERE mark = 0 and id IN (" + transId1 + ", " + transId2 + ")"));//new
			transactionclasses = result1[0].transactionClasses;
			if (result1[0].transactionClasses == 1) {
				//如果原来是系统账，改动金额和日期后变为手工账
				if (result1[0].id == transId1) {
					if ((result1[0].TransDate != sDate) || (parseFloat(result1[0].Amount) != parseFloat(iAmount)) || (result1[1].TransDate != sDate) || (parseFloat(result1[1].Amount) != parseFloat(iAmount2))) transactionclasses = 0;
				} else {
					if ((result1[1].TransDate != sDate) || (parseFloat(result1[1].Amount) != parseFloat(iAmount)) || (result1[0].TransDate != sDate) || (parseFloat(result1[0].Amount) != parseFloat(iAmount2))) transactionclasses = 0;
				}
			}
			//更新交易记录
			comment = replaceSQLStr(comment);
			MoneyHubJSFuc("ExecuteSQL","UPDATE tbTransaction SET transdate='" + sDate + "', amount=" + iAmount + ", comment='" + comment + "', transactionclasses = " + transactionclasses + ", UT = " + getUT() + " WHERE id=" + transId1);//new			
			MoneyHubJSFuc("ExecuteSQL","UPDATE tbTransaction SET transdate='" + sDate + "', amount=" + iAmount2 + ", comment='" + comment + "', transactionclasses = " + transactionclasses + ", UT = " + getUT() + " WHERE id=" + transId2);//new
			//调整余额
			modifySubAccountBalance(sAccount);
			modifySubAccountBalance(sAccount2);
			submitStatus = false;
			endTrans(sDate, transId1);
		} else {
		}
	} catch(e) {
            logCatch(e.toString());
	}
}

/** 数据校验事件
 * @param divId 图层号
 * @return 1表示校验成功，0表示校验失败 
 */
function myFormValidate(divId) {
	var validator = "";
	var valResult = 0;

	//建立验证
	validator = $(divId).validate({
		errorPlacement: function(error, element) {
			element.parents(".dRDRField").children(".dValidation").html(error);
		},
		onkeyup: false,
		onfocusout: false,
		focusCleanup: true
	});
	
	//取数字的前两位小数点
	$(divId + " .iMoney").each(function() {
		var numberBeforePoint = 0;
		if ($(this).val().indexOf(".") != -1) {
			numberBeforePoint = $(this).val().substring(0, $(this).val().indexOf("."));
			$(this).val(numberBeforePoint + "." + $(this).val().substr($(this).val().indexOf(".") + 1, 2));
		} else {
			numberBeforePoint = $(this).val();
		}
		if (numberBeforePoint.length <= 14) {
			if (!isNaN($(this).val() * 100)) {
				$(this).val(formatnumber(parseFloat($(this).val()), 2));
			}
		}
	});

	//执行验证	
	switch (divId) {
		case "#billForm":
			if (validator.form()) {
				submitCreditCardBillList();
				curNewPayeeId=-1;
			}
			break;
			
		case "#addTrans":
			if (validator.form()) {
				if ($(divId + " input[name='sAccount']").val() == $(divId + " input[name='sAccount2']").val()) {
					alert("转出账户和转入账户不能是同一个账户");
				} else {
					valResult = 1;
				}
			}
			break;
			
		default:
			if (validator.form()) {
				valResult = 1;
			}
			break;
	}
	return valResult;
}

/*
 * 根据不同的状态修改添加交易的标题信息
 * param1 editType add，添加
 */
function changeTransTitle(editType,type){
	var statusDesc="";
	if(editType == "add" ){
		//添加状态
		 //1,收入；0，支出；2，转账；
		 if( type == 1 ){
			$('#dRightDetail #dRDContent #dRDetailTop').html("新建收入"); 	
		 } else if( type == 2 ){
		 	$('#dRightDetail #dRDContent #dRDetailTop').html("新建转账");
		 } else {
		 	$('#dRightDetail #dRDContent #dRDetailTop').html("新建支出");
		 }
	} else{
		//编辑状态
		 if( type == 1 ){
			$('#dRightDetail #dRDContent #dRDetailTop').html("编辑收入"); 	
		 } else if( type == 2 ){
		 	$('#dRightDetail #dRDContent #dRDetailTop').html("编辑转账");
		 } else {
		 	$('#dRightDetail #dRDContent #dRDetailTop').html("编辑支出");
		 }
	}
}


/** 记账编辑功能结束后的渲染
 * @param transDate 交易日期
 * @param aid 交易编号 
 */
function endTrans(transDate, aid) {
	if (transDate != undefined) {
		yearDetailSelected(transDate.substr(0, 4));	
		monthSelect(transDate.substr(5, 2), aid);
	} else {
		//数据渲染
		renderTransView(currentAid, currentSid);	
	}	
}

/** 获取当前的子账户数目
 *  1个子账户，返回true，多余1个，返回false； 
 */
function getCurrentAccountStatus(){
	var Rs = -1;
	if ((currentSid != "") && (currentSid > 0)) {
		return true;
	} else if ((currentAid != "") && (currentAid > 0)) {
		try {
			var result = JSON.parse(MoneyHubJSFuc("QuerySQL","SELECT count(id) as myCount FROM tbSubAccount WHERE mark = 0 and tbAccount_id = " + currentAid));//new
		} catch (e) {
            logCatch(e.toString());
			result = [{
				"myCount": 1
			}];
		} 
	    $.each(result, function(i, n) {
	      	Rs = n.myCount;
	    }); 
	    if (Rs > 1) return false;
	    else return true;	
	}
}

/** 入库前的字符串处理
 */
function replaceSQLStr(str){
	//sql保留字替换
	return str=str.replace(/\'/g, "\'\'");
}

/** 显示html时先替换”&“
 */
function replaceHtmlStr(str) {
	//sql保留字替换
	return str.replace(/&/g, "&amp");
}

/** 处理年份选择事件
 * @param classes 向前还是向后
 */
function yearSelected(classes) {
	if (classes == "prev") {
		nowYear = Number(today[0]) - 1;
	} else {
		nowYear = Number(today[0]) + 1;
	}
	yearDetailSelected(nowYear);
	//重新渲染交易记录
	renderTransView(currentAid, currentSid);
}

/** 指定具体年
 * @param nowYear 具体年份
 */
function yearDetailSelected(nowYear) {
	today.splice(0, 1, nowYear);
	$("#myYear").html(today[0] + "年");
	renderTransView(currentAid, currentSid);
}

/** 生成显示月份显示区域
 */
function createMonthView(){
	var myHtml = '';
	myHtml += '<table id="dRDCTable"><tr>';
	for (i=1; i<13; i++) {
		var cMonth = "";
		if (i < 10) cMonth = "0" + i;
		else cMonth = i + "";
		if (cMonth == today[1]) {
			myHtml += "<td onclick='monthSelect(\"" + cMonth + "\")'><span id='" + cMonth+"' class=\"now\">" + i + "月</span></td>";	
		} else {
			myHtml += "<td onclick='monthSelect(\"" + cMonth + "\")'><span id='" + cMonth+"'>" + i + "月</span></td>";
		}
	}
	myHtml += '</tr></table>';
	$("#dRDCenter").html(myHtml);
}

/** 处理月份选择事件
 * @param month 选定的月份
 * @param aid 交易编号 
 */
function monthSelect(month, aid) {
	if (today[1] != month) {
		//将时间参数置为 “”；
		isDuration = "";
		//显示样式
		if (today[1] != "")
		  $('#' + today[1]).removeClass("now");
		$('#' + month).addClass("now");
		//更新当前数组
		today.splice(1, 1, month);
		//数据渲染
		if (aid == undefined) {
			renderTransView(currentAid, currentSid);
		} else {
			renderTransView(currentAid, currentSid, aid);
		}	
	}
}

/** 显示所有日期的数据
 */
function viewAll() {
	//移除显示月份
	if(today[1] != "")  $('#'+today[1]).removeClass("now");
	today.splice(1, 1, "");
	isDuration = "temp";
	//移除批量的checkbox样式
	if($("#dBatchEditAllSelect").hasClass('sCheckBox2')) {
		$("#dBatchEditAllSelect").removeClass('sCheckBox2');
		$("#dBatchEditAllSelect").attr('value',0);
	}
	renderTransView(currentAid, currentSid, 0, isDuration);

} 

function checkToggle(id){
	$('#'+id).toggleClass('CheckBox2');
}

/** 处理排序样式问题
 * @param myId
 */ 
function getConStyle(myId){
	if(myId == conditionSelected[0] ){
		//没换排序内容，更新升降序
		//更新显示样式
		//更新升降序
		if(conditionSelected[1] == 0 ){
			$("#"+conditionSelected[0]).removeClass();
			$("#"+conditionSelected[0]).addClass("tree1");
			conditionSelected.splice(1,1,1);
		} 
		else{
			$("#"+conditionSelected[0]).removeClass();
			$("#"+conditionSelected[0]).addClass("tree2");
			conditionSelected.splice(1,1,0);
		}
	} else {
		//更换排序内容
		//隐藏原来的
		if (myId != 'con1') $("#con1").hide();
		$("#"+conditionSelected[0]).hide();
		//显示新的
		conditionSelected.splice(0,1,myId);
		$("#"+conditionSelected[0]).show();
		if(!$("#"+conditionSelected[0]).hasClass("tree2")){
			$("#"+conditionSelected[0]).toggleClass("tree2");
			//更新排序,直接更新为升序，默认
			conditionSelected.splice(1,1,0);
		}		
	}
	if (isDuration.length>0) {
		//如果没限制时间问题
		renderTransView(currentAid, currentSid, 0, isDuration);
	} else {
		//限制了时间问题
		renderTransView(currentAid, currentSid);
	}
}

/** 处理批量编辑显示check按钮事件
 * @param status show为显示，hide为不显示
 */
function lotIconView(status){
	if(status == "show"){
		$("span[id^='check_']").show();
		$("span[id^='check_']").each(function(index) {
		  	$(this).unbind().bind("click", function() {
	  			if($(this).hasClass('CheckBox2')){
	  				//取消状态，三态未做，简单实现
	  				if($("#dBatchEditAllSelect").attr("value")==1){
	  					$("#dBatchEditAllSelect").attr("value",0);
	  					$("#dBatchEditAllSelect").toggleClass("sCheckBox2");
	  				}
	  				$(this).removeClass().addClass('CheckBox');
	  			} else {
	  				$(this).removeClass().addClass('CheckBox2');
	  			} 
	  			return false;
	 		});
		});
	} else {
		$("span[id^='check_']").hide();
	}	
}

function lotIconViewAutoMerge(){
	$("#autoMerge span[id^='autoMergeCheck_']").each(function(index) {
	  	$(this).unbind().bind("click", function() {
  			if($(this).hasClass('sCheckBox2')){
  				$(this).removeClass().addClass('sCheckBox');
  			} else {
  				$(this).removeClass().addClass('sCheckBox2');
  			}
  			return false;
 		});
	});
}

function allSelect(status){
	if(status === undefined){
		//普通状态
		if($("#dBatchEditAllSelect").attr("value")==0){
			$("span[id^='check_']").removeClass().addClass('CheckBox2');
			$("#dBatchEditAllSelect").attr("value",1);
			//改为显示状态
		} else {
			//改为不显示状态
			$("#dBatchEditAllSelect").attr("value",0);
			$("span[id^='check_']").removeClass().addClass('CheckBox');	
		}
	} else {
		//取消时的清除状态
		if($("#dBatchEditAllSelect").attr("value")==1){
			$("#dBatchEditAllSelect").toggleClass("sCheckBox2");
			$("#dBatchEditAllSelect").attr("value",0);
			//改为显示状态
		}
		$("span[id^='check_']").removeClass().addClass('CheckBox');
	}
}

function allSelectAutoMerge() {
	$("#dAMSelectAll span").toggleClass('sCheckBox2');
	if($("#dAMSelectAll span").hasClass("sCheckBox2")){
		//未选中
		$("span[id^='autoMergeCheck_']").each(function(index) {
		  	$(this).removeClass().addClass('sCheckBox2');
		});
		$("#dAMSelectAll").attr("value",1);
		//改为显示状态
	} else {
		//选中
		//改为不显示状态
		$("span[id^='autoMergeCheck_']").each(function(index) {
		  	$(this).removeClass().addClass('sCheckBox');
		});
		$("#dAMSelectAll").attr("value",0);
	}
}

/*
 * 批量修改方法
 */
function lotTransEdit(category2,payee){
	var cc = currentTransDataId.length;
	var temp = [];
	var tempCg = [];
	var param1 = "";
	var param2 = "";
	for(var i=0;i<cc;i++){
		//判断是否被选中  =1 被选中
		if(currentTransDataId[i][2]==1) temp.push(currentTransDataId[i][0]);
	}
	if( temp.length>0 ){
		//被选择的数据是不为空
		if(category2!=""&&category2!=0){
			//执行更新操作
			param1 = category2
		}
		if(payee != "" && payee != 0 ) param2 = payee;
		multipleEditTransAction(temp,param1,param2);
	}
}

/** 生成批量下载的数据
 */
function createLotTransSelectConditions(){
	try{
		$("#lotCategory2").append(renderNoTypeCategory());
		$("#lotCategory2").attr("value", "-1");
		$("#lotPayee").append(renderPayee());
		$("#lotPayee").attr("value", "-1");
	} catch(e){
            logCatch(e.toString());
	}
}

/** 批量修改按钮提交
 */
function submitBatch() {
	if (($("#lotCategory2").val() != -1) || ($("#lotPayee").val() != -1)) {
		$("span[id^='check_']").each(function(i) {
		  	if ($(this).hasClass('CheckBox2')) {
		  		var tId = $(this).attr("id").substring(6,$(this).attr("id").length);
		  		transArray.push(tId);
		  	} 
		});
		if (transArray != "") {
			multipleEditTransAction(transArray,$("#lotCategory2").val(), $("#lotPayee").val());
			//渲染下账户
			renderTransView(currentAid, currentSid);
			//清空数据
			transArray = [];
			//清空选项处理
			allSelect("empty");
			//指定默认值
			selectOption("#dBatchEdit", "lotPayee", "-1")
			selectOption("#dBatchEdit", "lotCategory2", "-1");
		} else {
			alert("您未选中任何记录！");
		}
	} else {
		alert("您未选中任何条件！");
	}
}

/** 批量删除按钮提交
 */
function submitBatchDelete() {
	//获取事件
	$("span[id^='check_']").each(function(i) {
	  	if($(this).hasClass('CheckBox2')){
	  		var tId =  $(this).attr("id").substring(6,$(this).attr("id").length);
	  		transArray.push(tId);
	  	} 
	});
	var tLength = transArray.length;
	if (tLength == 0) {
		alert("您未选中任何记录！");
	} else {
		//通知设置页余额有变动
		try {
			MoneyHubJSFuc("SetParameter","BalanceChanged", "1"); //余额有变动时通知管理页
			MoneyHubJSFuc("SetParameter","BalanceChangedR", "1");   //余额有变动时通知统计报表页
			MoneyHubJSFuc("SetParameter","BalanceChangedS", "1");   //余额有变动时通知提示频道
		} catch (e) {
            logCatch(e.toString());
		}

		//取到交易是转账记录的id集合
		var sql1 = "select direction as direcId from tbtransaction where mark = 0 and id in ( ";//new
		for (var i = 0; i<tLength; i++) {
			if (i==0) sql1+= transArray[i];
			else sql1+= ","+transArray[i];
		}
		sql1 += " ) and direction != 0 and tbsubaccount_id1 !=''";

		var direcArray = [];
		var list = JSON.parse(MoneyHubJSFuc("QuerySQL",sql1));
		//处理转账交易记录,相关联的转账交易记录ok
		if(list!=""){
			var sql2="update tbtransaction set mark = 1, UT = " + getUT() + " where id in (";
			$.each(list, function(k, n) {

			if( k==0 ) sql2+= n.direcId;
				else sql2+= ","+n.direcId;		 
			});
			sql2 += ")"
			debug("\n处理相关删除="+sql2+"\n")
			MoneyHubJSFuc("ExecuteSQL",sql2);
		}
		//取得相关的子账户id集合
		var sql3 =" select distinct(tbsubaccount_id) as subId from tbtransaction where mark = 0 and id in ( ";
		for(var i = 0; i<tLength;i++){
			if( i==0 ) sql3+= transArray[i];
			else sql3+= ","+transArray[i];
		}
		sql3 += ")";
		var list1 =  JSON.parse(MoneyHubJSFuc("QuerySQL",sql3));
		//开始批量删除记录
		var sql4 = "update tbtransaction set mark = 1, UT = " + getUT() + " where id in ( ";
		for(var i = 0;i<tLength;i++){
			if( i==0 ) sql4+= transArray[i];
			else sql4+= ","+transArray[i];
		}
		sql4 += ")"
		MoneyHubJSFuc("ExecuteSQL",sql4);
		//重新计算相关的子账户的余额
		$.each(list1, function(j, m) {
			 modifySubAccountBalance(m.subId);
		});
		//渲染下账户
		renderTransView(currentAid,currentSid);
		//清空数据
		transArray = [];
		//清空选项处理
		allSelect("empty");	
	}
}

/** 取消批量编辑
 */
function cancelBatch() {
	try{
		batchIsView = false;
		$("#dBatchEdit").hide();
		lotIconView("hide");
		//清空选项处理
		allSelect("empty");
		//指定默认值
		selectOption("#dBatchEdit", "lotPayee", "-1")
		selectOption("#dBatchEdit", "lotCategory2", "-1");
	} catch(e) {
            logCatch(e.toString());
		//alert(e.message);
	}	
}
