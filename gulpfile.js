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

var sex = {
    g: 'gutter',
    j: 'jenter',
    m: 'menn',
    s: 'blandet'
};

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
        return new Promise(function (resolve, reject) {

            var teams = [];

            data.getRows(1, function(err, rows) {

                rows.forEach(function(row, i) {

                    var name = row.lagnavn;

                    var group = teams.filter(function(element) {
                        return element.title === name;
                    })[0] || {
                        title : name,
                        layout: 'team',
                        sex: sex[row.hovedlag.charAt(6).toLowerCase()],
                        age: 7,
                        category : row.kategori,
                        teams : []
                    };

                    group.teams.push({
                        name: row.lagnavniturnering,
                        kontaktperson: row.kontaktperson,
                        fiksid: row.fiksid || null
                    });

                    if (group.teams.length === 1) {
                        teams.push(group);
                    };

                });

                if (teams.length > 0) {
                    resolve(teams)
                } else {
                    reject(Error('no teams'))
                }
            });

        });

    })
    .then(function (data) {

        data.forEach(function (team) {
            var filename = team.title.toLowerCase();

            filename = filename.replace(/[æøå\/]/g, function(m) {
                return {
                    '/' : '-',
                    'æ' : 'a',
                    'ø' : 'o',
                    'å' : 'a'
                }[m];
            }).replace(/\s/g, '-');


            File(  filename + '.json', JSON.stringify(team))
                .pipe(convert({
                    from: 'json',
                    to: 'yml'
                }))
                .pipe(insert.wrap('---\n', '---\n'))
                .pipe(replace('.md'))
                .pipe(gulp.dest('teams/' + team.category))
        })

    })
    .catch(function(error) {
        console.log(new Error(error))
    })
});

gulp.task('clean:teams', function(cb) {
    del(['./teams/**'], cb);
});

gulp.task('clean:contacts', function(cb) {
    del(['./contacts/**'], cb);
})

gulp.task('default', ['teams', 'contacts']);
