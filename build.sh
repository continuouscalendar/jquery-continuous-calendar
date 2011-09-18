#!/bin/bash
current_dir=$(pwd)
cd $(dirname $0)
echo Build nightly...
old_version=$(git tag | tail -n1)
version=$1
rm build/*latest*
find src/main -name *.js |xargs cat >build/jquery.continuous-calendar-latest.js
cp src/main/jquery.continuous-calendar.css build/jquery.continuous-calendar-latest.css
if [ "$version" = "" ]
then
	echo "Version information not found. Type ./build.sh <version>" 
	echo "Previous version was $old_version"
else
	if [ -f build/jquery.continuous-calendar-$version.js ]
	then
		echo "Version $version exists, no new versions. Create by typing ./build.sh <version>"
		echo "Previous version was $old_version"
	else
		echo "Creating version $version"
		cp build/jquery.continuous-calendar-latest.js build/jquery.continuous-calendar-$version.js
		cp build/jquery.continuous-calendar-latest.css build/jquery.continuous-calendar-$version.css
		git add build
		git commit -m "Buld for version $version"  
		git tag $version
		git status
		echo "Now:"
		echo "1. type git push --tags"
		echo "2. make a pull request"
	fi
fi
cd $current_dir
