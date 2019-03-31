/*	newsr_node.js
**	a node js site to act like a rest api for getting news,
**		in tweets and in, and rip.ie
**	branched out of the cst_node.js which should be a viewing component
**		with react or similar
**	CST, originally started 5 Nov 2018, branched 17 Nov 2018
*/

/*	todo's
**		tweet html handler
**			user image references
**			tweet status ("tweeted", "retweeted") and parent users
**			link extraction, make sure it's going alright
**		rss...
**		rip.ie
*/

/*	host and port will be mapped further by apache
*/
const hostname = '127.4.2.0';
const port = 2323;

/*	packages
*/
//	handle requests in general
//		there's a https version too if it gets to that point
const http = require('http');
//	to GET stuff
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
//	jsdom ...
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
//	saving files, lot of permission errors due to /var/www perms (I 
//		think) will definitely need to be resolved if newsr is to
//		pretty print html's for other site's usage
const fs = require('fs');




/*	functions
*/

/*	getURL, to get a url, using xmlhttprequest
**		used to get tweet html, etc
*/
function getURL(url, callback) {
	console.log("getting url; " + url + "; now");
	var request = new XMLHttpRequest();
	request.open("GET", url, false);
	//	some issues with character sets, think it's good with iso
	request.setRequestHeader ("Accept", "text/xml; charset=iso-8859-1");
	request.onreadystatechange = function() {
		if (request.readyState == 4) {
			console.log("status; " + request.status);
			if (request.status == "200") {
				console.log("successful 200 response, got html");
			} else {
				console.log("non accounted for response status; " 
					+ request.status);
				console.log("requested url (" + url + ") failed");
				return "fail";
			}
		}
	}
	request.send();
	//console.log(request.responseText);
	callback(request.responseText);
	console.log("finished getting url; " + url + "\n");
	return "success";
}

/*	get keys, to get an object's keys, mainly used to understand 
**		dom objects
*/
var getKeys = function(obj){
   var keys = [];
   for(var key in obj){
      keys.push(key);
   }
   return keys;
}


/*	get tweet's link
**		people seem to tweet links as a tweet's centre piece (or photos,
**		but can treat the same way) but the tweet format has very long
**		html tag attributes etc., need to strip to basic <a> tag
**		or to an <a link>[title text]<a>   descriptor text
*/
function getTweetsLink(tweet) {
	//	check for html tags, get attributes
}

/*	pad space, returns a string with 'len' amount of spaces then a ^
**		used to compare index values against strings in a debug sense
*/
function padSpace(len, point = "^") {
	var mess = "";
	if (len < 0) {
		mess += "XXX-NOT-HERE-XXX-";
	} else {
		for (var i = 0; i < len; ++i) {
			mess += " ";
		}
	}
	mess += point;
	return mess;
}

/*	replace space, used to turn a multiline tweet in to a single line
**		with a space character to represent the newline
*/
function replaceSpace(text) {
	return text.replace(/\r/g, "").replace(/\n/g, " ");
}

/*	pretty number, prints a number pretty, i.e. 3000000 to 3mil
*/
function prettyNumber(number) {
	//	3210 to 3,210
	//	3210 to 3k
	//	3210 to 3.21k
	//	going for last one, 2 decimal places

	//	not relevant if number is 999 or less
	if (number <= 999) {
		return number;
	}
	let newmber = number;
	number = number / 1000;
	newmber = 'k';
	while ((number / 1000) >= 1) {
		number = number / 1000;
		if (newmber == 'k') {
			newmber = 'm';
		} else if (newmber == 'm') {
			newmber = 'bn';
		}
	}
	number *= 100;
	number = Math.trunc(number);
	number /= 100;
	return number + newmber;
}
/*	twitterfy
**		enter a username, or a status number, get a twitter link
*/
function twitterfy(twizz, text = null) {
	//	output variable
	var out;
	//	check if input's a user handle
	if (twizz.substr(0, 1) == "@") {
		//	make it a full twitter link to the user's page
		out = "<a class=\"link-cst\" target=\"_blank\" ";
		out += "href=\"https://twitter.com/" + twizz.substr(1) + "\">";
		//	if text is supplied then use it, otherwise just the handle
		out += ((text == null) ? twizz : text);
		out += "</a>";
	} else if (isNaN(twizz) == false) {
		//	check if input's a status
		//		isNaN returns true for char strings, false for numeric 
		//		strings
		//	return a link to the status
		out = "<a class=\"link-cst\" target=\"_blank\" ";
		out += "href=\"https://twitter.com/foo/status/" + twizz + "\">";
		out += ((text == null) ? twizz : text);
		out += "</a>";
	} else {
		//	just return the same text for unknowns
		console.log("twitterfy can't handle unknown; " + twitterfy);
		out = twizz;
	}

	return out;
}

