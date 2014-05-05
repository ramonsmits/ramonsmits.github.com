---
layout: post
title: "IIS url rewrite hostname to subfolder"
tags: [iis,urlrewrite,subfolder]
---

Say that you have several (thousand) static websites and you do not want to manage a seperate website within IIS. What can we do? Well, we can use url rewriting to rewrite the url and use the hostname to specify a subfolder.

Some examples with the rewrite destination:
---

Two different domains:

	http://www.mydomain.com/favicon.ico => c:\inetpub\wwwroot\mydomain.com\favicon.ico
	http://otherdomain.com:8080/favicon.ico => c:\inetpub\wwwroot\otherdomain.com\favicon.ico

Same domain with and without www subdomain:

	http://www.mydomain.com/favicon.ico => c:\inetpub\wwwroot\mydomain.com\favicon.ico
	http://mydomain.com/favicon.ico => c:\inetpub\wwwroot\mydomain.com\favicon.ico

Different ports and protocols:

	https://mydomain.com/favicon.ico => c:\inetpub\wwwroot\mydomain.com\favicon.ico
	http://mydomain.com:8080/favicon.ico => c:\inetpub\wwwroot\mydomain.com\favicon.ico

Implementation behavior
---

The basic idea is to get the domain part from the host name and prefix this to the path. The hostname is stored in the `{HTTP_HOST}` variable. The problem is that this also has the port appended to it. It took me a while before I noticed that the port number was specified by IIS but after that finishing the rewrite action was easy.

0. Regular expression to retrieve the hostname without the port number:

	^(www\.)?(.*)(:[0-9]+)$

0. Rewrite rule that prefixes the captured path (`R:0`) with the captured hostname (`C:2`)

	{C:2}/{R:0}


Solution
---

Here is the actual `web.config` containing the url rewrite configuration. Hope this helps!

	<?xml version="1.0" encoding="UTF-8"?>
	<configuration>
	  <system.webServer>
	    <rewrite>
	      <rules>
	        <rule name="hostname2subfolder">
	          <!--See: http://ramonsmits.com/2013/03/19/iis-url-rewrite-hostname-as-subfolder -->
	          <match url=".*" />
	          <conditions trackAllCaptures="false">
	            <add input="{HTTP_HOST}" pattern="^(www\.)?(.+?)(:[0-9]+)?$" />
	          </conditions>
	          <action type="Rewrite" url="{C:2}/{R:0}" logRewrittenUrl="true" />
	        </rule>
	      </rules>
	    </rewrite>
	  </system.webServer>
	</configuration>

Update 2013-04-11
---

The regular expression did not work when no port was specified f.e. ramonsmits.com failed to match which results in url rewrite to not rewrite at all. I only tested the previous version through a load-balancer which redirected traffic to non default ports.
