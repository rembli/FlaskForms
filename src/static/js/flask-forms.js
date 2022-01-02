//# APP SETTINGS ##################################################

var debug = true;
var caching = true;
var host = ".";

//# INIT ##########################################################

var accessToken = window.sessionStorage.getItem("accessToken");
var currentUser = window.sessionStorage.getItem("currentUser");


(function() {
    var startingTime = new Date().getTime();
    // Load the script
    var script = document.createElement("SCRIPT");
    script.src = 'https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js';
    script.type = 'text/javascript';
    script.async = false;
    document.getElementsByTagName("head")[0].appendChild(script);

    // Poll for jQuery to come into existance
    var checkReady = function(callback) {
        if (window.jQuery) {
            callback(jQuery);
        }
        else {
            window.setTimeout(function() { checkReady(callback); }, 20);
        }
    };

    // Start polling...
    checkReady(function($) {
        $(function() {
            var endingTime = new Date().getTime();
            var tookTime = endingTime - startingTime;
            //window.alert("jQuery is loaded, after " + tookTime + " milliseconds!");
            init ();
        });
    });
})();


function init () {
	// caching enablen
	$.ajaxSetup({
		cache: true
	});
 
    // load stylesheets
    // loadCSS ("./css/bootstrap.min.css");

    // load scripts
	loadScript ("https://cdn.jsdelivr.net/npm/jquery-validation@1.19.3/dist/jquery.validate.min.js");
	loadScript ("https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.11.4/jquery-ui.min.js");
    loadScript ("https://formbuilder.online/assets/js/form-render.min.js");

    // init form
    form_template_id = $("flask-form").attr("template-id");
    if (form_template_id != undefined) {
        init_form (form_template_id);
    }
    else {
        form_template_id = getParameterByName ("form_template_id");
        init_form (form_template_id);   
    }
}

function init_form (form_template_id) {

    form_html_template = "\
        <div id='form_container'> \
            <form id='flask_form' name='flask_form' action='http://localhost:5000/forms' method='POST' target='hiddenFrameForSilentSubmit'>  \
                <div id='form-template'></div>  \
                    <input type='hidden' name='_form_template_id' id='form_template_id'>  \
                    <button id='submit_button' onclick='submit_form()'>submit</button>   \
                </div>   \
            </form>  \
            <iframe name='hiddenFrameForSilentSubmit' id='hiddenFrameForSilentSubmit' style='width:0;height:0;border:0;'>   \
            </iframe>  \
        </div>  \
        <div id='form_container_after_submit' style='display:none'>  \
            Thank you!   \
        </div>   \
        ";

    $("flask-form").html(form_html_template);

    url = 'http://localhost:5000/form-templates/'+form_template_id;
    form_definition = null;

    $.ajax({
        url: url,
        type: 'get',
        dataType: "json", 
        cache: false,  
        success: function(response){
            form_definition = response["definition"]; 
            var container = document.getElementById('form-template');  
            var formRenderOpts = {
                container: container,
                formData: form_definition,
                dataType: 'json'
            };
            $(container).formRender(formRenderOpts);

            $('#form_template_id').val(form_template_id);
        }
    });   
}


function submit_form () {
    let form = document.getElementById("flask_form");

	// check if any requrired inputs are missing (= invalid sub-class is set through automatic form validation)
	if ($(":invalid").length == 0) {
		form.submit();
		$("#form_container").hide();
		$("#form_container_after_submit").show();	
	}
	else {
		$("input:required:invalid").css({"border-color": "ff0000"});
	}
}


//# UTIL ####################################################

function loadCSS (url) {
    var link = document.createElement("LINK");
    link.href = url;
    link.rel = 'stylesheet';
    document.getElementsByTagName("head")[0].appendChild(link);	
}


function loadScript (url, f) {
    if (f!=undefined) {
    	$.getScript( url, function( data, textStatus, jqxhr ) {
    		log ("Loaded script from "+url);
    		f();
    	});
    }
    else {
        var script = document.createElement("SCRIPT");
        script.src = url;
        script.type = 'text/javascript';
        script.async = false;
        document.getElementsByTagName("head")[0].appendChild(script);    	
    }
}


