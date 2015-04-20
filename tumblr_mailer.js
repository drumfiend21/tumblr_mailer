var fs = require('fs');
var ejs = require('ejs');
var tumblr = require('tumblr.js');
var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill('xxxx');

var csvFile = fs.readFileSync("friend_list.csv","utf8");
var emailTemplate = fs.readFileSync('email_template.html', 'utf8');

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









