'use strict';
/**
 * Module dependencies.
*/
var forever = require('forever-monitor');
var mySql = require('mysql'),
    express = require("express"),
    cors = require('cors'),
    path = require("path");

var reqConnection = mySql.createConnection({
    host : process.env.DB_ENDPOINT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});
var app = express();
// This make node server to allow cors [Cross Origin Resource Sharing]
app.use(cors());

function getParamValue(objValue){
    objValue = objValue.replace(/[+]/g,' ');
    objValue =  decodeURIComponent(objValue);
    return objValue.split("=")[1];
}

app.get("/", function(req, res){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET");
    res.send('Welcome !!!');
});

// Creating post method to be used by mailchimp webhook to post the data updated, triggered by event registered
app.post("/createjob", function(req, res){
	res.header("Content-Type", "application/json");
    res.header("Accept", "application/json");
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "POST");
    res.header("Access-Control-Allow-Headers", "origin, X-Requested-With, content-type, accept");
    
    req.on('data', function(resultData) {
        //resultData  = JSON.parse(resultData).jobData;
        
        reqConnection.query("insert into Webhook_Data (data) values('" + resultData + "')" , function(err, result, fields){
            if(err)
                throw err;
            else{
                console.log('Inserted rows : ' + result.affectedRows);
                console.log("Completed.");
                
                var arrResultData = resultData.toString().split("&");
               
                /*for(var i=0; i<arrResultData.length;i++){
                    console.log(arrResultData[i]);
                }*/
                if(getParamValue(arrResultData[0])==='unsubscribe'){
                    console.log(getParamValue(arrResultData[0]));
                    var queryValues = checkNull(getParamValue(arrResultData[0])) + "," +checkNull(getParamValue(arrResultData[1])) + "," +
                        checkNull(getParamValue(arrResultData[4])) + "," + checkNull(getParamValue(arrResultData[26])) + "," +
                        checkNull(getParamValue(arrResultData[5])) + "," + checkNull(getParamValue(arrResultData[6])) + "," +
                        checkNull(getParamValue(arrResultData[7])) + "," + checkNull(getParamValue(arrResultData[8])) + "," + 
                        checkNull(getParamValue(arrResultData[9])) + "," + checkNull(getParamValue(arrResultData[10])) + "," + 
                        checkNull(getParamValue(arrResultData[11])) + "," + checkNull(getParamValue(arrResultData[12])) + "," + 
                        checkNull(getParamValue(arrResultData[13])) + "," + checkNull(getParamValue(arrResultData[14])) + "," + 
                        checkNull(getParamValue(arrResultData[15])) + "," + checkNull(getParamValue(arrResultData[16])) + "," + 
                        checkNull(getParamValue(arrResultData[17])) + "," + checkNull(getParamValue(arrResultData[18])) + "," + 
                        checkNull(getParamValue(arrResultData[19])) + "," + checkNull(getParamValue(arrResultData[20])) + "," + 
                        checkNull(getParamValue(arrResultData[21])) + "," + checkNull(getParamValue(arrResultData[22])) + "," + 
                        checkNull(getParamValue(arrResultData[23])) + "," + checkNull(getParamValue(arrResultData[25])) + "," + 
                        checkNull(getParamValue(arrResultData[24]));
                    
                    
                }
                else{
                    var queryValues = checkNull(getParamValue(arrResultData[0])) + "," + checkNull(getParamValue(arrResultData[1])) + "," + 
                        checkNull(getParamValue(arrResultData[2])) + "," + checkNull(getParamValue(arrResultData[24])) + "," + 
                        checkNull(getParamValue(arrResultData[3])) + "," + checkNull(getParamValue(arrResultData[4])) + "," + 
                        checkNull(getParamValue(arrResultData[5])) + "," + checkNull(getParamValue(arrResultData[6])) + "," + 
                        checkNull(getParamValue(arrResultData[7])) + "," + checkNull(getParamValue(arrResultData[8])) + "," + 
                        checkNull(getParamValue(arrResultData[9])) + "," + checkNull(getParamValue(arrResultData[10])) + "," + 
                        checkNull(getParamValue(arrResultData[11])) + "," + checkNull(getParamValue(arrResultData[12])) + "," + 
                        checkNull(getParamValue(arrResultData[13])) + "," + checkNull(getParamValue(arrResultData[14])) + "," + 
                        checkNull(getParamValue(arrResultData[15])) + "," + checkNull(getParamValue(arrResultData[16])) + "," + 
                        checkNull(getParamValue(arrResultData[17])) + "," + checkNull(getParamValue(arrResultData[18])) + "," + 
                        checkNull(getParamValue(arrResultData[19])) + "," + checkNull(getParamValue(arrResultData[20])) + "," + 
                        checkNull(getParamValue(arrResultData[21])) + "," + checkNull(getParamValue(arrResultData[23])) + "," + 
                        checkNull(getParamValue(arrResultData[22]));
                }
                
                console.log(queryValues);
                reqConnection.query('call InsertMailchimpJobs(' + queryValues + ')', function(err, result, fields){
                    if(err)
                        throw err;
                    else{
                        console.log('Inserted rows : ' + result.affectedRows);
                        console.log("Completed.");
                    }
                    res.send("Data received.");
                });
            }
        });
        
    });
});

app.get("/createjob", function(req, res){
	res.header("Content-Type", "text/plain");
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET");
    res.header("Access-Control-Allow-Headers", "origin, X-Requested-With, content-type, accept");
    
    //console.log("GET called");
    //console.log(req.method);
    //console.log(req.header('user-agent'));
    
    //if (req.header('user-agent') === 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36'){
    if (req.header('user-agent') === 'MailChimp.com WebHook Validator'){
        //console.log("Test Check...");
        res.header("Content-Type", "text/plain");
        res.status(200);
        res.send();
        return;
    }
});

//Defining port for all the POST requests from mailchimp server to listen at
app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

app.listen(app.get('port'), function() {
  console.log("Node app is running at port:" + app.get('port'))
})

function checkNull(objValue){
    return ((objValue !== undefined && objValue !== null) ? "'" + objValue + "'" : "null");
};

// initialize the forever object to run background service
var child = new (forever.Monitor)('./custom_modules/customer.js', {
    args: []
});

// Executes when process ends
child.on('exit', function () {
    console.log('Exited');
});

// starts the service
child.start();