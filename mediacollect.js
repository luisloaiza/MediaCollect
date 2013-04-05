/*
NODEJS LIB
LIB created using wrappingimageMagick 
to download an image from an URL and resize it to save it
on DISK

*/

var urllib= require('url');
var im = require('imagemagick');
var http = require('http');
var exec = require('child_process').exec;
var fs = require('fs');
var DOWNLOAD_DIR = './downloads/';

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
					console.log("error at imagemagick lib");
					 onError(err);
					return;
				}
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
			});
        });
    }).on('error', function(e) {
		onError(e.message);
	});
};
exports.getLocalImageContent = function (filePath, onSuccess) {

	im.identify(filePath, function (err, features){
  		if(features!=null || features!=undefined)
  			features.filePath=filePath;
		onSuccess(err, features);
	});
}

exports.getImageContent = function (fileUrl, onSuccess, onError) {
	
	var options = {
    	host: urllib.parse(fileUrl).host,
    	port: 80,
    	path: urllib.parse(fileUrl).pathname
	};

	http.get(options, function(res) {
		var body = '';
		res.setEncoding('binary');
    	res.on('data', function(data) {
    		body+=data;
        }).on('end', function() {
        	try{
				var localError=null;
				im.identify({data:body}, function(err, features){
	  				if (!err){
	  					onSuccess(body, features);
	  					return;
	  				}
	  				else
	  					localError=err;
				});
				if(localError!=null)
					throw new Error("magick at identify "+localError);
			
			}catch(e){
			    var file_name = fileUrl.split('/').pop();
			    var wget = 'wget -P ' + DOWNLOAD_DIR + ' ' + fileUrl;
			    exec(wget, function(err, stdout, stderr) {
				    if (err)
				    	onError(err);
					else{
						try{
							var imdata = fs.readFileSync(DOWNLOAD_DIR+file_name, 'binary');
				        	im.identify({data:imdata}, function(err, features){
				  				if (err){
									onError(err);
									return;
								}
								onSuccess(imdata, features);
							});	
				        }
				        catch(e){
				        	onError(e.toString());	
				        }
				    }
				});
			}
        });
    }).on('error', function(e) {
		onError(e.message);
	});
}


exports.getThumbsFromImageData = function (params,thumbsList, onSuccess) {
	var thumbprops=thumbsList.shift();

	if(thumbprops.crop!=null){
		im.crop({
		    srcData: params.imageData,
			srcPath: params.imageSrc,
			gravity: "Center",
		    dstPath: params.finalPath+thumbprops.fileName,
		    width: thumbprops.width,
		    height: thumbprops.height,
		    quality: 1
		  }, function (err, stdout, stderr){
		    	if (err) 
				{	
					onSuccess(err,false);
					return;
				}
				if(thumbsList.length>0)
					module.exports.getThumbsFromImageData(params,thumbsList,onSuccess);
				else
					onSuccess(null,true);
		  });

		return;
	}
	im.resize({
		srcData: params.imageData,
		srcPath: params.imageSrc,
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
	);
}
