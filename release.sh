#!/bin/bash
set -e
BUILD_PREFIX=build/jquery.continuousCalendar
LATEST_JS_MIN=$BUILD_PREFIX-latest-min.js
LATEST_CSS_MIN=$BUILD_PREFIX-latest-min.css
current_dir=$(pwd)
cd $(dirname $0)
echo Build nightly...
old_version=$(git tag | tail -n1)
version=$1
npm test
compass compile -c config.rb
rm build/*latest* || true
[ "$version" != "" -a ! -f $BUILD_PREFIX-$version.js ] && rm build/*
echo "Compressing js..."
update_version() { sed  -i '' -E "s/(\"version\".*:.*\").*(\".*)/\1$version\2/g" $@; }
update_version src/main/jquery.continuousCalendar.js
npm install
echo "Compressing css..."
node node_modules/requirejs/bin/r.js -o cssIn=src/main/jquery.continuousCalendar.css optimizeCss=standard out=$LATEST_CSS_MIN
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
		echo -e "h3. $version \n\n$PLEASE EDIT:\n$(git log --pretty=format:%s $old_version^..)\n\n$(cat History.textile)" > History.textile
		vim History.textile
		git add -A .
		git commit -m "Build for version $version"
		git tag $version
		git status
		echo "Now type:"
		echo "git push --follow-tags"
		echo "./ghpages.sh"
		echo "npm publish"
	fi
fi
cd $current_dir
