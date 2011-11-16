
/**
 * Module dependencies.
 */

var express = require('express')
, jsdom = require('jsdom')
, request = require('request')
, url = require('url')
, routes = require('./routes')
, app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

app.get('/', function (req, res) {
    //Tell the request that we want to fetch youtube.com, send the results to a callback function
    request({
        uri: 'http://youtube.com'
    }, function (err, response, body) {
        var self   = this;
        var videos = []; 

        //Just a basic error check
        if (err && response.statusCode !== 200) {
            console.log('Request error.');
        }
 
        //Send the body param as the HTML code we will parse in jsdom
        //also tell jsdom to attach jQuery in the scripts
        jsdom.env({
            html: body,
            scripts: ['http://code.jquery.com/jquery-1.6.min.js']
        }, function (err, window) {
            var $ = window.jQuery,
                $body = $('body'),
                $videos = $body.find('.video-entry');
 
            $videos.each(function (i, item) { 
                var $a = $(item).children('a'),
                    $title = $(item).find('.video-title .video-long-title').text(),
                    $time = $a.find('.video-time').text(),
                    $img = $a.find('span.clip img'); //thumbnail
 
                videos.push({
                    href: $a.attr('href'),
                    title: $title.trim(),
                    time: $time, 
                    thumbnail: $img.attr('data-thumb') ? $img.attr('data-thumb') : $img.attr('src'),
                    urlObj: url.parse($a.attr('href'), true) //parse our URL and the query string as well
                });
            });
 
	    res.render('list', {
                title: 'NodeTube',
                items: videos
	    }); 
        });
    });
});

app.get('/watch/:id', routes.watch);

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
