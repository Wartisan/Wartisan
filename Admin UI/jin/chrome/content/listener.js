//the integer-value for the flag representing the end of the main page browser load
//Wei: didn't figure out how to use below three constants, keep for now

const STATE_PAGE_LOADED = 786448; //STATE_STOP, STATE_IS_NETWORK, and STATE_IS_WINDOW flags
const NOTIFY_STATE_DOCUMENT =
  Components.interfaces.nsIWebProgress.NOTIFY_STATE_DOCUMENT;
const STATE_STOP =
  Components.interfaces.nsIWebProgressListener.STATE_STOP;


// The Global CreateRequest Sidebar Object
var mysidebar;
var browser;
//var mainWindow;
$mb = jQuery.noConflict();
var doc = window.content.document;


function getSideBar() {
	if (!mysidebar) {
		mysidebar = top.document.getElementById('sidebar').contentWindow;
	}
	return mysidebar;
}

function getSideBarBrowser() {
	if (!browser) {
		browser=getSideBar().document.getElementById("createrequestBrowser");
	}
	return browser;
}

// Load a url in the content window.
function LoadSideBarContent(url) {
    getSideBarBrowser().webNavigation.loadURI(url,0, null, null, null);
}

function registerMyListener() {
	// Wei: myListener is from ClickMap
	top.getBrowser().addProgressListener(myListener, NOTIFY_STATE_DOCUMENT);
	// Wei: clickReporter is used for Create Request
	top.getBrowser().addEventListener("click", clickReporter,false);
        top.getBrowser().addEventListener("mouseover", wartisan_mouseover,false);
}

function wartisan_mouseover(e){
        e = e||window.event;
                //for jquery use
        $mb = jQuery.noConflict();
        var doc = window.content.document;
     //  alert(doc);
        
        var sss = Components.classes["@mozilla.org/content/style-sheet-service;1"].getService(Components.interfaces.nsIStyleSheetService);
        var ios = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
        var uri = ios.newURI('chrome://createrequest/skin/style.css', null, null);
        sss.loadAndRegisterSheet(uri, sss.USER_SHEET);
        
        $mb('*',doc).removeClass("tcurrent");
        $mb('html',doc).removeClass("tcurrent");
       // alert(e.target);
        $mb(e.target,doc).addClass("tcurrent");

}

function clickReporter(e) {
    

//        
	e = e||window.event;
	var xpath = readXPath(e.target);

	// Wei: "sidebar" is the default ID for FF sidebar
	// Wei: ID createrequestBrowser was defined in sidebar.xul
	mySidebarDoc = top.document.getElementById('sidebar').contentWindow.document.getElementById("createrequestBrowser").contentWindow;
	mySidebarDoc = mySidebarDoc.document;
       
	mySidebarDoc = unwrap(mySidebarDoc);
    
  
	
	var request_steps = mySidebarDoc.getElementById("kika"); // get the element <span id="catchdetails"></span>
	
	//alert("details: " + request_steps);

	if (!request_steps) {
		alert("Didn't find catch details");
	} 
        var fullContent = $mb(e.target,doc).html();

        textContent = fullContent.replace(/(<([^>]+)>)/ig,"");
//	var txtNode = mySidebarDoc.createTextNode(xpath);
//	request_steps.appendChild(txtNode);

        var wartisanHtml = 'xpath:'+xpath+'\r'+'content:'+textContent+'\r'+'fullcontent:'+fullContent;
        request_steps.innerHTML += wartisanHtml;
        unregisterMyListener();
        $mb = jQuery.noConflict();
        var doc = window.content.document;
       $mb('*',doc).removeClass("tcurrent");

}

function unregisterMyListener() {
	try{
		top.getBrowser().removeProgressListener(myListener);
		// Wei: have to clickReporter, otherwise even we close sidebar, this listener will keep working
		// Wei: this should work with "Recording" button later
		top.getBrowser().removeEventListener("click", clickReporter, false);
                top.getBrowser().removeEventListener("mouseover", wartisan_mouseover,false);
	} catch(ex){}
}

