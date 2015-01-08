[![Build Status](https://magnum.travis-ci.com/SimplyWine/CustomerService.svg?token=XMQ1A7mbTomeHC21t6Sn&branch=master)](https://magnum.travis-ci.com/SimplyWine/CustomerService)

CustomerService
===============

Repository to store the Customer Service Application

## Launching Elastic Beanstalk (EB) Environment

Included in the "cfn" subdirectory of this git repository is a template titled: "customerService-master.cfn.json". This template
can be launched via the AWS Cloud Formation UI or via the aws cli tool chain. Once launched an EB environment and any required
resources will be created and configured via Cloud Formation. Below you will find two tables documenting Cloud Formation parameters
as well as Cloud Formation outputs.

### Cloud Formation Parameters

Parameter Name         | Default           | Description
-----------------------|-------------------|----------------------------------------------------------
ApplicationEnvironment | _N/A_             | Name of application Environment eg: Dev, Prod, etc...
InstanceKeyName        | _N/A_             | Name of the SSH key pair to provision EC2 instances with.
NotificationEmail      | jr@simplywine.com | Email address to send amazon SNS notifications to.
ChetuWhitelistIp       | 182.74.233.26/32  | IP address to white-list for the Chetu team.
JRHomeIp               | 96.232.235.183/32 | IP address to white-list Jason's home IP.
JRWhitelistIp          | 96.232.235.183/32 | IP address to white-list for Jason.
JAwesomeWhitelistIp    | 47.18.202.164/32  | IP address to white-list for James Awesome.
DBUser                 | _N/A_             | MySQL Database User Account
DBPassword             | _N/A_             | MySQL Database Password
DBPort                 | 3306              | MySQL Database Port
DBName                 | AtlanticVine      | MySQL Database Name

### Cloud Formation Outputs

Output     | Description
-----------|----------------------------------------------------------------------------
URL        | The Automatically created Elastic Beanstalk CNAME for our application.
DBEndpoint | The Endpoint URL of the MySQL Database associated with this EB Environment.

## Configuration

This application will obtain it's configuration from environment variables set via cloud formation and elastic beanstalk.

### Environment Variables

Below is a table listing the environment variables made available to all running instances of the application and which, if any, cloud formation
parameter the environment variable is derived from.

Environment Variable | Description                | Cloud Formation Parameter
---------------------|----------------------------|--------------------------
DB_USER              | MySQL Database User Account| DBUser
DB_PASSWORD          | MySQL Database Password    | DBPassword
DB_PORT              | MySQL Database Port        | DBPort
DB_NAME              | MySQL Database Name        | DBName
DB_ENDPOINT          | MySQL Database URL         | _N/A_

## Seeding MySQL

1. Connect to the MySQL endpoint for your target environment. (This can be found in your environment's Cloud Formation outputs as "DBEndpoint" or via the EB CLI with `eb printenv`)
2. To create tables structures, go to src/data folder and find 'Table Structure Script.txt' file. Copy and paste script in query window in mysql and hit run.
3. To create stored procedures, go to src/data folder and find 'Stored Procedure Script.txt' file. Copy and paste script in query window in mysql and hit run. 

Note: If running the whole script at once doesn't work properly, please try running the blocks separated by comments part, separately.

## Running the application

1. Export any necessary environment variables. 
2. Navigate to the "src" directory within the github project root.
3. Execute `node app`.

By default the application will listen at "http://localhost:5000"

## Deploying to Elastic Beanstalk

Deploys will be triggered via Travis-CI upon commits to 'master'
