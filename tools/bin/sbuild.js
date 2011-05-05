
var path = require("path");
var fs = require("fs");
var util = require("./util");
var extract = require("./extract");
var combo = require("./combo");


var inputFiles = [];
var isCombo = false;
var isRecursive = false;

// node sbuild [--combo] [-r] a.js b.js
for (var i = 2; i < process.argv.length; i++) {
  var arg = process.argv[i];
  if (arg == "--combo") {
    isCombo = true;
  }
  else if (arg == "-r") {
    isRecursive = true;
  }
  else {
    inputFiles.push(arg);
  }
}


var first = inputFiles[0];
if (!first || /^(?:--help|help|\?)$/.test(first)) {
  console.log("Usage:");
  console.log("  sbuild [--combo] a.js b.js");
  console.log("  sbuild [-r] *.js");
  console.log("  sbuild clear");
  process.exit();
}
// sbuild clear
else if (first == "clear") {
  require("./clear").run(process.cwd());
  process.exit();
}


build(inputFiles, process.cwd());
process.exit();


function build(files, basedir) {
  files.forEach(function(name) {
    var p = normalize(name, basedir);
    var stat = fs.statSync(p);

    if (stat.isFile()) {
      buildFile(p);
    }
    else if (isRecursive && name != "__build" && stat.isDirectory()) {
      build(fs.readdirSync(p), path.dirname(p));
    }
  });
}


function buildFile(file) {
  if (isCombo) {
    combo.run(file, "auto");
  } else {
    var outfile = extract.run(file, "auto", true);
    console.log("Successfully build to " + util.getRelativePath(outfile));
  }
}


function normalize(p, basedir) {
  if (p.indexOf("/") != 0) {
    p = path.join(basedir, p);
  }

  if (!path.existsSync(p)) {
    p += ".js";
    if (!path.existsSync(p)) {
      throw "This file doesn't exist: " + p;
    }
  }

  return p;
}