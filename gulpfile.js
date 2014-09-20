var gulp = require('gulp');
var Promise = require('es6-promise').Promise;
var GoogleSpreadsheet = require("google-spreadsheet");
var afk_sheet = new GoogleSpreadsheet('1svnSp174idz6UiibQbdYqOO6wGH1tbPAxANK6TVZKHc');
var convert = require('gulp-convert');
var file = require('gulp-file');


gulp.task('default', function () {
    return new Promise(function (resolve, reject) {
        return afk_sheet.getInfo(function (err, info) {
            var teams = info.worksheets[0];
            var contacts = info.worksheets[1];

            if (err) {
                reject(new Error(err))
            } else {
                resolve({
                    teams: teams,
                    contacts: contacts
                })
            }
        })
    })
    .then(function(data) {

        var contacts = [];
        data.contacts.getRows(1, function(err, rows) {
            rows.forEach(function(row) {
                contacts.push({
                    name: row.navn,
                    phone: row.telefon,
                    email: row.epost
                });
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
