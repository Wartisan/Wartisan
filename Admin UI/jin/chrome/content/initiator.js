/**
 * initiator.js
 * Class file for Initiator class
 * Performs all initiatory processes for ClickMap
 **/

var initiator;				// reference needed to execute thread
var THREAD_MAX = 5;			// number of threads spun for flash movies
var THREAD_INTERVAL = 200;	// milliseconds

var Initiator = function()
{
    initiator = this;
	this.setup();
};

Initiator.prototype.setup = function()
{
    this._account_in_sidebar = null;
	this._requests = new Array();
	this._flash_embeds = new Array();
	this._flash_requests_found = new Array();
	this._flash_frames = new Array();
	this._flash_ready = true;
	this._threads = 0;
	
};

Initiator.prototype.getSelectedAccountInSidebar = function()
{
	try {
		var account_selector = getMySidebarWindow().document.getElementById('switchAccnt');
	} catch(ex) {}
	if (account_selector) {
		this._account_in_sidebar = account_selector.value;
	} else {
		this._account_in_sidebar = null;
	}
	
};

Initiator.prototype.isAccountAvailable = function()
{
	
	return (this._account_in_sidebar != null);
};

Initiator.prototype.setPluginColors = function()
{
	// make sure the color is set properly
	var attributes = new Array();
	attributes['clickColor'] = getMySidebarWindow().metricColor;
	attributes['convColor'] = getMySidebarWindow().convColor;
	dispatchClickMapEvent("clickMapSetPluginColorsEvent", attributes);
	
};

Initiator.prototype.isDemoMode = function()
{
	
	return (this._account_in_sidebar == 'clicktest');
};

Initiator.prototype.sendDemoRequest = function()
{
	

	// fabricate request components
	characterEncoding = null;
	pageName = cm_theDoc.title?cm_theDoc.title:cm_theDoc.location;
	contextType = 0;
	codeVer = "G.1";
	type = 'JAVASCRIPT';

	// add request to collection and submit
	this._addRequest(type, pageName, contextType, codeVer, characterEncoding);
	this.sendAllRequests();
};

Initiator.prototype.getFirstJavascriptRequest = function()
{
	

	// search through each frame document for the first JS request found
	for (var frame_index = 0 ; frame_index < all_frame_docs.length ; frame_index++) {
		var current_frame_document = all_frame_docs[frame_index];
		var cmCR = this._getJavascriptRequest(current_frame_document);
		if (cmCR) {
			this._addJavascriptRequest(cmCR);
			this._setMainDocument(current_frame_document);
			break;	// once a request is found, stop searching
		}
	}
};

Initiator.prototype.getAllFlashObjects = function()
{
	

	// add all flash frames (frame/embeds pair) that have flash objects within the given frame
	for (var frame_index = 0 ; frame_index < all_frame_docs.length ; frame_index++) {
		var current_frame_document = all_frame_docs[frame_index];
		var flash_embeds_for_document = current_frame_document.getElementsByTagName('EMBED');
		if (flash_embeds_for_document.length > 0) {
			var flash_frame = new Object();
			flash_frame['frame_document'] = current_frame_document;
			flash_frame['embeds'] = flash_embeds_for_document;
			this._flash_frames.push(flash_frame);
		}
	}
};

Initiator.prototype.hasFlashObjects = function()
{
	
	return (this._flash_frames.length > 0);
};

Initiator.prototype.initiateFlashRequestGathering = function()
{
	this._flash_ready = false;
	this._getAllFlashRequests();
};

Initiator.prototype.processRequests = function()
{
	if (this._flash_ready) {
		if (this.foundRequests()) {
			this.sendAllRequests();
		} else {
			this.sendNoRequestsMessage();
		}
	}
};

Initiator.prototype.foundRequests = function()
{
	
	return (this._requests.length > 0);
};

