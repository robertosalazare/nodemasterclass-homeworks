const fs = require('fs');
const path = require('path');
const helpers = require('./helpers');

const lib = {};

lib.baseDir = path.join(__dirname, '/../.data/');

// Write data to a file
lib.create = function(dir, file, data, callback) {
	fs.open(lib.baseDir + dir + '/' + file + '.json', 'wx', function(err, fileDescriptor) {
		if(!err && fileDescriptor) {
			const stringData = JSON.stringify(data);

			fs.writeFile(fileDescriptor, stringData, function(err) {
				if(!err){
					fs.close(fileDescriptor, function(err) {
						if(!err){
							callback(false);
						}else {
							callback('Error closing to new file');
						}
					});
				} else {
					callback('Error writing to new file');
				}
			});
		} else {
			callback('Could not create new file, it may already exist');
		}
	});
};

lib.read = function(dir, file, callback) {
	fs.readFile(lib.baseDir + dir + '/' + file + '.json', 'utf8', function(err, data) {
		if(!err && data) {
			var parsedData = helpers.parseJsonToObject(data);

			callback(false, parsedData);
		} else {
			callback(err, data);
		}
	});
}

lib.update = function(dir, file, data, callback) {
	fs.open(lib.baseDir + dir + '/' + file + '.json', 'r+', function(err, fileDescriptor) {
		if(!err && fileDescriptor) {
			const stringData = JSON.stringify(data);

			fs.ftruncate(fileDescriptor, function(err) {
				if(!err) {
					fs.writeFile(fileDescriptor, stringData, function(err) {
						if(!err) {
							fs.close(fileDescriptor, function(err) {
								if(!err) {
									callback(false);
								} else {
									callback('Error closing the file');
								}
							});
						} else {
							callback('Error writing to the file');
						}
					})
				} else {
					callback('Error truncating file');
				}
			});
		} else {
			callback('Could not open the file for updating, it may not exist yet');
		}
	});
}

lib.delete = function(dir, file, callback) {
	fs.unlink(`${lib.baseDir}${dir}/${file}.json`, function(err) {
		if(!err) {
			callback(false);
		}else {
			callback('Error deleting the file');
		}
	})
}

module.exports = lib;