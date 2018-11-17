/*	newsr_node.js
**	a node js site to act like a rest api for getting news,
**		in tweets and in rss
**	branched out of the cst_node.js which should be a viewing component
**		with react or similar
**	CST, originally started 5 Nov 2018, branched 17 Nov 2018
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
//	jquery functions on node, better than regex for the moment
//var cheerio = require('cheerio');
//	jsdom ...
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
//	saving files
const fs = require('fs');




/*	functions
*/

//	getURL, to get a url, using xmlhttprequest
function getURL(url, callback) {
	console.log("getting url; " + url + "; now");
	var request = new XMLHttpRequest();
	request.open("GET", url, false);
	//	some issues with character sets, think it's good w/ iso
	request.setRequestHeader ("Accept", "text/xml; charset=iso-8859-1");
	request.onreadystatechange = function() {
		if (request.readyState == 4) {
			console.log("status; " + request.status);
			if (request.status == "200") {
				//console.log("successful 200 response; " + request.responseText);
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

var getKeys = function(obj){
   var keys = [];
   for(var key in obj){
      keys.push(key);
   }
   return keys;
}

//	get tweet's link
//		people seem to tweet links as a tweet's centre piece (or photos,
//		but can treat the same way) but the tweet format has very long
//		html tag attributes etc., need to strip to basic <a> tag
function getTweetsLink(tweet) {
	//	check for html tags, get attributes
}

//	htmolest a tweet, handes twitter html pages to get tweets out
function htmolestATweet(rawTwatShite, format = "json") {
console.log("starting to parse tweet html now")
	//	return message
	var mess;
	var hot = "empty";

	//	works on cst.com to get main banner
	const dom = new JSDOM(rawTwatShite);

	var classes = dom.window.document.getElementsByClassName("js-tweet-text-container");
	/*
	if (classes != undefined) {
		try {
			console.log("classes; " + JSON.stringify(classes));
			console.log("class 0; " + JSON.stringify(classes[0]));
			console.log("class 0 keys; " + getKeys(classes[0]));
			console.log("first cihle; " + classes[0].firstElementChild);
			console.log("first childer keys; " + getKeys(classes[0].firstElementChild));
			console.log("parent; " + classes[0].parentElement);
			console.log("parent keys; " + getKeys(classes[0].parentElement));
			console.log("parent class; " + JSON.stringify(classes[0].parentElement.className));
			console.log("parent id; " + JSON.stringify(classes[0].parentElement.id));
			var childers = classes[0].parentElement.children;
			console.log("parent childers; " + JSON.stringify(childers));
			for (var i = 0; i < childers.length; ++i) {
				console.log("childer" + i + " id; " + JSON.stringify(childers[i].id));
				console.log("childer" + i + " class; " + JSON.stringify(childers[i].className));
			}
		} catch(err) {
			console.log("got an err; " + err);
		}
	}
	*/


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
	*/

	var header;
	var username;
	var fullname;
	var tweet;
	var time;
	var replies;
	var retweets;
	var likes;

	hot = "";
	mess = {
		time : Date.now(),
		twts : []
	}

	for (var i = 0; i < classes.length; ++i) {

console.log("--tweet " + i + " of " + classes.length);
for (var j = 0; j < classes[i].parentElement.children.length; ++j) {
	/*	there's how to do links / quotes / pictures or whatever in 
	**		tweets, check length of classes[i].parentElement.children, 
	**		if greater than 3 (header, tweet-text, xxx, n xxx, footer)
	*/
	console.log("clss " + j + "; " + classes[i].parentElement.children[j].className);
}
console.log("tweel elms; " + classes[i].parentElement.children.length);
		header = classes[i].parentElement.getElementsByClassName("stream-item-header")[0].getElementsByClassName("account-group js-account-group js-action-profile js-user-profile-link js-nav")[0];

		username = header.getElementsByClassName("username u-dir u-textTruncate")[0].innerHTML;
		//	they put <b> tags on the handle on the twitter site
		username = username.replace("<b>","");
		username = username.replace("</b>","");
console.log("got username; " + username);

		fullname = header.getElementsByClassName("FullNameGroup")[0].getElementsByClassName("fullname show-popup-with-id u-textTruncate ")[0].innerHTML;
console.log("got fullname; " + fullname);

		tweet = classes[i].firstElementChild.innerHTML;
console.log("got tweet; " + tweet);
		//	todo; get any links in the tweet and reformat to be nice

		//	time
		header = classes[i].parentElement.getElementsByClassName("stream-item-header")[0].getElementsByClassName("time")[0].getElementsByClassName("tweet-timestamp js-permalink js-nav js-tooltip")[0];
		time = header.getAttribute("title");
		epoch = header.getElementsByClassName("_timestamp js-short-timestamp ")[0].getAttribute("data-time");	
console.log("got time; " + time + "; epoch; " + epoch);

		//	accessing the footer to get retweets etc.
		header = classes[i].parentElement.getElementsByClassName("stream-item-footer")[0].getElementsByClassName("ProfileTweet-actionCountList u-hiddenVisually")[0];

		replies = header.getElementsByClassName("ProfileTweet-action--reply u-hiddenVisually")[0].getElementsByClassName("ProfileTweet-actionCount")[0].getElementsByClassName("ProfileTweet-actionCountForAria")[0].innerHTML;
console.log("got replies; " + replies);

		retweets = header.getElementsByClassName("ProfileTweet-action--retweet u-hiddenVisually")[0].getElementsByClassName("ProfileTweet-actionCount")[0].getElementsByClassName("ProfileTweet-actionCountForAria")[0].innerHTML;
console.log("got retweets; " + retweets);

		likes = header.getElementsByClassName("ProfileTweet-action--favorite u-hiddenVisually")[0].getElementsByClassName("ProfileTweet-actionCount")[0].getElementsByClassName("ProfileTweet-actionCountForAria")[0].innerHTML;
console.log("got likes; " + likes);





		//	replies, rt's etc. are currently stored in text, i.e.;
		//		replies = "20,000 replies"
		//	leaving it for the moment, but that string.replace() funct
		//		apparently takes regex, soooo replies.replace("/[^0-9]/g, '')
//console.log( replies.replace(/[^0-9]/g, '') + " is just a number, I checked" );

		hot += "\n---\n" + fullname + " (" + username + "); " + tweet + "; " + replies + ", " + retweets + ", " + likes + "\n";
		mess.twts.push({
			username : username,
			fullname : fullname,
			tweet : tweet,
			time : time,
			epoch : epoch, 
			replies : replies,
			retweets : retweets,
			likes : likes
		});
		//console.log(JSON.stringify(mess.twts[i]));
	}
	console.log("finishing html tweet parse now")

	if (format == "text") {
		return hot;
	} else {
		return mess;
	}
}
/*
function htmlFormatTweets(tweets) {
	var message = "";
	var delim = "\n---\n";
	for (var i = 0; i < tweets.length; ++i) {
		message += tweets[i].fullname + " (" + tweets[i].username + ") " + tweets[i].
	}
	return message;
}
*/

/*	actual server,      ENTRY POINT ------------------------------------
*/
const server = http.createServer((req, res) => {
	//	print request url
	console.log("starting up at; " + Date.now().toString());
	console.log("request is; " + req.url);
	//	going to be dicking with url's soon

	//	healthy result anyway
	res.statusCode = 200;
	res.setHeader('Content-Type', 'text/plain');

	//	main cst.node page, just return name
	if (req.url == '/') {
		var message = "CONOR STEFANINI .NODE\nnothing provided, use "
		message += "the format /twt?username"
		console.log("serving the message; " + message);
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
		var u = url.substr(url.indexOf("\?") + 1);
		//	todo; test with multiple ?'s (???)
		console.log("got a request for; " + proto + ", and; " + u);

		if (proto == "twt") {
			url = "https://twitter.com/" + u;
			console.log("getting some tweets from; " + url);
			getURL(url, function(out){
				console.log("running callback on html request");
				//	todo; find out how res end does it's do, maybe send 
				//		a full packaged html
				//res.end("finishing that callback; \n" + out + "\n; (that was it)\n");

/*
				//	saving response
				var file = "/temp";
				fs.writeFile(file, out, function(err) {
					if (err) {
						console.log("error saving file; " + file);
						console.log("error message; " + err);
						return console.log(err);
					}
					console.log("the file; " + file + " was saved");
				});
*/

				var message = htmolestATweet(out, "text");
				//console.log(JSON.stringify(message));
				//res.end(JSON.stringify(message));
				res.end(message);
			});
		} else if (proto =="rss") {
			res.end("well then I'd do something rss related");
		} else {
			res.end("can't go wrong with a CONOR STEFANINI .NODE (not going to do anything with " + req.url + ")");
		}

	}
});
//	actual entry point
server.listen(port, hostname, () => {
  console.log(`CONOR STEFANINI NODE running at http://${hostname}:${port}/`);
});
