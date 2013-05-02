---
layout: post
title: "Multi threaded throttling in csharp"
tags: [threading,throttling,limiter,limiting,c#,csharp,.net]
---

I had the need to limit the number of requests per second I was hitting a webserver as the connections went through a firewall and this dropped my packets when I was opening too much connections. I could not re-use the connections because of load-balancing and authentication requirements.

My implementation was based on `Parallel.ForEach` which means that .net automatically increases the number of worker threads until it somehow detects that increasing worker threads does not have any effect. I started by limiting the maximum number of worker threads which can be specified by passing a `ParallelOptions` instance but this has the effect that the throughput is very dependant on the current system load, network conditions and most imported current hardware. Running it on another machine makes the whole process run completely different. I somehow required throttling of my work items which is sometimes also referred as limiting. The requirement is simple and in my case I defined it as that my application was not allowed to process more then 10 items per second.

I started 'googling' and landed on stackoverflow where most reactions referred to either the token bucket in various implementations. I decided to stop reading as I only needed a hint because I wanted to implement the logic myself and token bucket was enough information for me. I translated this to

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

I ran my implementation and it just works! I love that when you create a piece of code within a few minutes.

Well, it has a couple of minor issues like all is synchronized by the lock statement and blocking of the thread but I don't mind that and this is good enough for my purpose and frankly I would not now how to optimized if a lot more without adding much more code. The only thing I would think of would be to use `Stopwatch` to lower the overhead of DateTime.UtcNow but this overhead can be ignored as this overhead if no where near the overhead created by calling `Thread.Sleep` when the throttle limit has been reached.
