var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;

var fs = require('fs');

var files = {};

// CONSTANTS
var HALF_MEG = 524288;
var TEN_MEGS = 10485760;

server.listen(port, function () {
    console.log('Server listening at port %d', port);
});

app.use(express.static(__dirname + '/public')); //jshint ignore:line

io.on('connection', function (socket) {

    socket.on('vote', function (data) {
        console.log('vote received', data);
        socket.broadcast.emit('new vote', {
            message: data
        });
    });

    /**
     * Upload a new file to the server
     * Long uploads can be resumed
     * @param  {Object} data the file data
     */
    socket.on('start upload', function (data) {
        var name = data.name;

        files[name] = {
            fileSize: data.size,
            handler: '',
            data: '',
            downloaded: 0
        };

        var place = 0;

        try {
            var existingFile = fs.statSync('temp/' + name);

            /**
             * If the file exists in temp/
             * continue downloading where we left off
             */
            if (existingFile.isFile()) {
                console.log('Resuming upload...');
                files[name].downloaded = existingFile.size;
                place = existingFile.size / HALF_MEG;
            }
        }
        catch (err) {
            console.log('Uploading new tune...');
        }

        /**
         * If it's a new file we create it,
         * if it's an existing file we open it.
         * We ask the client to send more data.
         * @param  {[type]} err [description]
         * @param  {[type]} fd  [description]
         * @return {[type]}     [description]
         */
        fs.open('temp/' + name, 'a', 0755, function (err, fd) {
            if (err) {
                console.log(err);
            }
            else {

                /**
                 * Store the file handler so we can write to it later
                 * The handler will also be used as the element id in the DOM
                 */
                files[name].handler = fd;

                socket.emit('more data', {
                    place: place,
                    percent: 0
                });
            }
        });
    });

    socket.on('upload', function (data) {
        var name = data.name;

        files[name].downloaded += data.data.length;
        files[name].data += data.data;

        // If File is Fully Uploaded
        if (files[name].downloaded === files[name].fileSize) {
            fs.write(files[name].handler, files[name].data, null, 'Binary', function (err, Writen) {
                //Get Thumbnail Here
            });
            socket.emit('done');
            console.info('upload done');
        }
        else if (files[name].data.length > TEN_MEGS) {
            socket.emit('abort');
        }
        else {
            console.info('PROGRESS');
            var place = files[name].downloaded / HALF_MEG;
            var percent = (files[name].downloaded / files[name].fileSize) * 100;
            socket.emit('more data', {
                'place': place,
                'percent': percent
            });
            console.info('uploading ', percent);
        }
    });

});
