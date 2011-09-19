#!/bin/bash
git checkout gh-pages
git merge master
git push -f
git checkout master