//# AUTHENTICATION ####################################################

 function isAuthenticated() {
 	var accessToken = window.sessionStorage.getItem("accessToken");
 	if (accessToken!=null) 
 		return true;
 	else
 		return false;
 }


 function getCurrentUser () {
 	if (isAuthenticated()) 
 		return  window.sessionStorage.getItem("currentUser");
 	else
 		return "-";
 }
 
 function getCurrentUserEMail () {
	 	if (isAuthenticated()) 
	 		return  window.sessionStorage.getItem("currentUserEMail");
	 	else
	 		return "-";
	 } 


 function getAccessToken () {
 	if (isAuthenticated()) 
 		return  window.sessionStorage.getItem("accessToken");
 	else
 		return "";
 }

 function logout () {
 	// token aus der session entfernen
 	window.sessionStorage.removeItem("accessToken");
 	window.sessionStorage.removeItem("currentUser");	
 	
 	// token aus der DB entfernen
 	var url = host+"/api/logout";
 	var client = new XMLHttpRequest();
 	client.open ('POST', url, true);
 	client.send ();
 	
 	// auf die login seite umleiten
 	window.document.location.href = host+"/login.html";
 }

 //# HELPER ##################################################################
 
function setCache (key, value) {
	try {
		window.localStorage.setItem(key, value);
	} 
	catch (e) {
		log ("Local Storage not supported");
	}
}

function getCache (key) {
	var value = null;
	try {
		value = window.localStorage.getItem(key);
	} 
	catch (e) {
		log ("Local Storage not supported");
	}
	return value;
}

function deleteCache (key) {
	try {
		window.localStorage.removeItem(key);
	} 
	catch (e) {
		log ("Local Storage not supported");
	}
}
  
function log (str) {
	 if (debug) {
		 console.log (str);
	 }
 }
 

 function getParameterByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
 }

 function sleep(delay) {
     var start = new Date().getTime();
     while (new Date().getTime() < start + delay);
   }

 function DateFmt(fstr) {
 	  this.formatString = fstr

 	  var mthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
 	  var dayNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
 	  var zeroPad = function(number) {
 	     return ("0"+number).substr(-2,2);
 	  }

 	  var dateMarkers = {
 	    d:['getDate',function(v) { return zeroPad(v)}],
 	    m:['getMonth',function(v) { return zeroPad(v+1)}],
 	    n:['getMonth',function(v) { return mthNames[v]; }],
 	    w:['getDay',function(v) { return dayNames[v]; }],
 	    y:['getFullYear'],
 	    H:['getHours',function(v) { return zeroPad(v)}],
 	    M:['getMinutes',function(v) { return zeroPad(v)}],
 	    S:['getSeconds',function(v) { return zeroPad(v)}],
 	    i:['toISOString']
 	  };

 	  this.format = function(date) {
 	    var dateTxt = this.formatString.replace(/%(.)/g, function(m, p) {
 	      var rv = date[(dateMarkers[p])[0]]()

 	      if ( dateMarkers[p][1] != null ) rv = dateMarkers[p][1](rv)

 	      return rv

 	    });

 	    return dateTxt
 	  }
 }

 function setCookie(name, value, days) {
 	    if (days) {
 	        var date = new Date();
 	        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
 	        var expires = "; expires=" + date.toGMTString();
 	    }
 	    else var expires = "";
 	    document.cookie = name + "=" + value + expires + "; path=/";
 }

 function getCookie(c_name) {
 	    if (document.cookie.length > 0) {
 	        c_start = document.cookie.indexOf(c_name + "=");
 	        if (c_start != -1) {
 	            c_start = c_start + c_name.length + 1;
 	            c_end = document.cookie.indexOf(";", c_start);
 	            if (c_end == -1) {
 	                c_end = document.cookie.length;
 	            }
 	            return unescape(document.cookie.substring(c_start, c_end));
 	        }
 	    }
 	    return "";
 }

 function validateEmail(email) { 
   var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
   return re.test(email);
 } 

 function checkForApp () {
 	if (navigator.userAgent.search(/iPhone/i)>0  || navigator.userAgent.search(/iPad/i)>0)
 			return true;
 	else
 			return false;
 }


 
 
 
 
 
	     