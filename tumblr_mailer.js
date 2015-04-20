var fs = require('fs');
var ejs = require('ejs');
var tumblr = require('tumblr.js');
var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill('xxxx');

var csvFile = fs.readFileSync("friend_list.csv","utf8");
var emailTemplate = fs.readFileSync('email_template.html', 'utf8');


//create loop function that takes "split at" and an array to push to
//intakes a string, splits at each \n, stores all data in an array
//create object constructor
//object constructor takes elements of first line (array[0]) as key values
//object constructor intakes each line, splits at commas and stores in a new array
//split our csvFile (string) at new lines, store each line as item in newlineArray
//split our first line at commas, store each element as a key name in keysArray
//split each contact, stored as an item in the newlineArray, at the commas and
//store each contact as an item 

//Log
//1. splits string and stores in newline array
//2. Splits newlineArray[0] into keysArray
//3. Splits newlineArray lines at commas and stores all values
//   for each contact as items in its own array in contactsArray
//   ie. contactsArray[0][0] = "Scott"
//4. contactsSplit creates objects for each contact in contactsArray, 
//   setting keys to items in each contact and storing each contact object
//   in arrayofObjectContacts



var csvParse = function(string){
	var arrayofObjects=[];
	var arr = string.split("\n");
	var keys = arr.shift().split(",");

	arr.forEach(function(contact){
		contact = contact.split(",");
		var newObj = {};
		for(var i = 0 ; i < contact.length ; i++){
			newObj[keys[i]] = contact[i];
		}
		arrayofObjects.push(newObj);
	})
	return arrayofObjects;
}



//generate current date in ms

currentTime = new Date().getTime();

//Get blog 


var blogObj={};

var client = tumblr.createClient({
  consumer_key: 'xxxx',
  consumer_secret: 'xxxx',
  token: 'xxxx',
  token_secret: 'xxxx'
});


//pull blog dates, select and push to latestPosts
client.posts('mowglicodes.tumblr.com', function(err, beeble){
	var latestPosts = [];


	for(var i= 0; i < beeble["posts"].length; i++){
		if((currentTime - Date.parse(beeble["posts"][i]["date"])) < 604800000){
			var newObj = {};
			newObj.href = beeble["posts"][i]["short_url"];
			newObj.title = beeble["posts"][i]["title"];
			latestPosts.push(newObj);
		}
	}
	
	//html email generator

	friendList = csvParse(csvFile);


	friendList.forEach(function(row){

	    firstName = row["firstName"];
	    lastName = row["lastName"];
	    numMonthsSinceContact = row["numMonthsSinceContact"];
	    emailAddress = row['emailAddress']

		var customizedTemplate = ejs.render(emailTemplate, {

			firstName: firstName,
			numMonthsSinceContact: numMonthsSinceContact,
			latestPosts: latestPosts,

		});
	    //console.log(customizedTemplate);


		function sendEmail(to_name, to_email, from_name, from_email, subject, message_html){
		    var message = {
		        "html": message_html,
		        "subject": subject,
		        "from_email": from_email,
		        "from_name": from_name,
		        "to": [{
		                "email": to_email,
		                "name": to_name
		            }],
		        "important": false,
		        "track_opens": true,    
		        "auto_html": false,
		        "preserve_recipients": true,
		        "merge": false,
		        "tags": [
		            "Fullstack_Tumblrmailer_Workshop"
		        ]    
		    };
		    var async = false;
		    var ip_pool = "Main Pool";
		    mandrill_client.messages.send({"message": message, "async": async, "ip_pool": ip_pool}, function(result) {
			        // console.log(message);
			        // console.log(result);   
			    }, function(e) {
			        // Mandrill returns the error as an object with name and message keys
			        console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
			        // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
		    });
		}

		sendEmail(firstName+" "+lastName, emailAddress, "Siddharth Joshi", "drumfiend21@gmail.com", "Join me on my new exciting venture", customizedTemplate);
	});


});









