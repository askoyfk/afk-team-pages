var gulp = require('gulp');
var Promise = require('es6-promise').Promise;
var GoogleSpreadsheet = require("google-spreadsheet");
var afk_sheet = new GoogleSpreadsheet('1svnSp174idz6UiibQbdYqOO6wGH1tbPAxANK6TVZKHc');
var convert = require('gulp-convert');
var file = require('gulp-file');
var insert = require('gulp-insert');
var replace = require('gulp-ext-replace');
var del = require('del');

var useless = ['_xml', 'id', 'title', 'content', '_links', 'save', 'del'];

gulp.task('contacts', ['clean:contacts'], function () {
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
                // .pipe(console.log.bind(console))
                .pipe(gulp.dest('contacts'))
        });
    })
    .catch(function(error) {
        console.log(new Error(error))
    })
});


gulp.task('teams', ['clean:teams'], function () {
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

            rows.forEach(function(row, i) {

                useless.forEach(function (prop) {
                    delete row[prop];
                });

                teams.push(row);

                var filename = row.hovedlag.toLowerCase() + ' ' + row.lagnavniturnering.toLowerCase();

                filename = filename.replace(/[æøå\/]/g, function(m) {
                    return {
                        '/' : '-',
                        'æ' : 'a',
                        'ø' : 'o',
                        'å' : 'a'
                    }[m];
                }).replace(/\s/g, '-');


                file(  filename + '.json', JSON.stringify(row))
                    .pipe(convert({
                        from: 'json',
                        to: 'yml'
                    }))
                    .pipe(insert.wrap('---\n', '---\n'))
                    .pipe(replace('.md'))
                    .pipe(gulp.dest('teams'))
            });

            file('teams.json', JSON.stringify(teams))
                .pipe(convert({
                    from: 'json',
                    to: 'yml'
                }))
                // .pipe(console.log.bind(console))
                .pipe(gulp.dest('teams'))

        });
    })
    .catch(function(error) {
        console.log(new Error(error))
    })
})


gulp.task('clean:teams', function(cb) {
    del(['./teams/**'], cb);
});

gulp.task('clean:contacts', function(cb) {
    del(['./contacts/**'], cb);
})

gulp.task('default', ['teams', 'contacts']);
