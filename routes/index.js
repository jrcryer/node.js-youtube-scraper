/**
 * Module dependencies.
 */

var jsdom = require('jsdom')
, request = require('request')
, url = require('url');

/**
 * GET List of videos
 */

exports.list  = function (req, res) {
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
};

/**
 * GET An individual video
 */
exports.watch = function (req, res) {
   res.render('video', {
      title: 'Watch',
      vid: req.params.id
   });
};
