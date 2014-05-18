// ==UserScript==
// @name        ImgurUserToTop
// @namespace   someName
// @include		http://imgur.com/user/*
// @include     http://imgur.com/gallery/*
// @version     1
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_deleteValue
// @grant       unsafeWindow
// ==/UserScript==

/*
* TODO:
* - activate on favorites, too
* - Add / remove user at every command per mini GUI (mouse over OR insert name at gallery page, filter comments ?)
* - Find a nice way for a listener to react on comment loading and page navigation (next/last...) (jquery append listener with selector for every append ?)
*/


/*
* Patch for GM_getValue and GM_SetValue support for chrome
* credits to: www.devign.me/greasemonkey-gm_getvaluegm_setvalue-functions-for-google-chrome/
*/
if (!this.GM_getValue || (this.GM_getValue.toString && this.GM_getValue.toString().indexOf("not supported")>-1)) {
    this.GM_getValue=function (key,def) {
        return localStorage[key] || def;
    };
    this.GM_setValue=function (key,value) {
        return localStorage[key]=value;
    };
    this.GM_deleteValue=function (key) {
        return delete localStorage[key];
    };
}
 /* this sucks, but how else ? */
$ = unsafeWindow.jQuery
/* seriously javascript ? oO */
if (typeof String.prototype.startsWith != 'function') {
	String.prototype.startsWith = function(str){
		return this.lastIndexOf(str, 0) === 0;
	};
}


function commentsToTop(authId){
	var elem = $('[data-author="'+authId+'"]').parent().parent().parent();
	elem.each(function(){
		var d = $(this);
		if ( this.dirty ) return;
		this.dirty = true;
		if( d.parent().attr('class') == "bad-captions" ){
			d.prependTo(d.parent().parent());
			return;
		}
		if( d.index() == 0 ) return;
		d.prependTo(d.parent());
	});
}
 
var GR_COOKIE_NAME = 'imgur_user_2top';
var user = $.parseJSON(GM_getValue(GR_COOKIE_NAME, '{}'));
// Are we on a user page ?
var reg = /^https?:\/\/imgur.com\/user\/\w+$/;
if( reg.test(String(document.location)) ){
	var elem = $('[data-author]').first();
	if(elem.length == 1){
		var uid = elem.attr('data-author');
		var username = elem.children(':first').html();
		//console.log(username + ' : ' + uid);
		
		var btn = $('<button style="margin: 2px;" /> ');
		var onRemoveHandler = function(){
			btn.html('Add U2T');
			btn.unbind('click');
			btn.click(onAddHandler);
			// because of security reasons it is not allowed to call GM_ functions at 'site-callback'
			// this is working though (lol ?)
			delete user[uid];
			window.setTimeout(function(){GM_setValue(GR_COOKIE_NAME, JSON.stringify(user))}, 0);
			alert('Removed user ' + username + ' from list');
		};
		var onAddHandler = function(){
			btn.html('Remove U2T');
			btn.unbind('click');
			btn.click(onRemoveHandler);
			// because of security reasons it is not allowed to call GM_ functions at 'site-callback'
			// this is working though (lol ?)
			user[uid] = username;
			window.setTimeout(function(){GM_setValue(GR_COOKIE_NAME, JSON.stringify(user))}, 0);
			alert('Added user ' + username + ' to list');
		};
		
		if(user[uid]){
			btn.html('Remove U2T');
			btn.click(onRemoveHandler);
		}else{
			btn.html('Add U2T');
			btn.click(onAddHandler);
		}
		$('#captions').prepend(btn);
	}
}
// Or on a gallery page ?
else{
	setInterval( function(){
		for(var key in user){
			commentsToTop(key);
		}
	}, 1000 );
}


	

