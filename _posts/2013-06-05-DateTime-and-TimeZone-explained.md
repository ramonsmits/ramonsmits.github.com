---
layout: post
title: "DateTime and TimeZone explained"
tags: [DateTime,DateTimeKind,Utc,Local,Unspecified,DateTime,TimeZone,TimeZoneInfo]
---

I often see code where developers are using DateTime and are not really writing defensive code handle DateTime values. Usually a developer accepts a DateTime, assumes it is in his current time zone and do some calculations. Then days, weeks or months later the developers are notified of a strange issue for example when due to daylight savings time the clock goes back or forward.

Some date time related issue examples:

* Invoice specifications are not correct
* Mails are send to early or to soon to international customers
* Currency conversions are incorrect
* Reports show an unexpected dip or peak
* Scheduled tasks behave strange


Then the bug hunting starts and after a long time a eureka moment happens and a developer notices it is because the system is not processing based on a fixed clock. It is nice to notice this as from then on a developers mind regarding date and time is changed forever in favor of mankind. The applied when a long time ago people we only using 2 digits to store years and the millennium was approaching and how leap days affects system behavior and reports.

Thinking about this makes me also want to talk about time zones. This is what happens after a developer learns how to cope with utc and local time values. Usually a system runs in a certain time zone, the company expands internationally and nobody at accounting or sales realizes that when a invoice batch is ran at night that this will be happing mid day for a customer at the other side of the globe. Fun stuff happens here the same for invoice specifications.

Some time zone related issue examples:

* An international customers day is different
* It is strange for a customer to receive daily reports for generated reports for a period that overlaps two half days of the customer.
* Notifications and reports send to an international customer will often contain difficult to read timestamps
* An international customer expects to receive a report at 10:00 in the morning but now receives it at 11:00 or 9:00 due to a difference in daylight saving time rules.


This post hopefully makes you aware of common pitfalls. In future posts I will explain on how to address these issues and make a robust design for your system on how to handle such information.
