// require stuff
var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var request = require('request');
var html = require('html');

// commander --> cli params & help screen
program
	.version('1.3.3.7')
	.option('-u, --user [username]', 'Specify the instagram username of your target.')
	.parse(process.argv);

// display welcome message
console.log("==========================================================");
console.log(" _____   ______    _______  _______    ______   _____ ")
console.log("|_   _|.' ___  |  |_   __ \\|_   __ \\  |_   _ `.|_   _|"); 
console.log("  | | / .'   \\_|    | |__) | | |__) |   | | `. \\ | |"); 
console.log("  | | | |   ____    |  ___/  |  ___/    | |  | | | |"); 
console.log(" _| |_\\ `.___]  |  _| |_    _| |_      _| |_.' /_| |__/ |"); 
console.log("|_____|`._____.'  |_____|  |_____|    |______.'|________|");
console.log("");
console.log("Welcome!");
console.log("==========================================================");

// base url for instagram profiles
var baseUrl = "https://www.instagram.com/";

// get username from cli params
var userName;
if (!program.user) {
	console.log("No username specified! Use -h to display help!");
	console.log("Aborting.");
	return;
} else {
	userName = program.user;
}

// build full URL
var fullUrl = baseUrl + userName;

// make http request to ig page 
console.log("Starting...");
request.get(fullUrl, function(error, response, body) {
	
	// if no error occured
	if (!error && response.statusCode == 200) {

		console.log("Found profile page at  " + fullUrl + "");
		console.log("Locating profile picture..");

		// load body into cheerio for parsing
		var $ = cheerio.load(body);

		var profilePicUrl = "";

		// iterate all meta tags untwil we find the one that contains the profile pic URL
		$("meta").each(function(i, elem) {
			if(elem.attribs.property === "og:image") {
				profilePicUrl = elem.attribs.content;
				console.log("Profile Picture URL found!");
			}
		});

		// remove stuff from URL that resizes the picture to get full size picture
		var profilePicUrl = profilePicUrl.replace("s150x150/","");

		console.log("Full Size Picture URL: " + profilePicUrl);
		console.log("Starting Picture Download...");

		// download picture from the URL
		downloadPicture(profilePicUrl,userName, function(){
			// log if download is done
			console.log("Done downloading the profile picture for " + userName);
		});


	} else {
		
		console.log("An error occured.");
		console.log(error);
	
	}
});


var downloadPicture = function(uri, filename, callback){
  request.head(uri, function(err, res, body){
    var ending = res.headers['content-type'].split("/")[1];
    request(uri).pipe(fs.createWriteStream(filename + "." + ending)).on('close', function(){
    	callback(uri);
    });
  });
};