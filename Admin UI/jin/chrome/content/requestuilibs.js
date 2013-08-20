/**
(c) Omniture 2009
$Author: dreavis $ $Revision: #14 $
$Date: 2010/10/01 $
**/

window.createrequest = {};

function getCreateRequestVersion() {

    window.createrequest.version = "prototype 0";

    //alert(window.createrequest.version); // prototype 0

    getCreateRequestLocation();

}

function getCreateRequestLocation() {

    window.createrequest.location = "http://localhost/wartisan/request.html";
    //alert(window.createrequest.location); // http://www.wartisan.com/users/request.html
}

if (typeof(cmLibJsLoaded)=="undefined") {

    var createrequestApp = {
            addToolbarButton: function () {
                //alert("add");
                    //TODO: check if we should addButtons to the toolbar. Only add if this is the first time, or an upgrade.
                    //we should only add buttons if certain criteria is met (below)
                    var addButtons = false;

                    //apply appropriate stylesheet (mac or pc) for toolbar-specific formatting...
                    var platform = createrequestApp.getPlatform();
                    var docStyleSheets = document.styleSheets;
    /*		*/
                    if (platform=="mac") {
    /*			*/
                            for(var i=0; i<docStyleSheets.length; ++i) {
    /*				*/
                                    if(docStyleSheets[i].href=="chrome://createrequest/skin/clickmap.css") {
    /*					olog(3, 'PC stylesheet disabled.')*/
                                            docStyleSheets[i].disabled = true;
                                    } else if(docStyleSheets[i].href=="chrome://createrequest/skin/clickmap_mac.css") {
    /*					olog(3, 'Mac stylesheet enabled.')*/
                                            docStyleSheets[i].disabled = false;
                                    }
                            }
                    } else {
                            for(var i=0; i<docStyleSheets.length; ++i) {
    /*				*/
                                    if (docStyleSheets[i].href=="chrome://createrequest/skin/clickmap_mac.css") {
    /*					olog(3, 'Mac stylesheet disabled.')*/
                                            docStyleSheets[i].disabled = true;
                                    } else if(docStyleSheets[i].href=="chrome://createrequest/skin/clickmap.css") {
    /*					olog(3, 'PC stylesheet enabled.')*/
                                            docStyleSheets[i].disabled = false;
                                    }
                            }
                    }

                    //TODO:determine ClickMap version from bundle, then match against current preferences...

                    //For now, we always add the button in...
                    addButtons = true;
                    //add icon to main toolbar
                    if (addButtons) {


                            var toolbox =  window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                                               .getInterface(Components.interfaces.nsIWebNavigation)
                                               .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
                                               .rootTreeItem
                                               .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                                               .getInterface(Components.interfaces.nsIDOMWindow)
                                               .document.getElementById("navigator-toolbox");
                            
                            var toolboxDocument = toolbox.ownerDocument;

                            /* Determine if the Toolbar is already there... */
                            var hasClickMapToolbarButton = false;
                            for (var i = 0; i < toolbox.childNodes.length; ++i) {
                                    var toolbar = toolbox.childNodes[i];
                                    if (toolbar.localName == "toolbar" && toolbar.getAttribute("customizable")=="true") {
                                            if(toolbar.currentSet.indexOf("createrequest-button")>-1) {
                                                    hasClickMapToolbarButton = true;
                                            }
                                    }
                            }

                            /* Add the Toolbar Icon automatically */
                            if (!hasClickMapToolbarButton) {
                                    for (var i = 0; i < toolbox.childNodes.length; ++i) {
                                            toolbar = toolbox.childNodes[i];
                                            if (toolbar.localName == "toolbar" &&	 toolbar.getAttribute("customizable")=="true" && toolbar.id=="nav-bar") {
                                                //alert("33"); //33
                                                    var newSet = "";
                                                    var child = toolbar.firstChild;

                                                    while(child){
                                                        //alert(child.id);
                                                            //if it hasn't been added and we have either already encountered the clickmap-button or have come to the urlbar-container
                                                            if(!hasClickMapToolbarButton && (child.id=="createrequest-button" || child.id=="urlbar-container")){
                                                                //alert("44"); //44
                                                                    newSet += "createrequest-button,";
                                                                    hasClickMapToolbarButton = true;
                                                            }
                                                            newSet += child.id+",";
                                                            //alert(child.id);
                                                            child = child.nextSibling;
                                                    }
                                                    newSet = newSet.substring(0, newSet.length-1); //strip off the final comma
                                                    toolbar.currentSet = newSet;
                                                    toolbar.setAttribute("currentset", newSet);
                                                    toolboxDocument.persist(toolbar.id, "currentset");//make sure it works even when it is closed...
                                                    BrowserToolboxCustomizeDone(true);
                                                    break;
                                            }
                                    }
                            } // end if

                    } //end if (addButtons)
            }, //end function Init

            getAppVersionNum : function(){
                    var num = "";
                    var pref = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
                    try{
                            num = pref.getCharPref("general.useragent.vendorSub");
                    }
                    catch(e){}

                    try{
                            if(num.length==0){
                                    var str = pref.getCharPref("general.useragent.extra.firefox");
                                    var pos = str.indexOf("/")
                                    if(pos>-1)
                                            num = str.substring(pos+1);
                                    else
                                            num = str;
                            }
                    }
                    catch(e){}

                    return num;
            },

       getExtVersionNum : function(){
                    //var bundle = document.getElementById("bundle_clickmap");
                    //var num  = bundle.getString("clickmap_versionNum");
                    var num = 0;
                    alert(num);
                    return num;
       },

       getPlatform : function(){
                    var platform = new String(navigator.platform);
                    var str = "";
                    if(!platform.search(/^Mac/))
                            str = "mac";
                    else if(!platform.search(/^Win/))
                            str = "win";
                    else
                            str = "unix";
                    //alert(str); // win
                    return str;
       }
    };//end clickmapApp

    window.addEventListener("load", createrequestApp.addToolbarButton, false); //add toolbar button
}