/*	clean HTML; search and destroy html tags
**		function will probably evolve weirdly
**		yeah, putting a warning in now, this is basically html regex
**			madness, apologies
**		todo;
**			implement a tag whitelist, with nicely formatted <a href's
**				and nice <img src= alt= 's
**				set up loop flag for whitelist <img's and <a's instead 
** 					of < check
**			taking value after tag logic isn't working correct, that
**				weird slice thing in the final value formation of squeek
**				with basically any of them you have to return;
**					slice 0 to first
**					+ new created content
**					+ slice second to last	//	original tag content
**					+ slice (last + lasttag.length (think diff between 
** 						</a> and </span>))
**						to length of original text
**					(you may be thinking recursive to find any other 
**						random tags but instead it's handled because 
**						the main loop runs until all <'s are resolved
**						OR as the loop will run by FLAG
**			drop tag content from span emoji's, i.e. it goes;
**				<span...>symbol or &nbsp;</span>, so drop that symbol
**			BIG ONE; your returns in the middle of the main loop means
**				it will definitely only pay attention to the first one,
**				potential opportunity for recursion madness
**			probably almost definitely worthwhile seeting up class tags
**				like "emoji-cst", "link-cst", "prof-img-cst", 
**					"img-link-cst", "vid-link-cst" ("gif-link-cst"?)
**			get in to jsdom for this
*/
function cleanHTML(someHTML) {
	/*	this function is disgusting
	**		basic attribute check logic is sound
	**		the flow is insanity
	**		need to redo, but just want to go faster
	*/

	console.log("cleaning some html; " + someHTML);
	var squeeky = someHTML;
	var first, second, tag, last, chugger = 0;
	//	ref is for attribute keys (references), reflink href="reflink",
	//		reftext is <a...>reftext</a>, refflag is currently used for
	//		emojis, as to use the same attribute check loop to get the 
	//		link and title, a bit of a dirty hack but leaving it for the 
	//		moment
	var ref, reflink, reftext, refflag;

	var loopflag;
	//	this chugger variable will act as a counter outside scope of tag
	//		check loop, will provide reference for safe tags, and
	//		position to start next tag search from
	if ((squeeky.indexOf('<') >= 0) && (chugger < squeeky.length)) {
		//	todo, add that jsdom handling mechanism
		//		and then redo all of the brute force madness below
		loopflag = true;
	} else {
		console.log(" there is " + ((squeeky.indexOf('<') >= 0) ? "a" : "no") + " <  | the counter; " + chugger + "; is "+((chugger < squeeky.length)?"less":"geater (or equal to)")+" than the total length; " + squeeky.length);
		console.log(" not processing, nothing left to clean")
		loopflag = false;
	}
	while (loopflag == true) {
		//	need to check for;
		//		<b> tags, used in handles in the form;
		//			"@<b>everysnake</b>"
		//		<a> tags, main links, images, other users, etc.
		//		<span>, I've seen it in some tweets, not sure on usage
		//		<img> tags for user profile pictures

		//	get the tag
		//	todo; need to get index of angles AFTER value of (last + len
		//		this would actually cancel out recursion idea, and is 
		//first = squeeky.indexOf('<');
		//second = squeeky.indexOf('>');
		//	to continue on to next tag after a cst tag
		first = squeeky.substr(chugger).indexOf('<') + chugger;
		second = squeeky.substr(chugger).indexOf('>') + chugger;
		tag = "";

		//	adding one to first to check everything after the <
		first++;
		//	getting the actual tag, i.e. <a href=...., take just the a
		while ((first < second) && (squeeky.charAt(first) != ' ')) {
			//console.log("chtml, char at; " + first + "; is; " + squeeky.charAt(first));
			tag += squeeky.charAt(first);
			first++;
		}

		//	get the closign tag 'last'
		//last = squeeky.indexOf("</" + tag + ">");
		//last = squeeky.substr(chugger).indexOf("</" + tag + ">") + chugger;
		//	looks like we've slipped a rung on the sanity ladder
		//last = chugger + (squeeky.substr(chugger).length - (squeeky.substr(chugger).split("").reverse().join("").indexOf(("</" + tag + ">").split("").reverse().join("")) + ("</" + tag + ">").length));
		//	yeah pure madness
		//		feel like I should definitely figure out recursion
		if (tag == "img") {
			last = second;
		} else {
			last = squeeky.substr(chugger).indexOf("</" + tag + ">") + chugger;
		}


		//console.log("frst; " + first + "; scnd; " + second);
var sizeflag = 50;
//if ((chugger > 0) || ((last - second) > sizeflag)) {
	console.log(" tot text is; " + replaceSpace(squeeky));
	console.log(" sub text is; " + replaceSpace(squeeky.substr(chugger)));
	console.log("  first < is; " + padSpace(first - 2 - chugger));
	console.log(" second > is; " + padSpace(second - chugger));
	console.log(" 1st lst tag; " + padSpace(last - chugger));
	console.log(" first; "+(first-2)+"; second;"+second+"; last;"+last+"; length; " + squeeky.length + "; and count for this message check is last - second; "+(last-second)+"; at " + sizeflag);
//}

		//	check for nested tags, i.e.
		//		<span ...><span ....>something</span></span>
		if ((squeeky.substr(second + 1).indexOf("<" + tag)) >= 0) {

console.log("  prefugg text; " + squeeky.substr(second + 1));
console.log("    where <tag; " + padSpace(squeeky.substr(second + 1).indexOf("<" + tag), ("<" + tag)));

			var ffugger = (squeeky.substr(second + 1).indexOf("<" + tag)) + (second + 1);

			//	effectively, < exists (greater than 0 i.e. second+1, and
			//		fugger is less than last, so doesn't overrun
			while ((ffugger >=  (second + 1)) && (ffugger < last)) {
	console.log(" fugg text f;" + squeeky);
	console.log("  fugg first;" + padSpace(ffugger));
	console.log("   just last;" + padSpace(last));

				//	little bit more madness, maybe it's recursion
				var squ = squeeky.slice(0, ffugger);
				var eee = squeeky.slice(ffugger, (last + ("</"+tag+">").length));
				var key = squeeky.slice((last + ("</"+tag+">").length), squeeky.length);
				//	send off the questionable bit
				var ee = cleanHTML(eee);
//console.log("  squ ; " + squ);
//console.log("  ee ; " + ee);
//console.log("  eee ; " + eee);
//console.log("  key ; " + key);
console.log("  old squee ; " + squeeky);
				squeeky = "" + squ + "" + ee + "" + key + "";

				//	not actually sure if this substr produces a 
				//		char 0 of "content" or of ">content", but 
				//		doesn't really matter
console.log(" old last is; " + padSpace(last, "^"+last+""));
				//
				//last = squeeky.substr(last + ("</" + tag + ">").length).indexOf("</" + tag + ">") + chugger;

console.log("      second; " + padSpace(second, "|"+second+""));

//console.log(" new fugg is; " + padSpace(ffugger, "^"+ffugger+""));
console.log("  new squee ; " + squeeky);

				ffugger = (squeeky.substr(ffugger + 1).indexOf("<"+tag)) + ffugger + 1;
				if (squeeky.substr(ffugger + 1).indexOf("<"+tag)) {
					console.log("no more tags, fugg over");
					break;
				}
console.log(" fuckufckufuckfucukfkcufk " + (squeeky.substr(ffugger + 1).indexOf("<"+tag)) + " + " + ffugger + " + 1");
console.log("   chkstr; " + squeeky.substr(ffugger + 1));
console.log("        <; " + padSpace(squeeky.substr(ffugger + 1).indexOf("<" + tag), "<"+tag));
console.log(" fuckufckufuckfucukfkcufk");
				last = (squeeky.substr(ffugger).indexOf("</"+tag+">")) + ffugger;
				//last -= (eee.length - ee.length);
				//last = ();
	console.log("  fugg after;" + padSpace(ffugger, "^"+ffugger+""));
	console.log("    new last;" + padSpace(last, "^"+last+""));
	console.log("  goes on while ; f ("+ffugger+") >= s+1 ("+(second+1)+")");
	console.log("            and ; f ("+ffugger+") < 1ast ("+last+")");
			}
		}

		//console.log(" got tag; " + tag);
		//	get the tag ATTRIBUTES in the case of the above tag ending
		//		on a " " space rather than a close angle bracket >
		while (squeeky.charAt(first) == " ") {
			console.log("  " + tag + " tag has attributes, searching...");
			first++;
			ref = "";
			//	getting attrubute name
			while (squeeky.charAt(first) != "=") {
				ref += squeeky.charAt(first);
				first++;
			}
			console.log(" found attr; " + ref);
			//	attribute is href, get link url and text


			/*	this is the attribure check / process
			*/
			if (ref == "class") {
				//	checking emojis
				first += 2;	//	skip the = and the "
				reflink = "";
				while (squeeky.charAt(first) != "\"") {
					//console.log("gettin ref, char " + first + " is; " + squeeky.charAt(first));
					reflink += squeeky.charAt(first);
					first++;
				}
				console.log(" " + ref + " val; " + reflink);
				if (reflink == "Emoji Emoji--forLinks") {
					//	going to do a html img for emoji's
					//		<img src="https...." width height style
					//			alt text (class ?)> 
					//	todo; aww shit time to recurse for the emoji's;
					//		run the cleanHTML on the span emoji class
					//			to get the attribute 
					//		actually recursion might not be the best to
					//			implement as a default because of this
					//			one fringe case, think it might be
					//			easier to just cycle through other attrs
					//			from here to get 'style' and 'title'
					console.log(" got an emoji, getting other attr's");
					//	this is a bit manky
					refflag = "emoji";
					//	setting up so that the attribute while has to do
					//		another cycle and pick up on the emoji deets
					while (squeeky.charAt(first) != " ") {
						//console.log("next attr char; " + squeeky.charAt(first));
						first++;
					}
				} else if (reflink == "Emoji Emoji--forText") {
					console.log(" got a text emoji, getting other attr's");
					//	this is a bit manky
					refflag = "emojitxt";
					//	setting up so that the attribute while has to do
					//		another cycle and pick up on the emoji deets
					while (squeeky.charAt(first) != " ") {
						//console.log("next attr char; " + squeeky.charAt(first));
						first++;
					}
				} else if ( (reflink == "link-cst")
					|| (reflink == "emoji-cst") 
					|| (reflink == "image-cst") ){
					//	these are all good, need to jump to next tag
					refflag = "cst";
				}
			} else if (ref == "href") {
				//console.log("got a href=");
				first += 2;	//	skip the = and the "
				reflink = "";
				while (squeeky.charAt(first) != "\"") {
					//console.log("gettin ref, char " + first + " is; " + squeeky.charAt(first));
					reflink += squeeky.charAt(first);
					first++;
				}
				if (reflink.charAt(0) == "/") {
					console.log(" got twtter relative link; " + reflink + "; changing");
					reflink = "https://twitter.com" + reflink;
				}
				console.log(" href; " + reflink);
				//	get the link text i.e. <a ...>thisTextHere</a>
				//reftext = squeeky.slice(second + 1, last);
console.log(" rftext bad; " + replaceSpace(squeeky));
console.log(" slice from; " + padSpace(second + 1));
console.log("   up until; " + padSpace(last));
				console.log(" got ref text; " + squeeky.slice(second + 1, last));
				reftext = cleanHTML(squeeky.slice(second + 1, last));
				console.log(" new ref text; " + reftext);
				//	links relative to twitter
			} else if ((ref == "style") && (refflag == "emoji")) {
				//	reflink
				first += 2;	//	skip the = and the "
				reflink = "";
				//	skipping ahead to link signifier; ' (single quote)
				while (squeeky.charAt(first) != "'") {
					first++;
				}
				first++;
				//	taking everything within the single quotes
				while (squeeky.charAt(first) != "'") {
					//console.log("gettin ref, char " + first + " is; " + squeeky.charAt(first));
					reflink += squeeky.charAt(first);
					first++;
				}
				console.log(" reflink val; " + reflink);
				//	resetting to get next attribute through while loop
				while ( (first < second) 
					&& (squeeky.charAt(first) != " ") ) { 
					first++;
				}
			} else if ((ref == "title") && ((refflag == "emoji") || (refflag == "emojitxt"))) {
				//	reftext
				first += 2;	//	skip the = and the "
				reftext = "";
				//	skipping ahead to link signifier; ' (single quote)
				while (squeeky.charAt(first) != "\"") {
					reftext += squeeky.charAt(first);
					first++;
				}
				console.log(" reftext val; " + reftext);
				while ( (first < second) 
					&& (squeeky.charAt(first) != " ") ) { 
					first++;
				}
			} else if ((ref == "src") && (refflag == "emojitxt")) {
				//	reflink
				first += 2;	//	skip the = and the "
				reflink = "";
				//	skipping ahead to link signifier; ' (single quote)
				while (squeeky.charAt(first) != "\"") {
					reflink += squeeky.charAt(first);
					first++;
				}
				console.log(" reflink val; " + reflink);
				while ( (first < second) 
					&& (squeeky.charAt(first) != " ") ) { 
					first++;
				}
			} else {
				//	unaccounted attribute
				//	go to the next attribute
				while (squeeky.charAt(first) != "\"") {
					first++;
				}
				//	off the " and on to the space, to continue the 
				//		attribute loop
				first++;
			}
		}


		//	reset 'first' to first instance of the left angle bracket
		//		MAKE SURE this doesn't take the second angle bracket or
		//		something weird
		first = squeeky.substr(chugger).indexOf('<') + chugger;

		/*	handle different types of tags, this will get messy
		*/
		//	switch (tag) { case 'b': squeeky replace; break; case: }
		if ( (tag == "b") || (tag == "s") ) {
			//	twitter user handles use b tags
			squeeky = squeeky.replace("<" + tag + ">","");
			squeeky = squeeky.replace("</" + tag + ">","");
			//	'last' going to be used for multiple tag situations
			last -= ("<"+tag+">").length;
		} else if ((tag == "a") || (tag == "/a")) {
			if (refflag == "cst") {
				//	all good, ignore, skip to next tag
				//	'last' should actually still be fairly relevant
				//		no changes needed for that
				console.log(" this is a cst a tag, ignoring");
			} else {
				//	double think on this, you need to retain full text in
				//		case of multiple links
				//squeeky = squeeky.replace("</a>","");
				//	sq = sq(0 to first) + (new a ref tag) + sq(second to end
				var ahref = "<a class=\"link-cst\" href=\"" + reflink;
				ahref += "\" target=\"_blank\">" + reftext + "</a>";

				//	todo; definitely redo this with proper values in mind
				//		also change to slices of originally passed string
				//		maybe change the whole project to them, I was 
				//		anticipating more in-place editing
				//squeeky = (squeeky.slice(0,first)) + ahref + (squeeky.slice(second + 1, last));
				//	set up to continue right instead of returning
//	checking stirng
console.log("  og string is; " + replaceSpace(squeeky));
//console.log("current last; " + padSpace(last));
//console.log(" current lend; " + padSpace(last + ("</" + tag + ">").length));


console.log("   sq slc 0to1; " + replaceSpace(squeeky.slice(0, first)));
console.log("      sq ahref; " + ahref);
console.log(" sq slc to end; " + (squeeky.slice((last + ("</" + tag + ">").length), squeeky.length)));

				squeeky = (squeeky.slice(0, first)) + ahref + (squeeky.slice((last + ("</" + tag + ">").length), squeeky.length));
				last = squeeky.slice(0, first).length + ahref.length;


console.log("  nu string is; " + replaceSpace(squeeky));
//console.log(" current last; " + padSpace(last));
//console.log("current lend; " + padSpace(last + ("</" + tag + ">").length));
				//chugger = lest;
				//chugger = last;

				//	retaining an angel bracket tag, so main loop is going to
				//		go infinite if allowed to check, so returning the
				//		value straight from here
				//	todo; definite consideration to make is multiple links
				//		gonna be twitter style, won't work here
				//console.log("returning; " + squeeky + "\ndone cleaning");
				//return squeeky;

				//console.log(" did a href, cur line is; " + replaceSpace(squeeky));
			}
		} else if (((tag == "span") && (refflag == "emoji")) 
			|| ((tag == "img") && (refflag == "emojitxt"))) {

			var emojiref = "<img class=\"emoji-cst\" ";
			//	need to implement this across the actual lines and that
			//		o wait
			//		implement this on the website's css, not hard coded
			//		glad I realised that
			//if (htmlstyle != null) {
			//	emojiref += "style=\"" + htmlstyle + "\" ";
			//}
			emojiref += "alt=\"" + reftext + "\" ";
			emojiref += "src=\"" + reflink + "\">";
			console.log(" sq sl 0 frst; " + squeeky.slice(0, first));
			console.log(" sq emojirefr; " + emojiref);
			console.log(" sq sl scnd l; " + (squeeky.slice((last + ("</" + tag + ">").length), squeeky.length)));

			//	the emoji tag has a symbol value in to to get rid of,
			//		also need to take everything after 'last' (+ len)
			//squeeky = (squeeky.slice(0,first)) + emojiref + (squeeky.slice(second + 1, last));
			//squeeky = (squeeky.slice(0,first)) + emojiref;
			squeeky = (squeeky.slice(0,first)) + emojiref + (squeeky.slice((last + ("</" + tag + ">").length), squeeky.length));
			//	last going to be used for next tag calc
			last = squeeky.slice(0,first).length + emojiref.length;

			//	retaining an angel bracket tag, so main loop is going to
			//		go infinite if allowed to check, so returning the
			//		value straight from here
			//	todo; definite consideration to make is multiple links,
			//		gonna be twitter style, won't work here
			//console.log("returning; " + squeeky + "\ndone cleaning");
			//return squeeky;

			//console.log(" did an emoji, cur line is; " + squeeky);
		} else if (tag == "span") {
			//	as far as I've seen, span's that aren't emojis are
			//		useless and should be cut

			//	this line will retain the content inside the span tag
			//		but miss out on everything after the first set tags
			//squeeky = (squeeky.slice(0,first)) + (squeeky.slice(second + 1, last));

			//	this will take before the span and after the span,
			//		ignoring the contents of the tag
			squeeky = (squeeky.slice(0,first)) + (squeeky.slice((last + ("</" + tag + ">").length), squeeky.length));
			last = squeeky.slice(0,first).length;
			//console.log("returning; " + squeeky + "\ndone cleaning");
			//return squeeky;
			//console.log(" removed a span, cur line is; " + squeeky);
		} else if ((tag == "img") && (refflag == "cst")) {
			//	that's good, do nothing
			console.log(" got a cst image, continuing");
		} else if ((tag == "img") 
				&& (reflink == "avatar js-action-profile-avatar")) {
			console.log("got a profile pic div");
			//	trying to get jusst the img src link
			//	indexof to find a string
			console.log(" squee; " + replaceSpace(squeeky));
			console.log(" ind s;" + padSpace( squeeky.indexOf("src=\"", 0) + 5));
			console.log(" meta ;" + padSpace(squeeky.indexOf("\"", squeeky.indexOf("src=\"", 0) + 5)));
			//console.log("ind of src=\";" + squeeky.indexOf("src=\"", 0));
			//console.log("squeeky is; " + squeeky);
			squeeky = squeeky.slice(
				(squeeky.indexOf("src=\"", 0) + 5),
				(squeeky.indexOf("\"", squeeky.indexOf("src=\"", 0) + 5))
			);
			console.log("new squeek; " + squeeky);
			//margin-bottom:0.5em;
			//margin-top:1em;
			//squeeky = "<img class=\"image-cst\" style=\"width:16px;height:16px;\" src=\"" + squeeky + "\">";
			//style="margin-bottom: 0.5em;" width="16px" height="16px" align="middle"
			squeeky = "<img class=\"image-cst\" style=\"margin-bottom:0.5em;\" width=\"16px\" height=\"16px\" align=\"middle\" src=\"" + squeeky + "\">";
		} else {
			console.log(" don't know how to deal with tag; " + tag);
			console.log("FAILed cleaning");
			return "fail on " + tag;
		}

		//console.log(" did a " + tag + " tag, cur line is; " + replaceSpace(squeeky));
		console.log(" did a " + tag + " tag");

		/*	prepare loop flag
		*/
		//	reset ref tags
		ref = "";
		reflink = "";
		reftext = "";
		refflag = "";
		//	chugger to get to next tag ok
		//chugger = (last + ("</" + tag + ">").length);

		//	necessary, don't mess with
		//		wait maybe not
		//		wait yeah, it is
		chugger = last;


if (chugger < squeeky.length) {
	console.log("  og text is; " + replaceSpace(someHTML));
	console.log(" the text is; " + replaceSpace(squeeky));
	console.log(" chugger len; " + padSpace(chugger));
	console.log("    last len; " + padSpace(last));
	console.log(" chugger; " + chugger + " out of " + squeeky.length);
	console.log(" chug txt is; " + squeeky.substr(chugger));
	console.log("    any <'s ; " + padSpace(squeeky.substr(chugger).indexOf('<')));
}

//console.log("chugger new; " + padSpace(chugger));
//console.log("chgr as last only; " + chugger);
//console.log("chgr as last only char; " + squeeky.charAt(chugger));
		if ((squeeky.substr(chugger).indexOf('<') >= 0) && (chugger < squeeky.length)) {
			loopflag = true;
		} else {
			loopflag = false;
		}
	}
	console.log(" returning; " + squeeky + "\ndone cleaning");
	return squeeky;
}

