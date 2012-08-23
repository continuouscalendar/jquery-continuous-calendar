#!/bin/bash
git checkout gh-pages
git reset --hard master
git push -f origin gh-pages
git checkout master
