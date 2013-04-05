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

/**
* fileUrl : Url from image, jpg, png etc.
* onSuccess: Callback for result function(imageData, features)
*				features.width , features.height
* onError: Callback for error handling
*/
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

/**
* params : 
*	var params={
			format:"jpg",
			finalPath:'../path/images/',
			imageData:imageData
	}
*thumbsList:
* //array of image versions to save at given directory.
*	var thumbsList=[];
*	thumbsList.push({fileName:"nameFile.jpg",width:200,height:300});
*	thumbsList.push({fileName:"nameFile.jpg",crop:true,width:200,height:300});
* // You can send an option of CROP=TRUE to force a crop in imagemagick for the give width and height.
* onSuccess: function(err,success)
*		
*		
*/

thumbsList.push({fileName:"feed"+feedObject.id+"large.jpg",width:largewidth,height:largerheight});

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
