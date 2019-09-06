# Callback widget project

[Application structure is based on MEAN.JS](http://meanjs.org/)

[TeamCity CI server](http://files.algo-rithm.com:8081/viewType.html?buildTypeId=CallbackWidget_Build), see [teamcity build agent setup instructions](https://redmine.algo-rithm.com/issues/11541)

## Installing application locally

### Main application

####Set up host
Add **_callback.local.algo-rithm.com_** to global local hosts

#### Download

    $ sudo git clone https://bitbucket.org/algorithmua/callback-widget

#### Init

Load npm and bower modules

    $ cd callback-widget && npm install

Install mongoDB: [install mongodb on ubuntu](http://docs.mongodb.org/manual/tutorial/install-mongodb-on-ubuntu)

Launch migrations

    $ NODE_ENV=development grunt migrate:up

#### Launch app

    $ grunt

or

    $ grunt debug

or

    $ node server

see. [launch mean.js app](https://docs.google.com/document/d/1QyXZ5LZyiXD3t8fvk_zgTKoyvMgCkXNk-TCgOsq9Z90/edit#heading=h.arauw0b97ok8)

Access application at http://callback.local.algo-rithm.com:3000

Credentials to access admin part of application: **_algo-rithm/call73bAck74_**

### Test application

#### Init

    $ cd widget-test && npm install

#### Launch

    NODE_ENV=development PORT=3300 ./bin/www

Access test app at http://callback.local.algo-rithm.com:3300/

##Installing application in staging enviroment
Staging environment is used for testing application on production server.
Code resides in directory /home/web/callback-widget

Installation steps are the same as for installing in local environment, but NODE_ENV=staging should be used.

####Main application can be launched as

    NODE_ENV=staging grunt

or as

    NODE_ENV=staging nohup /usr/local/bin/node /home/web/callback-widget/server >>/home/ubuntu/callback.staging.log 2>&1 &

after launching available at http://callback.algo-rithm.com:4000


####Test application can be launched at http://callback.algo-rithm.com:4400 from directory /widget-test as

    NODE_ENV=staging PORT=4400 ./bin/www

or as 

    PORT=4400 NODE_ENV=staging nohup /usr/local/bin/node /home/web/callback-widget/widget-test/bin/www >>/home/ubuntu/callback.staging.testapp.log 2>&1 &

####One more test application can be launched at http://callback.algo-rithm.com:4401 from directory /widget-test as

 NODE_ENV=staging PORT=4401 ./bin/www

or as 

    PORT=4401 NODE_ENV=staging nohup /usr/local/bin/node /home/web/callback-widget/widget-test/bin/www >>/home/ubuntu/callback.staging.testapp.log 2>&1 &