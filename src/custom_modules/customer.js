'use strict'
var mySql = require('mysql'),
mcapi = require('../node_modules/mailchimp-api/mailchimp');
// set MailChimp API key here
var mc = new mcapi.Mailchimp('849a9b78447ca4bd5abd16b9bc099d27-us9');

//initialize mysql connection object here
var connection = mySql.createConnection({
    host : process.env.DB_ENDPOINT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

/*
function syncData(queryString){
    //calling sotred procedure with parameters
    connection.query('call SaveCustomerData(' + queryString + ')', function(err, result, fields){
        if(err)
            console.log(err);
        else{
            console.log('Inserted rows : ' + result.affectedRows);
        }
    });    
}

function checkNull(data){
    return data === '' ? null : data; 
}

setTimeout(function(){

    console.log("Storing data...");
    
    //list id for calling 'simply wine' customer data for now 
    var listId='d1bad717da'; 
    mc.lists.list({filters:{list_id: listId}}, function(listData) {
        mc.lists.members({id: listId}, function(memberData) {
            var lists = memberData.data;
            var strValues = "";
            connection.connect();
            for(var i = 0; i < lists.length; i++) {
                var currentList = lists[i];  
                var mergeObj = lists[i].merges;
                
                strValues = "'" + 
                    mergeObj.EMAIL + "','" + 
                    mergeObj.CELLPHONE + "','" + 
                    mergeObj.FNAME + "','" + 
                    mergeObj.LNAME + "', '" +
                    mergeObj.REGION +"','" + 
                    mergeObj.BIRTHDAY +  "','" + 
                    currentList.info_changed +  "'," + 
                    checkNull(mergeObj.LTINSTORDT)  + "," + 
                    checkNull(mergeObj.INSTORCT) + "," + 
                    checkNull(mergeObj.INSTORSPND) + "," + 
                    checkNull(mergeObj.LTDELIVDT) + "," + 
                    checkNull(mergeObj.DELIVCOUNT) + "," + 
                    checkNull(mergeObj.MEMBPOINTS) + "," +
                    checkNull(mergeObj.DELIVSPND) + "," +
                    checkNull(currentList.leid) + ",'" + 
                    currentList.euid + "'"; 
                
                syncData(strValues);
            }
            connection.end(function(){
                console.log("Completed.");
            });
        }, 
        function (error) {
          console.log(error);
        });
      });
}, 10000);
*/

setInterval(function(){
    try{
        console.log("Syncing customers....");
        SyncToMailChimp();
    }
    catch(err){ 
        console.log(err);
    }  
}, 300000);

function SyncToMailChimp(){
     //list id for calling 'simply wine' customer data for now 
    var listId='8770415a0d';
    var lastSyncDate = getLastSyncDate();
    //connection.connect();
    connection.query('call GetCustomerToSync(\'' + lastSyncDate + '\')', function(err, result, fields){
        if(err)
            console.log(err);
        else{
            var data = result[0];
            if(data.length>0){
                for(var index = 0; index < data.length; index++){
                     var mergesFields = {
                        "EMAIL": data[index].emailaddress,
                        "FNAME": data[index].first_name,
                        "LNAME": data[index].last_name,
                        "CELLPHONE": data[index].cell_phone_number,
                        "BIRTHDAY": data[index].birth_date_MMDD === null ? "": data[index].birth_date_MMDD ,
                        "LTINSTORDT": data[index].last_instore_date === null ? "": data[index].last_instore_date ,
                        "INSTORSPND": data[index].total_instore_spent === null ? "": data[index].total_instore_spent,
                        "DELIVSPND": data[index].total_delivery_spent === null ? "": data[index].total_delivery_spent,
                        "REGION": data[index].regionName === null ? "" : data[index].regionName,
                        "INSTORCT": data[index].total_instore_count === null ? "": data[index].total_instore_count,
                        "DELIVCOUNT": data[index].total_delivery_count === null ? "": data[index].total_delivery_count,
                        "LTDELIVDT": data[index].last_delivery_date === null ? "": data[index].last_delivery_date,
                        "MEMBPOINTS": data[index].membership_points_balance === null ? "": data[index].membership_points_balance,
                     };
                     console.log(mergesFields);
                     var emailStruct = {
                        "email" : data[index].emailaddress,
                        "euid": data[index].mailchimp_leid === null ? "": data[index].mailchimp_leid,
                        "leid": data[index].mailchimp_euid === null ? "": data[index].mailchimp_euid
                    };
                    if(data[index].mailchimp_leid === null && data[index].mailchimp_euid === null){
                        subscribeMember(listId, emailStruct , mergesFields, '', false, true, true, true);
                    }
                    else{
                        updateMember(listId, emailStruct, mergesFields, '', false, (index == data.length -1));
                    }
                }
            }
            else{
                console.log('No customer found to sync.');
            }
            //connection.end();
        }
    });

}

function getLastSyncDate(){
        var currDate= new Date();
        currDate.setMinutes(currDate.getMinutes() - 5);
        return currDate.getFullYear() + '-' + 
                       (currDate.getMonth() + 1) + '-' +
                       currDate.getDate() + ' ' +
                       currDate.getHours() + ':' +
                       currDate.getMinutes() + ':' + 
                       currDate.getSeconds() ;
}

function updateMember(id, email, merge_vars, email_type, replace_interests, isCompleted) {
    var params = {
        "id" : id,
        "email": email, 
        "merge_vars": merge_vars,
        "email_type" : email_type,
        "replace_interests": replace_interests
    };

    mc.call('lists/update-member', params, 
    function(result){
        console.log(result);
        if(isCompleted){
            setTimeout(function(){
                console.log("Completed.");
            },10);
        }
    }, 
    function(err){
        console.log(err);  
    });
}

function subscribeMember(id, email, merge_vars, email_type, double_optin, update_existing, replace_interests, send_welcome) {
    var params = {
        "id" : id,
        "email": email, 
        "merge_vars": merge_vars,
        "email_type" : email_type,
        "double_optin": double_optin,
        "update_existing": update_existing,
        "replace_interests": replace_interests,
        "send_welcome": send_welcome
    };

    mc.call('lists/subscribe', params, 
    function(result){
        console.log(result);
    }, 
    function(err){
        console.log(err);
    });
}
