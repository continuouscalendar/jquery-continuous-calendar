![Calendar screen shot](http://continuouscalendar.github.io/jquery-continuous-calendar/site/calendar.png)
[Homepage]: http://continuouscalendar.github.io/jquery-continuous-calendar/
[Playground]: http://continuouscalendar.github.io/jquery-continuous-calendar/site/playground.html
[Unit tests]: http://continuouscalendar.github.io/jquery-continuous-calendar/src/test/jquery.continuousCalendar.spec.html
[Latest revision as ZIP file]: http://github.com/continuouscalendar/jquery-continuous-calendar/zipball/master
[Change log]: https://github.com/continuouscalendar/jquery-continuous-calendar/blob/master/History.textile
[wicket-continuous-calendar]: https://code.google.com/p/wicket-continuous-calendar/

Features
========

-   Date dragging
-   No pagination, continuous month flow
-   Range shifting by dragging
-   Range expand with Shift + Mouse click
-   Display current date
-   Allow disabling of dates
-   Month select
-   Week select
-   Popup support (with current day in calndar icon)
-   Support for different date formats
-   Support for specifying holidays or disabled days
-   Support for setting minimum range
-   AMD Support

Supported languages
===================

-   English
-   Estonian
-   Finnish
-   Latvian
-   Russian
-   Swedish
-   German
-   French
-   Chinese


Supported browsers
==================

-   IE7 -\>
-   FireFox
-   Chrome
-   Opera
-   Safari

Getting started
===============

For NPM project just type

	npm install jquery-continuous-calendar

Insert in head
--------------

	<!-- basic default calendar styles -->
	<link rel="stylesheet" href="http://continuouscalendar.github.io/jquery-continuous-calendar/build/jquery.continuousCalendar-latest-min.css" type="text/css" />

	<!-- custom user specified calendar styles -->
	<style type="text/css">
	    .calendarScrollContent {height: 250px;}
	</style>

	<!-- required JavaScript files -->
	<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.8.0/jquery.min.js"></script>
	<script type="text/javascript" src="http://continuouscalendar.github.io/jquery-continuous-calendar/build/jquery.continuousCalendar-latest-min.js"></script>

Insert in body
--------------

	<!-- range selection is attached to fields with class startDate and endDate -->
	<div id="dateRange1">
  	  <input type="hidden" class="startDate" name="range_start">
  	  <input type="hidden" class="endDate" name="range_end">
	</div>
	<script type="text/javascript" language="JavaScript">
  	  $("#dateRange1").continuousCalendar();
	</script>


Instructions for contributors
=============================

-   make a fork
-   code by using existing code style
-   update and run tests (src/test/**.html)\
-   make pull request

License
=======

Licensed under the Apache License, Version 2.0 (the “License”); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an “AS IS” BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
