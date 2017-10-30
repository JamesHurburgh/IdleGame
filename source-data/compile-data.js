/*jshint esversion: 6 */

// Must be run from 

var dataTypes = ['adventurers', 'contracts'];

dataTypes.forEach(function(dataType) {
    compileData(dataType);
}, this);

function compileData(dataType) {

    console.log('Compiling ' + dataType + '...');

    const folder = './' + dataType + '/';
    const fs = require('fs');

    fs.readdir(folder, (err, files) => {

        var result = files.map(function(file) {
            console.log('Compiling ' + file);
            var content = fs.readFileSync(folder + '/' + file, 'utf8', function(err, data) {
                if (err) {
                    console.log(err);
                }
            });
            return JSON.parse(content);
        }, []);

        fs.writeFile('../www/data/' + dataType + '.json', JSON.stringify(result), function(err) {
            if (err) {
                return console.log(err);
            }

            console.log(dataType + '.json was saved!');
        });

    });
}