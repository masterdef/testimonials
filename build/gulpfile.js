var gulp = require('gulp'),
    zip = require('gulp-zip'),
    size = require('gulp-filesize'),
    exec = require('child_process').exec,
    fs = require('fs');

var tm = (function() {
    var moduleInfo = {};

    function loadModuleInfo() {
        var data = fs.readFileSync('../composer.json', {
            encoding: 'utf8'
        });

        moduleInfo = JSON.parse(data);
        moduleInfo.shortname = moduleInfo.name.replace('tm/', '');
    }

    return {
        getModuleInfo: function() {
            if (!moduleInfo.name) {
                loadModuleInfo();
            }
            return moduleInfo;
        },
        getArchiveName: function(suffix) {
            suffix = suffix || '';
            return [
                this.getModuleInfo().shortname,
                '-',
                this.getModuleInfo().version,
                suffix,
                '.zip'
            ].join('');
        }
    };
}());

gulp.task('composer', function(cb) {
    var folders = ['vendor', 'code'];
    folders.forEach(function(folder) {
        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder, function(e) { console.log(e); });
        }
    });

    var filename = 'composer.json';
    if (!fs.existsSync(filename)) {
        var content = {
            "minimum-stability": "dev",
            "require": {
                "%packagename%": "*"
            },
            "repositories": [
                {
                    "type": "composer",
                    "url": "http://tmhub.github.io/packages"
                }
            ],
            "extra": {
                "magento-root-dir": "code/",
                "magento-deploystrategy": "copy",
                "magento-force": true
            }
        };
        content = JSON.stringify(content)
            .replace('"%packagename%"', '"' + tm.getModuleInfo().name + '"');

        fs.writeFile(filename, content, 'utf8', function(err) {
            if (err) {
                console.log(err);
            } else {
                console.log("The " + filename + " file was generated!");
            }
        });
    }

    fs.exists('composer.lock', function(exists) {
        var cmd = exists ? 'composer update' : 'composer install';
        console.log(cmd + ' is running');
        exec(cmd, function (err, stdout, stderr) {
            console.log(stdout);
            console.log(stderr);
            cb(err);
        });
    });
});

gulp.task('full', ['composer'], function() {
    gulp.src(['code/**/*'])
        .pipe(zip(tm.getArchiveName()))
        .pipe(size())
        .pipe(gulp.dest('bin'));
});

gulp.task('default', ['full']);