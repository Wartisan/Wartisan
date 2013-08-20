// Assorted helper functions that are used in multiple places in the ClickMap code

// Wei: used in listener.js, to unwrap a XUL element ? to HTML element (maybe i am not correct here)
function unwrap(o) {
	// unwraps an XPCNativeWrapper, if necessary, to get access to JavaScript properties
	// This became necessary as of Firefox 3.0.*
	// This function helps us avoid having to check for it in numerous places.
	// See here: https://developer.mozilla.org/en/XPCNativeWrapper
	if(o && o.wrappedJSObject) {
		return o.wrappedJSObject;
	}
	return o;
}


// Wei: this function probably is used to fire a customized event, didn't use it for now

function dispatchClickMapEvent(evtName, attributes) {
	// Creates and dispatches an event that will bubble up to be caught by the ClickMap plugin code.

	// Create element to dispatch event from
	var element = top.content.document.createElement("clickMapElement");

	// Set attributes in the element
	if(attributes) {
		for(i in attributes) {
			element.setAttribute(i, attributes[i]);
		}
	}

	// Append element to document
	top.content.document.documentElement.appendChild(element);

	// Create/Dispatch an event connected with the above element
	var evt = top.content.document.createEvent("Events");
	evt.initEvent(evtName, true, false);
	element.dispatchEvent(evt);

	// Destroy element
	top.content.document.documentElement.removeChild(element);
}

