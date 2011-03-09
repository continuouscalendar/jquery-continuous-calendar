#!/bin/bash
current_dir=$(pwd)
cd $(dirname $0)
echo Deleting previous build...
rm -rf build
version=$(git tag | head)
echo Build version $version
mkdir build
find src/main -name *.js |xargs cat >build/jquery.continuous-calendar-$version.js
cp build/jquery.continuous-calendar-$version.js build/jquery.continuous-calendar-latest.js
cp src/main/*.css build/jquery.continuous-calendar-$version.css
cd $current_dir