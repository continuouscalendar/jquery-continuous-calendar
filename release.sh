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
update_version() { sed  -i '' -E "s/(\"version\".*:.*\").*(\".*)/\1$version\2/g" $@; }
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
		update_version continuousCalendar.jquery.json
		update_version package.json
		git add -A .
		git commit -m "Build for version $version"
		git tag $version
		./ghpages.sh
		git status
		echo "Now type:"
		echo "git push --tags"
		echo "git push"
		echo "npm install ./"

	fi
fi
cd $current_dir
