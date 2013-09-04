#!/bin/bash
BUILD_PREFIX=build/jquery.continuousCalendar
LATEST_JS_MIN=$BUILD_PREFIX-latest-min.js
LATEST_CSS_MIN=$BUILD_PREFIX-latest-min.css
current_dir=$(pwd)
cd $(dirname $0)
echo Build nightly...
old_version=$(git tag | tail -n1)
version=$1
compass compile -c config.rb
rm build/*latest*
[ "$version" != "" -a ! -f $BUILD_PREFIX-$version.js ] && rm build/*
echo "Compressing js..."
bundle() { node src/lib/r-2.1.2.js -o src/main/build.js uglify.defines.VERSION=string,$version uglify.defines.RELEASED=string,`date '+%Y-%m-%d'` $*; }
bundle out=$LATEST_JS_MIN
echo "Updating playground..."
node src/lib/r-2.1.2.js -o site/playground-build.js
echo "Compressing css..."
java -jar yuicompressor-2.4.6.jar --type css src/main/jquery.continuousCalendar.css -o $LATEST_CSS_MIN
#TODO create js documentation
#/usr/local/share/npm/lib/node_modules/doxx/bin/doxx --source ./src/main --target ./docs
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
		cp $LATEST_JS_MIN $BUILD_PREFIX-$version-min.js
		cp $LATEST_CSS_MIN $BUILD_PREFIX-$version-min.css
		sed  -i '' -E "s/(\"version\".*:.*\").*(\".*)/\1$version\2/g" continuousCalendar.jquery.json
		git add -A build
		git add continuousCalendar.jquery.json
		git commit -m "Build for version $version"
		git tag $version
		./ghpages.sh
		git status
		echo "Now:"
		echo "1. type git push --tags"
		echo "2. type git push"
		echo "3. make a pull request"
	fi
fi
cd $current_dir