/*	htmolest a tweet, handes twitter html pages to get tweets out
**		input's; rawTwatShite is just whatever html comes out of a 
**			twitter link, format is the desired output, see below
**		output's a bunch of tweet's in a specified format of either
**			json, html, or text, html can be marquee'd and is kind of 
**			hardcode formatted and weird for the moment, very specific
**			to usage on rolling headlines page
*/
function htmlestATweet(rawTwatShite, format = "json") {
	/*	twitter structure
	**
	**	so the class "js-tweet-text-container" contains a p tag with the
	**		tweet in it
	**	the parent element of "js-tweet-text-container" contains the
	**		other (relevant) classes;
	**		user/source;
	**			"stream-item-header" > "account-group js-account-group js-action-profile js-user-profile-link js-nav"
	**			-> "avatar js-action-profile-avatar"
	**			-> "FullNameGroup" > "fullname show-popup-with-id u-textTruncate "
	**			-> "username u-dir u-textTruncate"
	**			-> "stream-item-header" > "time"
	**		replies, rt's, favourite's;
	**			"stream-item-footer" > "ProfileTweet-actionCountList u-hiddenVisually"
	**			-> "ProfileTweet-action--reply u-hiddenVisually"
	**			-> "ProfileTweet-action--retweet u-hiddenVisually"
	**			-> "ProfileTweet-action--favorite u-hiddenVisually"
	**
	**	watchout for retweets / replies / likes, they just show up as
	**		someone else's tweet on the timeline at the moment, maybe
	**		do a status similar to "tweeted", "retweeted", etc. 
	**		operative status being "tweeted" for originally tweeted
	*/

	console.log("starting to parse tweet html now")
	//	return messages
	var output;
	//	html data, jsdom style
	const dom = new JSDOM(rawTwatShite);

	//	easy reference point for tweet text, it does get messy with 
	//		parent children elements either way though
	var classes = dom.window.document.getElementsByClassName("js-tweet-text-container");

	//	convinence variable
	var header;
	//	meta details of tweet, used for situations such as;
	//		trump retweets a cnn article, in that case;
	//		status == "retweet", puser == "realdonaldtrump", puserimg...
	//		username == "CNN", fullname == "CNN", tweet == "CNN's"
	//	todo; this status method still needs to be implemented
	var status, puser, puserimg;
	//	tweet id, tweet's local time, and epoch time
	var id, time, epoch;
	//	focused (i.e. "tweet" or "retweet") details;
	//		tweet's user, tweet, and stats (replies, rt's, etc.)
	var username, fullname, userimg, tweet;
	var replies, retweets, likes;


	if (format == "json") {
		output = {
			reqtime : Date.now(),
			twts : []
		}
	} else if (format == "html") {
		var marquee = true;
		if (marquee) {
			output = "<div><marquee class=\"slider-cst\" behaviour=\"slide\" direction=\"left\" scrollamount=\"5\" scrolldelay=\"1\">";
		}
	} else if (format == "text") {
		output = "";
	} else {
		output = "";
	}

	//	cycle through tweets to get deets
	for (var i = 0; i < classes.length; ++i) {

		console.log("--tweet " + i + " of " + classes.length);
		//	print out all elemets of tweet for debug purposes
		for (var j = 0; j < classes[i].parentElement.children.length; ++j) {
			/*	there's how to do links / quotes / pictures or whatever 
			**		in tweets, check length of 
			**		classes[i].parentElement.children, if greater 
			**		than 3 (header, tweet-text, xxx, n xxx, footer)
			*/
			console.log("clss " + j + "; " + classes[i].parentElement.children[j].className);
		}
		console.log("tweet elements; " + classes[i].parentElement.children.length);

		//	tweet id
		id = classes[i].parentElement.parentElement.getAttribute("data-item-id");
		console.log("got tweet id; " + id);

		header = classes[i].parentElement.getElementsByClassName("stream-item-header")[0].getElementsByClassName("account-group js-account-group js-action-profile js-user-profile-link js-nav")[0];

		//	getting user handle
		username = header.getElementsByClassName("username u-dir u-textTruncate")[0].innerHTML;
		//	they use b and s tags on usernames
		username = cleanHTML(username);
		console.log("got username; " + username);

		//	getting user's fullname
		fullname = header.getElementsByClassName("FullNameGroup")[0].getElementsByClassName("fullname show-popup-with-id u-textTruncate ")[0].innerHTML;
		fullname = cleanHTML(fullname);
		console.log("got fullname; " + fullname);

		//	getting user picture
		userpic = header.getElementsByClassName("avatar js-action-profile-avatar")[0].getAttribute("src");
		//console.log("usr pc div keys; " + getKeys(header.getElementsByClassName("avatar js-action-profile-avatar")[0]));
		//console.log("usr pc div; " + header.getElementsByClassName("avatar js-action-profile-avatar")[0]);
		//console.log("usr pc div outr; " + header.getElementsByClassName("avatar js-action-profile-avatar")[0].outerHTML);
		userpic = cleanHTML(header.getElementsByClassName("avatar js-action-profile-avatar")[0].outerHTML);
		console.log("got userpic; " + userpic);

		//	getting tweet
		tweet = classes[i].firstElementChild.innerHTML;
		//	todo; get any links in the tweet and reformat to be nice;
		//		i.e. work on the cleanHTML function
		tweet = cleanHTML(tweet);
		console.log("got tweet; " + tweet);

		//	time of tweet, time is local, epoch is usable
		header = classes[i].parentElement.getElementsByClassName("stream-item-header")[0].getElementsByClassName("time")[0].getElementsByClassName("tweet-timestamp js-permalink js-nav js-tooltip")[0];
		time = header.getAttribute("title");
		epoch = header.getElementsByClassName("_timestamp js-short-timestamp ")[0].getAttribute("data-time");	
		console.log("got time; " + time + "; epoch; " + epoch);

		//	accessing the footer to get retweets etc.
		header = classes[i].parentElement.getElementsByClassName("stream-item-footer")[0].getElementsByClassName("ProfileTweet-actionCountList u-hiddenVisually")[0];

		//	getting reply count
		replies = header.getElementsByClassName("ProfileTweet-action--reply u-hiddenVisually")[0].getElementsByClassName("ProfileTweet-actionCount")[0].getElementsByClassName("ProfileTweet-actionCountForAria")[0].innerHTML;
		console.log("got replies; " + replies);

		//	getting retweet count
		retweets = header.getElementsByClassName("ProfileTweet-action--retweet u-hiddenVisually")[0].getElementsByClassName("ProfileTweet-actionCount")[0].getElementsByClassName("ProfileTweet-actionCountForAria")[0].innerHTML;
		console.log("got retweets; " + retweets);

		//	getting tweet's like count
		likes = header.getElementsByClassName("ProfileTweet-action--favorite u-hiddenVisually")[0].getElementsByClassName("ProfileTweet-actionCount")[0].getElementsByClassName("ProfileTweet-actionCountForAria")[0].innerHTML;
		console.log("got likes; " + likes);


		//	format output values
		//	fyi this will output html links (a) and images (img)
		if (format == "json") {
			//	replacing reply / retwt / like text with just a number
			//		thats the replace function below
			output.twts.push({
				id : id, 
				username : username, 
				fullname : fullname,
				userpic : userpic, 
				tweet : tweet,
				time : time, 
				epoch : epoch, 
				replies : replies.replace(/[^0-9]/g, ''),
				retweets : retweets.replace(/[^0-9]/g, ''),
				likes : likes.replace(/[^0-9]/g, '')
			});
		} else if (format == "html") {
			/*	current html format (rolling headlines 2018-12-03)
			**		<marquee behaviour="slide" direction="left" scrollamount="5" scrolldelay="1">
			**			(<img src="news/thejournal_ie/favicon.ico" style="margin-bottom: 0.5em;" width="16px" height="16px" align="middle">   <a href="http://www.thejournal.ie/heres-what-happened-today-monday-28-4373967-Dec2018/" target="_blank">[Here's What Happened Today: Monday ]</a><p>   Rise in rough sleepers, Brexit legal advice and an English language college closing had everyone talking today.</p>)
			**			(<img src="news/thejournal_ie...
			**			...
			**		</marquee>
			*/

			//output += "[ " + fullname + " (" + twitterfy(username);
			output += "[" + userpic + " " + twitterfy(username, fullname);
			//output += " " + userpic + ")";
			output += " | " + twitterfy(id, tweet) + " | ";
			//output +=  " | " + tweet + " | ";
			//output += replies + ", " + retweets + ", " + likes;
			//output += replies.replace(/[^0-9]/g, '') + " rp's, ";
			output += prettyNumber(replies.replace(/[^0-9]/g, '')) + " rp's, ";
			output += prettyNumber(retweets.replace(/[^0-9]/g, '')) + " rt's, ";
			output += prettyNumber(likes.replace(/[^0-9]/g, '')) + " lk's\n";
			output += " ]   ";

		} else {
			//	return plain text for unknowns (including "text")
			output += "\n---\n" + id + " | " + fullname;
			output += " (" + username + "); " + tweet + "; ";
			//output += replies.replace(/[^0-9]/g, '') + "rp's, " + retweets.replace(/[^0-9]/g, '') + "rt's, " + likes.replace(/[^0-9]/g, '') + "lk's\n";
			output += replies + ", " + retweets + ", " + likes + "\n";
		}
	}

	if ((format == "html") && (marquee == true)) {
		output += "</marquee></div>";
	}
	console.log("finishing html tweet parse now")
	return output;
}


