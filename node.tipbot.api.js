var NodeTipbotApi = function() {

    'use strict';

    var request = require( 'request' ),
        q = require( 'q' ),
        hmac_sha512 = require( './hmac-sha512.js' ),
        JSONStream = require( 'JSONStream' ),
        es = require( 'event-stream' );

    var deferred = q.defer(),
        start,
        end,
        request_options = {
		    method  : 'GET',
		    agent   : false,
		    headers : {
		    	"User-Agent" : "Mozilla/4.0 (compatible; Node TipBot API)",
		    	"Content-type" : "application/x-www-form-urlencoded"
		    }
	    };

    var opts = {
        cleartext : true,
        stream : true 
    };

    var getNonce = function() {
        return Math.floor( new Date().getTime() / 1000 );
    };

    var extractOptions = function( options ) {

        var o = Object.keys( options ),
            i;
        for( i = 0; i < o.length; i++ ) {
           opts[o[i]] = options[o[i]];
        }
    };

    var apiCredentials = function( uri ) {

        var options = {
            apikey  : opts.apikey,
            nonce   : getNonce()
        };

        return setRequestUriGetParams( uri, options ); 
    };

    var setRequestUriGetParams = function( uri, options ) {

        var o = Object.keys( options ),
            i;
        for( i = 0; i < o.length; i++ ) {
           uri = updateQueryStringParameter( uri, o[i], options[o[i]] );
        }

        request_options.headers.apisign = hmac_sha512.HmacSHA512( uri, opts.apisecret );

        return uri;
    };

    var updateQueryStringParameter = function( uri, key, value ) {

        var re = new RegExp( "([?&])" + key + "=.*?(&|$)", "i" );
        var separator = uri.indexOf( '?' ) !== -1 ? "&" : "?";

        if( uri.match( re ) ) { uri = uri.replace( re, '$1' + key + "=" + value + '$2' ); }
        else { uri = uri + separator + key + "=" + value; }

        return uri;
    }

    var sendRequestCallback = function( callback ) {

        start = Date.now();

        switch( opts.stream ) {

            case true : 
                request( request_options )
                    .pipe( JSONStream.parse() )
                    .pipe( es.mapSync( function( data ) {
                        callback( data );
                        ( ( opts.verbose ) 
                            ? console.log( "streamed from "+ request_options.uri +" in: %ds", ( Date.now() - start ) / 1000 ) : '' );
                    }));
                break;
            case false : 
                sendRequest()
                .then( function( data ) {
                    
                    callback( ( ( opts.cleartext ) ? data : JSON.parse( data ) ) );
                    ( ( opts.verbose ) 
                        ? console.log( "requested from "+ request_options.uri +" in: %ds", ( Date.now() - start ) / 1000 ) : '' );
                })
                .catch( function( error ) {
                    console.error( error );
                })
                .done();
                break;
            default :
                break;
        }
    };

    var sendRequest = function() {

        request( request_options, function( error, result, body ) {
            
            if( ! body || ! result || result.statusCode != 200 ) {
                deferred.reject( new Error( error ) );
            }
            else {
                deferred.resolve( body );
            }
        });

        return deferred.promise;
    };

    return {

        options : function( options ) {
            extractOptions( options );
        },
        sendCustomRequest : function( request_string, callback, credentials ) {

            request_options.uri = ( ( credentials === true ) ? apiCredentials( request_string ) : request_string );
            sendRequestCallback( callback );
        }
    };

}();

module.exports = NodeTipbotApi;
