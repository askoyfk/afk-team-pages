var gulp = require('gulp');
var Promise = require('es6-promise').Promise;
var GoogleSpreadsheet = require("google-spreadsheet");
var afk_sheet = new GoogleSpreadsheet('1svnSp174idz6UiibQbdYqOO6wGH1tbPAxANK6TVZKHc');


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
    }).then(console.log.bind(console));

});
