var gulp = require('gulp');
var Promise = require('es6-promise').Promise;
var GoogleSpreadsheet = require("google-spreadsheet");
var afk_sheet = new GoogleSpreadsheet('1svnSp174idz6UiibQbdYqOO6wGH1tbPAxANK6TVZKHc');
var convert = require('gulp-convert');
var File = require('gulp-file');
var insert = require('gulp-insert');
var replace = require('gulp-ext-replace');
var del = require('del');
var beautify = require('gulp-beautify');
var tap = require('gulp-tap');

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
            File('contacts.json', JSON.stringify(contacts))
                .pipe(convert({
                    from: 'json',
                    to: 'yml'
                }))
                // .pipe(console.log.bind(console))
                .pipe(gulp.dest('./data'))
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

                // var filename = row.hovedlag.toLowerCase() + ' ' + row.lagnavniturnering.toLowerCase();
                //
                // filename = filename.replace(/[æøå\/]/g, function(m) {
                //     return {
                //         '/' : '-',
                //         'æ' : 'a',
                //         'ø' : 'o',
                //         'å' : 'a'
                //     }[m];
                // }).replace(/\s/g, '-');
                //
                //
                // file(  filename + '.json', JSON.stringify(row))
                //     .pipe(convert({
                //         from: 'json',
                //         to: 'yml'
                //     }))
                //     .pipe(insert.wrap('---\n', '---\n'))
                //     .pipe(replace('.md'))
                //     .pipe(gulp.dest('teams/' + row.kategori))
            });

            File('teams.json', JSON.stringify(teams))
                .pipe(beautify({
                    indent: 2
                }))
                .pipe(gulp.dest('./data'));

            File('teams.json', JSON.stringify(teams))
                .pipe(convert({
                    from: 'json',
                    to: 'yml'
                }))
                // .pipe(console.log.bind(console))
                .pipe(gulp.dest('./data'))

        });
    })
    .catch(function(error) {
        console.log(new Error(error))
    })
});

gulp.task('merge:teams', function (cb) {
    gulp.src('./data/teams.json')
        .pipe(tap(function (file, t) {

            var data = JSON.parse(file.contents.toString());

            var teams = [];

            data.forEach(function (team) {

                var name = team.lagnavn;

                var group = teams.filter(function(element) {
                    return element.name === name;
                })[0] || {
                    name : name,
                    category : team.kategori,
                    teams : []
                };

                group.teams.push({
                    name: team.lagnavniturnering,
                    kontaktperson: team.kontaktperson,
                    fiksid: team.fiksid || null
                });

                if (group.teams.length === 1) {
                    teams.push(group);
                };

            });

            file.contents = new Buffer(JSON.stringify(teams));


        }))
        .pipe(beautify({ indent: 2 }))
        .pipe(gulp.dest('./groups/'));
});


gulp.task('clean:teams', function(cb) {
    del(['./teams/**'], cb);
});

gulp.task('clean:contacts', function(cb) {
    del(['./contacts/**'], cb);
})

gulp.task('default', ['teams', 'contacts']);
