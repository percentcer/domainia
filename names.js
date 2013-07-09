#!/usr/bin/env node

var http = require("http");

function getDomainrReq( someWord ) {
    return {
        host   : "domai.nr",
        port   : 80,
        path   : "/api/json/search?client_id=domania&q=" + someWord
    };
};

function getThesReq( someWord ) {
    return {
        host : "words.bighugelabs.com",
        path : "/api/2/18445d364105eed58a7ddd788f64078c/" + someWord + "/json",
        port : 80
    };
};

function domainrHandler( res ) {
    var acc = '';
    
    res.setEncoding('utf8');
    
    res.on( 'data', function ( c ) { acc += c;} );
    
    res.on( 'end', function () {
        var obj = JSON.parse(acc);
        for (var _i = 0, _len = obj['results'].length; _i < _len; _i++) {
            var domObj = obj['results'][_i];
            if (domObj.availability == "available") {
                console.log( domObj.domain );
            }
        }
    });
}

function thesHandler( res ) {
    var acc = '';

    res.setEncoding('utf8');

    res.on('data', 
            function ( c ) { 
                acc += c; 
            }
    );

    res.on('end', function () {
        if (acc == '') { console.error("no synonyms found for " + process.argv[2]); return; }

        var obj = JSON.parse(acc);
        for (var pos in obj) {
            for (var rel in obj[pos]) {
                for (var _i = 0, _len = obj[pos][rel].length; _i < _len; _i++) {
                    var theWord = obj[pos][rel][_i];
                    if ( !Boolean(theWord.match(/\W/g) ) ) {
                        printDomainsForWord( obj[pos][rel][_i] );
                    }
                }
            }
        }
    });
};

function printDomainsForWord( someWord ) {
    http.get(
        getDomainrReq( someWord ),
        domainrHandler
    );
};

function getDomains( someWord ) {
    printDomainsForWord( someWord );
    http.get(
        getThesReq( someWord ),
        thesHandler
    );
}

if (require.main == module) {
    getDomains(process.argv[2]);
}

exports.getDomains = getDomains;

