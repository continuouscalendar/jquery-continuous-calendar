#!/bin/bash
REVISION=`svn info |grep Revision | cut -c 11-`
mkdir target
cd target
svn --force export https://svn.laughingpanda.org/svn/continuous-calendar/trunk/src/ continuous-calendar
cd continuous-calendar
FILENAME=jquery.continuous-calendar-r$REVISION.zip
echo Creating zip for $FILENAME ...
zip -r $FILENAME jquery.continuous-calendar