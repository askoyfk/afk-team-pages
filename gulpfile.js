var gulp = require('gulp');
var Promise = require('es6-promise').Promise;
var GoogleSpreadsheet = require("google-spreadsheet");
var afk_sheet = new GoogleSpreadsheet('1svnSp174idz6UiibQbdYqOO6wGH1tbPAxANK6TVZKHc');
var convert = require('gulp-convert');
var file = require('gulp-file');

var useless = ['_xml', 'id', 'title', 'content', '_links', 'save', 'del'];

gulp.task('contacts', function () {
    return new Promise(function (resolve, reject) {
        return afk_sheet.getInfo(function (err, info) {

            var contacts = info.worksheets[1];

            if (contacts != undefined) {
                resolve(contacts);
            } else {
                reject(new Error('no contacts'))
            }
        })
    })
    .then(function(data) {
        var contacts = [];
        data.getRows(1, function(err, rows) {
            rows.forEach(function(row) {

                useless.forEach(function (prop) {
                    delete row[prop];
                });

                contacts.push(row);

            });
            file('contacts.json', JSON.stringify(contacts))
                .pipe(convert({
                    from: 'json',
                    to: 'yml'
                }))
                .pipe(gulp.dest('contacts'))
        });
    })
    .then(console.log.bind(console))
    .catch(function(error) {
        console.log(new Error(error))
    })
});


gulp.task('teams', function () {
    return new Promise(function (resolve, reject) {
        return afk_sheet.getInfo(function (err, info) {

            var teams = info.worksheets[0];

            if (teams != undefined) {
                resolve(teams);
            } else {
                reject(new Error('no teams'))
            }
        })
    })
    .then(function(data) {
        var teams = [];

        data.getRows(1, function(err, rows) {

            rows.forEach(function(row) {

                useless.forEach(function (prop) {
                    delete row[prop];
                });

                teams.push(row);
            });

            file('teams.json', JSON.stringify(teams))
                .pipe(convert({
                    from: 'json',
                    to: 'yml'
                }))
                .pipe(gulp.dest('teams'))
        });
    })
    .then(console.log.bind(console))
    .catch(function(error) {
        console.log(new Error(error))
    })
})



gulp.task('default', function () {


});