Initiator.prototype.sendAllRequests = function()
{
	// clear any stored requests in the sidebar
	getMySidebarWindow().clearRequests();

	// add all current requests
	
	for (var i = 0 ; i < this._requests.length ; i++) {
		var request = this._requests[i];
		
		getMySidebarWindow().addRequest(request['page_name'], request['context_type'], request['code_version'], request['character_encoding'], request['type'], request['id']);
	}

	// submit requests to server
	getMySidebarWindow().buildCompleteRequest();
	this._flash_ready = false;
};

Initiator.prototype.sendNoRequestsMessage = function()
{
	
	getMySidebarWindow().redirectToErrorPage();
	this._flash_ready = false;
};

Initiator.prototype.getRequest = function(request_id)
{
	
	for (var i = 0 ; i < this._requests.length ; i++) {
		var request = this._requests[i];
		if (request['id'] == request_id) {
			
			
			return request;
		}
	}

	
	return null;	// no request was found with the specified request id
}

// private methods

Initiator.prototype._getAllFlashRequests = function()
{
	// this first block will only get executed in a race condition
	if (this._flash_ready) {
		return;
	}

	if (this._foundAllFlashRequests()) {
		
		this._flash_ready = true;
		this.processRequests();
	} else {
		this._threads++;
		if (this._threads <= THREAD_MAX) {
			
			setTimeout("initiator._getAllFlashRequests()", THREAD_INTERVAL);
			this._getFlashRequests();
		} else {
			this._flash_ready = true;
			this.processRequests();
		}
	}
};

Initiator.prototype._getFlashRequests = function()
{
	

	for (var frame_index = 0 ; frame_index < this._flash_frames.length ; frame_index++) {
		var flash_embeds_for_document = this._flash_frames[frame_index]['embeds'];
		var current_frame_document = this._flash_frames[frame_index]['frame_document'];

		// find all flash objects (embed) on the page (within the frame) that are ClickMap enabled
		
		for(var i = 0 ; i < flash_embeds_for_document.length ; i++) {
			

			// skip if already found request
			var already_found = false;
			for (var j = 0 ; j < this._flash_requests_found.length ; j++) {
				
				if (this._flash_requests_found[j] == i) {
					
					already_found = true;
					break;
				}
			}
			if (already_found) {
				
				continue;
			}

			// verify that the movie is clickMap enabled
			var movie_object = unwrap(flash_embeds_for_document[i]);
			
			
			if (this._isMovieClickMapEnabled(movie_object)) {
				
				this._addFlashRequest(movie_object);
				this._flash_requests_found.push(i);

				// only this frame will be used from now on
				this._flash_embeds = flash_embeds_for_document;
				this._setMainDocument(current_frame_document);
			}
		}

		if (this._flash_embeds.length > 0) {
			
			break;
		}
	}
};

Initiator.prototype._isMovieClickMapEnabled = function(movie_object)
{
	return (FlashUtils.getVariable(movie_object, 's_getTrackClickMap', 's_s.trackClickMap') == 'true');
};

Initiator.prototype._foundAllFlashRequests = function()
{
	// flash embeds may not be set yet because a frame has not yet been found
	return (this._flash_embeds.length > 0 && (this._flash_embeds.length == this._flash_requests_found.length));
};

Initiator.prototype._getJavascriptRequest = function(document_object)
{
	var match_string = '/b/ss/'; // we'll assume any image URL containing this string is our code request

	// search all images throughout document
	if(document_object.images){
		for(var i = 0 ; i < document_object.images.length ; i++) {
			if (document_object.images[i].src.toLowerCase().indexOf(match_string) != -1) {
				return document_object.images[i].src;	// get the first request found
			}
		}
	}
	

	var request_list = new Array;
	// search default views in document
        var unwrappedView = unwrap(document_object).defaultView;
	
	for (winVar in unwrappedView){
		if ((winVar.substring(0,4) == 's_i_') && (unwrappedView[winVar].src) && unwrappedView[winVar].src.indexOf(match_string) != -1) {
			
			request_list[request_list.length] = unwrappedView[winVar].src;
		}
	}

	// In the case of double-tagged pages, Firefox returns the objects in reverse of IE & data collection
	// Returning the last element of all the objects will ensure it matches IE clickmap behavior
	// See #35146,22267
	
	
	return request_list[request_list.length-1];

	// no requests found in document
	return null;
};

