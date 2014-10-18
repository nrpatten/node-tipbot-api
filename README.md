Node TipBot API
=========

### NPM Installation
----

```sh
$ npm install node-tipbot-api
```

### Clone the project via github
---

```sh
$ git clone https://github.com/nrpatten/node-tipbot-api.git
```

* Then meet the package dependencies:

```sh
$ cd node-tipbot-api/
$ npm install
```

### First steps
----

* include node-tipbot-api into your project:

```javascript
var tipbot = require('node-tipbot-api');
```

### Configuration options true or false
----

```javascript
tipbot.options({
    'stream' : true,
    'cleartext' : true 
});
```
By default the returned data is an object, in order to get clear text you have to add the option **cleartext** (streams will always return objects):

## Cleartext

* To activate Cleartext simply add to your options:

```javascript
'cleartext' : true
```
## Streams

* To activate Streaming simply add to your options:

```javascript
'stream' : true
```
### Example
---
##### sendCustomRequest 
- url           String
- callback      Function
- credentials   Boolean     optional    whether the credentials should be applied to the request/stream or not, default is set to false.

```javascript
var url = 'http://api.icndb.com/jokes/random';
tipbot.sendCustomRequest( url, function( data ) {
    var info = data;
    console.log( info.value.joke );
});
```