/*	help message, basic text describing functionality
*/
function helpMessage(type="full") {
	var message;

	message = "NEWSR.NODE\n";
	message += "\ta node for news"
	message += "\t\tparses html (and rss) like an incoherent cokehead ";
	message += "figuring out a dvd player\n";
	message += "usage;\n";
	message += "\tnewsr.node/[protocol]?([user/link]),(options)\n";
	message += "e.g.\n";
	message += "\tnewsr.node/twt?username\n";
	message += "\tnewsr.node/twitter?realDonaldTrump\n";
	message += "\tnewsr.node/twitter?countDankulaTV,format=json\n";

	return message;
}


function parseRIPs(rawRIPs, format="json") {
	var message = "";
	
	return message;
}
/*	actual server,      ENTRY POINT ------------------------------------
*/
const server = http.createServer((req, res) => {
	//	print request url to log
	console.log("starting up at; " + Date.now().toString());
	console.log("request is; " + req.url);
	//	going to be dicking with url's soon

	//	healthy result anyway
	res.statusCode = 200;
	res.setHeader('Content-Type', 'text/plain');

	//	main page, send back a help message
	if (req.url == '/') {
		var message = "nothing provided, try again\n" + helpMessage();
		console.log("printing help message");
		res.end(message);
	} else {
		//	a request supplied via url
		//	taking the first char (slash) off the request
		var url = req.url.substr(1);

		//	request checking, implementing protocol
		//		twt		twitter
		//			usr	user
		//		rss		rss
		//			url	url
		//	in the format;
		//		cst.node/twt?usr=everysnake
		//		cst.node/rss?url=realdonaldtrump

		//	everything before ?
		var proto = url.slice(0, url.indexOf("\?"));
		//	everything after ?
		var reqstr = url.substr(url.indexOf("\?") + 1);
		//	todo; test with multiple ?'s (???)
		console.log("got a request for; " + proto + ", and; " + reqstr);

		var message = "";

		if ((proto == "twt") || (proto == "twitter")) {
			url = "https://twitter.com/" + reqstr;
			console.log("getting some tweets from; " + url);
			getURL(url, function(out){
				console.log("running callback on html request");
				//	todo; find out how res end does it's do, maybe send 
				//		a full packaged html

				//message = htmlestATweet(out, "text");
				message = htmlestATweet(out, "html");
				res.end(message);
			});
		} else if (proto == "rss") {
			message = "well then I'd do something rss related";

		} else if ((proto == "rip") || (proto == "rip.ie") || (proto == "ripie")) {
			//	only does the latest rip.ie notices
			url = "https://rip.ie/Deathnotices";
			console.log("getting some death notices from; " + url);
			getURL(url, function(out){
				console.log("running callback on html request");
				message = parseRIPs(out, "html");
				res.end(message);
			});
		} else {
			message = "can't go wrong with a NEWSR.NODE ";
			message += "(don't know what to do with " + req.url + ")";
		}
		//	send that message to the user
		res.end(message);
	}
});
//	actual entry point
server.listen(port, hostname, () => {
  console.log(`NEWSR.NODE running at http://${hostname}:${port}/`);
  console.log(new Date().getTime());
});
