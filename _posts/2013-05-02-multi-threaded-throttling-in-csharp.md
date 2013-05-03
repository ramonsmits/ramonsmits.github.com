---
layout: post
title: "Multi threaded throttling in csharp"
tags: [threading,throttling,limiter,limiting,c#,csharp,.net]
---

I had the need to limit the number of requests per second I was hitting a webserver. Packets were dropped by a firewall as the connections I was opening was done too often. I could not re-use the connections because of load-balancing and authentication requirements.

My client is based on `Parallel.ForEach` which means that .net automatically increases the number of worker threads until it somehow detects that increasing worker threads does not result in better performance. I started by limiting the maximum number of worker threads by passing a `ParallelOptions` instance. This has the effect that the throughput is very dependant on the current system load, network conditions - and most imported - current hardware. Running it on another machine is a whole different execution environment. The solution was throttling of my work items throughput which is sometimes also referred as limiting. The requirement is simple and in my case I defined it as that my application was not allowed to process more then 10 items per second.

I started 'googling' and landed on stackoverflow where most reactions referred to a token bucket in various implementations. I decided to stop reading as I only needed a hint, I wanted to implement the logic myself and token bucket was enough information for me. I translated this to

>When a item needs processing decide if the throttle limit has not been reached, increment the current number or items and continue. If the throttle limit has been reached then wait until the throttle limit will be reset.

This basically resulted in the following implementation:

	public class Throttle
	{
		private readonly object syncRoot = new object();
		private readonly int limit;
		private readonly TimeSpan duration;

		private int currentItems;
		private DateTime next = DateTime.MinValue;

		public Throttle(TimeSpan duration, int limit)
		{
			this.duration = duration;
			this.limit = limit;
		}

		public void Wait()
		{
			lock (syncRoot)
			{
				DateTime now = DateTime.UtcNow;

				if (next < now)
				{
					currentItems = 0;
					next = now + duration;
				}

				++currentItems;

				if (currentItems < limit) return;

				Thread.Sleep(next - now);
			}
		}
	}

Example usage:

	// Process a maximum of 10 items per second
	var t = new Throttle(new TimeSpan(0, 0, 0, 1), 10);
	var items = Enumerable.Range(0, 1000);
	var start = Stopwatch.StartNew();
	// Process 1000 items
	Parallel.ForEach(items,i =>
			{
				t.Wait();
				Console.WriteLine(i);
			});
	// Processing should at least have taken 100 (1000/10) seconds
	Console.WriteLine(start.Elapsed);

I ran my implementation and it just works! I love it when you create a working piece of code within a few minutes.

Well, it has a couple of minor issues like that all is synchronized by the lock statement and blocking of the thread. But I don't mind that and it is good enough for my current purpose and frankly I would not know how to optimize it a lot more without adding much more code. The only thing I would think of would be to use `Stopwatch` to lower the overhead of DateTime.UtcNow but this overhead is no where near the overhead created by calling `Thread.Sleep` when the throttle limit has been reached.
