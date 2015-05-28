Why another date util library
=============================

* Small and not a feature creep
* Favors immutability - less bugs and easy to chain functions
* Favors factory methods for creating new instances instead of multi-purpose constructor
* DateTime can contain only valid dates
* Instead of one big file there are several small modules for different purposes: 
 * Calculations and transformations
 * Formatting
 * Parsing
 * Localizations
 * Ranges
* continuouscalendar uses this library

Documentation
=============

Creating dates

```DateTime.fromDateTime(2010, 12, 15, 14, 35).plusDays(10).toISOString()``` returns ```2010-12-25T14:35:00```

Formatting dates

```DateFormat.format(DateTime.fromDate(2010, 12, 15), 'Y-m-d')``` returns ```2010-12-15```

[Documentation](http://continuouscalendar.github.io/dateutils/docs/)


Supported languages
===================

-   English
-   Estonian
-   Finnish
-   Latvian
-   Russian
-   Swedish


License
=======

Licensed under the Apache License, Version 2.0 (the “License”); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an “AS IS” BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
