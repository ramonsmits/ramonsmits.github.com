---
layout: post
title: "Free X-Forwarded-For (XFF) plugin for Forefront Threat Management Gateway (TMG) 2010"
---

Those familiar with http proxy servers know that most reverse proxies are configure to operate in a non transparent configuration. This results in a webserver to get the IP address of the proxy server instead of the client that connected to the proxy. A de facto standard exists where the proxy adds an additional http header to the http request so that a webserver is capable to receive the ip address of the original request.

>[The X-Forwarded-For (XFF) HTTP header field is a de facto standard for identifying the originating IP address of a client connecting to a web server through an HTTP proxy or load balancer. This is an HTTP request header which was introduced by the Squid caching proxy server's developers. An effort has been started at IETF for standardizing the Forwarded HTTP header.](http://en.wikipedia.org/wiki/X-Forwarded-For)

Problem is that Microsoft Forefront Threat Management Gateway (TMG) 2010 does not support this 'de facto' standard. There are commercial solutions available that add this header but they ask a ridiculous amounts of money for this behavior.

A while ago I found a free version available via the [Japanese X-Forwarded-For Wikipedia page](http://ja.wikipedia.org/wiki/X-Forwarded-For) that refers to a romanian page (http://itboard.ro/blogs/jurnal_de_vet/archive/2011/03/30/x-forwarded-for-pentru-tmg.aspx) but it seems that this blog is not available anymore. At the time I downloaded this module and translated the page where the page seemed to provide the module as-is. So I want to provide you the same module here as-is :-)

[XFF-Filter4TMG.zip](XFF-Filter4TMG.zip)
	
Hope this helps some people.