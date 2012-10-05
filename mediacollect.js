/*

LIB created using wrappingimageMagick 
to download an image from an URL and resize it to save it
on DISK
params.format,
	                dstPath: params.finalPath+params.fileName,
	                width: params.width,
	                height:params.height

	                fileUrl,fileName,

*/

var urllib= require('url');
var  im = require('imagemagick');
var http = require('http');

exports.getContent2Resize = function (params, onSuccess, onError) {
	
	var options = {
    	host: urllib.parse(params.fileUrl).host,
    	port: 80,
    	path: urllib.parse(params.fileUrl).pathname
	};


	http.get(options, function(res) {
		var body = '';
		res.setEncoding('binary');

    res.on('data', function(data) {
    		body+=data;
            
        }).on('end', function() {

			im.identify({data:body}, function(err, features){
  				if (err){
					console.log("error in imagemagick");
					 onError(err);
					return;
				}
				console.log("image size wi "+features.width);

				im.resize({
	                srcData: body,
	                format: params.format,
	                dstPath: params.finalPath+params.fileName,
	                width: params.width,
	                height:params.height

	            }, function (err, stdout, stderr) {
	                if (err) 
					{	
						onError(err);
						return;
					}
	
					onSuccess(params.fileName);
	            });
            //finish resize

			});
			//finish size of image & more...
        });

   		
    }).on('error', function(e) {//handle dns error for domain
  			console.log("Got error: " + e.message);
			onError(e.message);
	});
};

exports.getImageContent = function (fileUrl, onSuccess, onError) {

	var options = {
    	host: urllib.parse(fileUrl).host,
    	port: 80,
    	path: urllib.parse(fileUrl).pathname
	};

console.log("getting the content "+options.host+ " form "+options.path);

	http.get(options, function(res) {
		var body = '';
		res.setEncoding('binary');

    res.on('data', function(data) {
    		body+=data;
        }).on('end', function() {

			im.identify({data:body}, function(err, features){
  				if (err){
					console.log("error in imagemagick");
					onError(err);
					return;
				}
				onSuccess(body, features);
			});
			//finish size of image & more...
        });

   		
    }).on('error', function(e) {//handle dns error for domain
  			console.log("Got error: " + e.message);
			onError(e.message);
	});
}


exports.getThumbsFromImageData = function (params,thumbsList, onSuccess) {
	var thumbprops=thumbsList.shift();

	im.resize({
		srcData: params.imageData,
		format: params.format,
		dstPath: params.finalPath+thumbprops.fileName,
		width: thumbprops.width,
		height:thumbprops.height
		}, function (err, stdout, stderr) {
			if (err) 
			{	
				onSuccess(err,false);
				return;
			}

			if(thumbsList.length>0)
				module.exports.getThumbsFromImageData(params,thumbsList,onSuccess);
			else
				onSuccess(null,true);
		}
	);//finish resize
}