var myListener =
{

	onLocationChange:function(aProgress,aRequest,aURI) {
		/*if (!aProgress.isLoadingDocument) {
			//getSideBarBrowser().contentWindow.external.UpdateFSettings();
			//
		}*/
		///alert("444");
	},
	onStateChange:function(aProgress,aRequest,aFlag,aStatus) {
		//if (aFlag & STATE_STOP) {
		if (aFlag == STATE_PAGE_LOADED) {
			var attributes = new Array();
			dispatchClickMapEvent('clickMapUpdateEvent', attributes);
			
		}
		//alert("333");
	},
	onProgressChange:function(a,b,c,d,e,f){},
	onStatusChange:function(a,b,c,d){},
	onSecurityChange:function(a,b,c){},
	onLinkIconAvailable:function(a,b){},
	stateAnalyzer: function(abc){
	  	var the_State ='';
		if(abc & 1) the_State += ' START<br>';
		if(abc & 2) the_State += ' REDIRECTING<br>';
		if(abc & 4) the_State += ' TRANSFERRING<br>';
		if(abc & 8) the_State += ' NEGOTIATING<br>';
		if(abc & 16) the_State += ' STOP<br>';
		if(abc & 65536) the_State += ' IS_REQUEST<br>';
		if(abc & 131072) the_State += ' IS_DOCUMENT<br>';
		if(abc & 262144) the_State += ' IS_NETWORK<br>';
		if(abc & 524288) the_State += ' IS_WINDOW<br>';
   	return the_State;
   }
};


// This function is called right when the sidebar is opened
function onLoadCreateRequestSidebar() {
        // In FF4.0, the call to get the addon version in the install.rdf is asynchronous
        // so we need to poll until the variable is set.
        if(!window.createrequest.location) {
        	//alert("no createrequest.location"); // no createreqeust.location
            getCreateRequestVersion();
        } else {
			//alert("there is createrequest.location");
        }

        var callback = function() {
            if(window.createrequest.location) {
            	//alert("2");
                clearInterval(window.createrequest.polling);
                LoadSideBarContent(window.createrequest.location);
            } else return false;
        };

        window.createrequest.polling = window.setInterval(callback, 500);
}

/* Attach myListener to the browser window once clickmapSidebar has loaded */


//window.addEventListener("load",registerMyListener,false);
//window.addEventListener("unload",unregisterMyListener,false);



// Wei: below codes comes from https://code.google.com/p/fbug/source/browse/branches/firebug1.6/content/firebug/lib.js?spec=svn12950&r=8828#1332
function readXPath(element) {

	var paths = [];

// Use nodeName (instead of localName) so namespace prefix is included (if any).
	for (; element && element.nodeType == 1; element = element.parentNode) {
		var index = 0;
		for (var sibling = element.previousSibling; sibling; sibling = sibling.previousSibling)	{
			// Ignore document type declaration.
			if (sibling.nodeType == Node.DOCUMENT_TYPE_NODE)
				continue;

			if (sibling.nodeName == element.nodeName)
				++index;
		}

		var tagName = element.nodeName.toLowerCase();
		var pathIndex = (index ? "[" + (index+1) + "]" : "");
		paths.splice(0, 0, tagName + pathIndex);
	}

	return paths.length ? "/" + paths.join("/") : null;
        
}


function pass_xpath(){
    

//    
//    recordEnabled = !recordEnabled;
//    if (recordEnabled) {
        var wartisan_sidebar = top.document.getElementById('sidebar').contentWindow.document.getElementById("createrequestBrowser").contentWindow;
	var wdoc = wartisan_sidebar.document;
//        $mb = jQuery.noConflict();
        $mb("#jin",wdoc).html('aaa');
        $mb("#lupditem",wdoc).html("<span style='display: inline-block; vertical-align: middle'><textarea id='kika' style='width: 230px; height: 100px; min-width: 230px; max-width: 230px;'></textarea></span>");

		//document.getElementById("recordLabel").innerHTML = "Recording........";
                alert('start');

        
        

		registerMyListener();
//	} else {
//            alert('remove');
//		//document.getElementById("recordLabel").innerHTML = "Record";
//        unregisterMyListener();
//	};
}