#!/bin/bash
BUILD_PREFIX=build/jquery.continuousCalendar
LATEST_JS=$BUILD_PREFIX-latest.js
LATEST_JS_MIN=$BUILD_PREFIX-latest-min.js
LATEST_CSS=$BUILD_PREFIX-latest.css
LATEST_CSS_MIN=$BUILD_PREFIX-latest-min.css
current_dir=$(pwd)
cd $(dirname $0)
echo Build nightly...
old_version=$(git tag | tail -n1)
version=$1
compass compile -c config.rb
rm build/*latest*
[ "$version" != "" -a ! -f $BUILD_PREFIX-$version.js ] && rm build/*
echo "$.continuousCalendar = {};$.continuousCalendar.version = '$version';$.continuousCalendar.released = '`date '+%Y-%m-%d'`'">$LATEST_JS
cat src/main/DateTime.js   >>$LATEST_JS
cat src/main/DateFormat.js >>$LATEST_JS
cat src/main/DateLocale.js >>$LATEST_JS
cat src/main/DateRange.js  >>$LATEST_JS
cat src/main/jquery.tinyscrollbar-1.66/jquery.tinyscrollbar.js  >>$LATEST_JS
cat src/main/CalendarBody.js  >>$LATEST_JS
cat src/main/RangeEvents.js  >>$LATEST_JS
cat src/main/jquery.continuousCalendar.js >>$LATEST_JS
echo "Compressing js..."
java -jar yuicompressor-2.4.6.jar --type js $LATEST_JS -o $LATEST_JS_MIN
cp src/main/jquery.continuousCalendar.css $LATEST_CSS
echo "Compressing css..."
java -jar yuicompressor-2.4.6.jar --type css $LATEST_CSS -o $LATEST_CSS_MIN
if [ "$version" = "" ]
then
	echo "Version information not found. Type ./release.sh <version>" 
	echo "Previous version was $old_version"
else
	if [ -f $BUILD_PREFIX-$version.js ]
	then
		echo "Version $version exists, no new versions. Create by typing ./build.sh <version>"
		echo "Previous version was $old_version"
	else
		echo "Creating version $version"
		cp $LATEST_JS $BUILD_PREFIX-$version.js
		cp $LATEST_CSS $BUILD_PREFIX-$version.css
		cp $LATEST_JS_MIN $BUILD_PREFIX-$version-min.js
		cp $LATEST_CSS_MIN $BUILD_PREFIX-$version-min.css
		git add -A build
		git commit -m "Build for version $version"
		git tag $version
		git status
		echo "Now:"
		echo "1. type git push --tags"
		echo "2. type git push"
		echo "3. make a pull request"
	fi
fi
cd $current_dir

