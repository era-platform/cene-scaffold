"use strict";

var fse = require("fs-extra");
var spawn = require("cross-spawn");


var ceneLibs = [
    "cene"
];


async function runCeneCli(args) {
    await new Promise((resolve, reject) => {
        spawn("npm", ["run", "cene", "--"].concat(args), {
            stdio: ["ignore", "inherit", "inherit"]
        })
            .on("close", code => {
                if (code !== 0)
                    return void reject(
                        new Error(`Cene exited with code ${code}`));
                
                resolve();
            });
    });
}

async function build(opt_options) {
    var options = Object.assign({
        minify: true
    }, opt_options);
    
    await fse.ensureDir("build/lib/");
    await fse.copy("src/", "build/src/");
    for (const lib of ceneLibs) {
        await fse.copy(`node_modules/${lib}/lib-cene/`, `build/lib/${lib}/`);
    }
    
    var ceneCliArgs = "build.cene -i build/ -o dist/";
    if (options.minify)
        ceneCliArgs += " -m";
    await runCeneCli(ceneCliArgs.split(" "));
}

exports.clean = async () => {
    await fse.remove("build/");
    await fse.remove("dist/");
};

exports.build = async () => await build();

exports[ "build-debug" ] = async () => await build({ minify: false });