Initiator.prototype._setMainDocument = function(document_object)
{
	cm_theDoc = document_object;	// assign cm_theDoc to the frame document holding the request (only this document will be used from now on)
	all_frame_docs = new Array();
	all_frame_docs.push(cm_theDoc);	// anything examining frames will only find the main document
};

Initiator.prototype._checkAccount = function(codeRequest)
{
	
	var account_in_request = this._extractPathVar(codeRequest,5);
	var account_parts = account_in_request.split(',');
	var numOfAccounts = account_parts.length;
	// there is a problem where the rsid in the code on the site is not where
	// the data is actually stored. For now we will just check to see if there
	// is an rsid. In the future we may want to revert to strict checking and
	// handle the exceptions on the server side.
	if(numOfAccounts > 0) return true;

	for(i=0;i<numOfAccounts; i++){
		if(account_parts[i] == this._account_in_sidebar) return true;
	}
	return false;
};

// extract a variable from a path string
Initiator.prototype._extractPathVar = function(path, offset)
{
	var vars = path.split('/');
	return vars[offset];
}

// get the value of a variable contained in URI string
Initiator.prototype._extractURIVar = function(uri, variable)
{
	var vars = uri.split('&');
	for (var i=0;i<vars.length;i++) {
		var pair = vars[i].split('=');
		if(pair[0] == variable) return pair[1];
	}
}

Initiator.prototype._addJavascriptRequest = function(code_request)
{
	if (this._checkAccount(code_request)) {
		var characterEncoding = this._extractURIVar(code_request, 'ce');
		var codeVer = this._extractPathVar(code_request, 7);
		var contextType = 1;
		var pageName = this._extractURIVar(code_request, 'pageName');
		if(!pageName){
			pageName = this._extractURIVar(code_request, 'g');
			contextType = 0;
		}

		if (pageName) {
			
			this._addRequest('JAVASCRIPT', pageName, contextType, codeVer, characterEncoding);
		}
	}
}

Initiator.prototype._addFlashRequest = function(movie_object)
{
	// page name
	var page_name = FlashUtils.getVariable(movie_object, 's_getPageName', 's_s.pageName');
	
	var context_type = 1;
	if (!page_name) {
		page_name = FlashUtils.getVariable(movie_object, 's_getPageURL', 's_s.pageURL');
		context_type = 0;
	}

	// code version/character encoding
	var code_version = FlashUtils.getVariable(movie_object, 's_getVersion', 's_s.version');
	
	var character_encoding = FlashUtils.getVariable(movie_object, 's_getCharSet', 's_s.charSet');
	

	// movie id
	var movie_id = FlashUtils.getVariable(movie_object, 's_getMovieID', 's_s.movieID');
	if (!movie_id) {
		
		var object_url = movie_object.getAttribute('src');	// do not use s_getSWFURL() here because the ActionSource 1 alternative is an attribute on the DOM object, not a variable within the Flash movie
		if (object_url) {
			while (object_url.indexOf('/') != -1) {
				object_url = object_url.substr(object_url.indexOf('/') + 1);
			}
			movie_id = object_url.substring(0, object_url.indexOf('.'));
		}
	}

	if (movie_id && page_name && code_version) {
		
		this._addRequest('FLASH', page_name, context_type, code_version, character_encoding, movie_id, movie_object);
	}
}

Initiator.prototype._addRequest = function(type, page_name, context_type, code_version, character_encoding, movie_id, flash_object)
{
	
	var request = new Object();
	request['page_name'] = page_name;
	request['context_type'] = context_type;
	request['code_version'] = code_version;
	request['character_encoding'] = character_encoding;
	request['type'] = type;
	request['id'] = this._requests.length;	// assign request id by number of requests

	// add additional flash components
	if (movie_id != null && flash_object != null) {
		request['movie_id'] = movie_id;
		request['object'] = flash_object;
	}

	this._requests.push(request);
}
