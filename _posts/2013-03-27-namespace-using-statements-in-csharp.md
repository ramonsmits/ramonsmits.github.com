---
layout: post
title: "Namespace using statements in csharp"
tags: [iis,urlrewrite,subfolder]
---

Namespaces in csharp is something that a lot of developers don't get or simple never tried to figure out how they work or what can be done with the different ways of declaring namespaces.

This post is about the style that I prefer and that I want to share with you. Lets start with the 'usual' way of declaring namespace using statements. I call this 'outer' as these are located outside the namespace scope.

<pre class="brush: c#">
	using System;
	using System.Transactions;
	using AwesomeApp.Contracts;
	using AwesomeApp.Model;

	namespace AwesomeApp
	{
	}
</pre>

This is what most developers do. Usually they are ordered with .net framework first, then other frameworks and then followed by internal dependencies or they are just sorted alphabetically.

Then there is the other way of declaring them within the namespace scope and I call this 'inner' like the following example:

<pre class="brush: c#">
	namespace AwesomeApp
	{
		using System;
		using System.Transactions;
		using AwesomeApp.Contracts;
		using AwesomeApp.Model;
	}
</pre>

Now we are getting to something that A LOT of developers don't know and that is that a lot of namespaces can be shortened.

<pre class="brush: c#">
	namespace AwesomeApp
	{
		using System;
		using System.Transactions;
		using Contracts; // AwesomeApp.Contracts
		using Model; // AwesomeApp.Model
	}
</pre>

I really like this shortening of namespaces but only for namespaces that can be shortened. This is where we get to the grand finale where we combine these various ways of 'using' (yes, intentional joke..) these conventions.

<pre class="brush: c#">
	using System.Transactions;

	namespace AwesomeApp
	{
		using System;
		using Contracts;
		using Model;
	}
</pre>

Personally, this is the crème de la crème regarding declaring namespaces in csharp