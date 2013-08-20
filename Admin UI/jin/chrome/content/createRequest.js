// main file with functions

var mainWindow;
var mySidebarWindow;

function toggleCreateRequest(event){  
	// open or close the clickmap sidebar
    if(!requestSidebarIsOpen()){
    	createRequestInitiator = new Initiator();
        update = true; 
        //alert("not open"); // if not opened but request to open
        toggleSidebar('viewRequestSidebar');
	} else {
		//alert("opened"); // if already opened but request to close
		requestCleanUp();
		toggleSidebar('viewRequestSidebar');
	}
}

function requestSidebarIsOpen(){
	if(document.getElementById('viewRequestSidebar')){
       	//alert("found id");
	  	rqelt = document.getElementById('viewRequestSidebar');
	  	if(rqelt.getAttribute("checked") == 'true')	return true;
	}
	return false;
}


function requestCleanUp(){
	try{
		//unregisterSidebarListener();
		//clickMapPlugin.ClearDivOverlay();
	} catch(e) { 
		alert("error in requestCleanUp()");
	}
}

function getMySidebarWindow(){
	if(!mySidebarWindow){
		try{
			var sidebar = top.document.getElementById('sidebar').contentWindow;
			var createrequstBrowser = sidebar.document.getElementById("createrequestBrowser").contentWindow;
			mySidebarWindow = unwrap(createrequestBrowser);
		} catch(e){}
	}
	return mySidebarWindow;
}

function getMainWindow() {
	if (!mainWindow) {
		try {
			mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                   .getInterface(Components.interfaces.nsIWebNavigation)
                   .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
                   .rootTreeItem
                   .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                   .getInterface(Components.interfaces.nsIDOMWindow); 
        } catch(e) {}
        return mainWindow;
	}
	//return mainWindow;
}

var startupAttempts = 0;
// Wei: disabled below, seems no use
// function superInit(){
// 	//alert("superInit");
// 	if(!requestSidebarIsOpen()){
// 		startupAttempts++;
// 		if(startupAttempts < 5) setTimeout('superInit()',1000);
// 	} else {
// 		update = true;
// 		//clickMapInitiator = new Initiator();	// performs all initial ClickMap processes
// 		// window.addEventListener("load", function(load(event) {
// 		// 	window.removeEventListener("load", load, false);
// 		// 	crInit();
// 		// },false);
		
   		
		
// 	};
// 	var appcontent = document.getElementById("appcontent");   // browser
//     	if(appcontent){
//       		appcontent.addEventListener("DOMContentLoaded", crinit, true);
//     	};

// 	// if (!mainWindow) mainWindow = getMainWindow();
// 	// mainWindow.document[0].addEventListener("click", function (e) {
// 	// 	var el = e.target;
// 	// 	alert(el);
// 	// 	alert("hahaha");
// 	// }, false);
// }

// Wei: no use
function crInit() {
	alert("crInit start to run");
	var appcontent = document.getElementById("appcontent");
	if (appcontent) {
		alert("found appcontent");
	} else {
		alert("not found appcontent");
	}
}

// Wei: didn't call this function
var createRequestExtension = {
  init: function() {
    var appcontent = document.getElementById("appcontent");   // browser
    if(appcontent){
      appcontent.addEventListener("DOMContentLoaded", createRequestExtension.onPageLoad, true);
    }
  },

  onPageLoad: function(aEvent) {
    var doc = aEvent.originalTarget; // doc is document that triggered "onload" event
    // do something with the loaded page.
    // doc.location is a Location object (see below for a link).
    // You can use it to make your code executed on certain pages only.
    if(doc.location.href.search("coma") > -1)
      alert("a forum page is loaded");
    
    // add event listener for page click
    aEvent.originalTarget.defaultView.addEventListener("click", function(event){ myExtension.onPageClick(event); }, true);
  
    // add event listener for page unload 
    aEvent.originalTarget.defaultView.addEventListener("unload", function(event){ myExtension.onPageUnload(event); }, true);
  },

  onPageUnload: function(aEvent) {
    alert("page unload");
  },

  onPageClick: function(aEvent) {
  	alert("click");
  }
};
