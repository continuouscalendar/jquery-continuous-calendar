#!/bin/bash
current_dir=$(pwd)
cd $(dirname $0)
version=$(git tag | tail -n1)
echo Build nightly...
rm build/*latest*
find src/main -name *.js |xargs cat >build/jquery.continuous-calendar-latest.js
cp src/main/jquery.continuous-calendar.css build/jquery.continuous-calendar-latest.css
if [ -f build/jquery.continuous-calendar-$version.js ]
then
	echo "Version $version exists, no new versions. create by typing git tag <version>"
else
	echo "Creating version $version"
	cp build/jquery.continuous-calendar-latest.js build/jquery.continuous-calendar-$version.js
	cp build/jquery.continuous-calendar-latest.css build/jquery.continuous-calendar-$version.css 	
fi
cd $current_dir