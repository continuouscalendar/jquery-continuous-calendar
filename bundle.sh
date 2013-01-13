#!/bin/bash
#java -classpath src/lib/js.jar org.mozilla.javascript.tools.shell.Main src/lib/r-2.1.2.js src/main/build.js optimize=none
#node  src/lib/r-2.1.2.js -o src/main/build.js optimize=none
#node  src/lib/r-2.1.2.js -o src/main/build.js
node src/lib/r-2.1.2.js -o src/main/build.js uglify.defines.VERSION=string,3.0.0 uglify.defines.RELEASED=string,`date '+%Y-%m-%d'`
