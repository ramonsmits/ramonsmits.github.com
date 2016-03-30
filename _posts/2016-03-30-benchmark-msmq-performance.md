---
layout: post
title: "Benchmark MSMQ Performance"
tags: [msmq, benchmark, performance, throughput]
---

I came across an [MQBench.exe Measures Time to Deliver MSMQ Messages](https://support.microsoft.com/en-us/kb/186194) KB article to measure MSMQ performance. After downloading the [MQBench Command-Line Utility](https://www.microsoft.com/en-us/download/details.aspx?id=94) and locating the tool at `mqbench\MQBench\MSMQRelease\MSMQBench.exe` I noticed that the examples in the KB article did not work. The queue location was incorrect and needed to read the [MSMQ Format names documentation](https://msdn.microsoft.com/en-us/library/ms700996(v=vs.85).aspx)

The following example sends 100,000 messages of 2KB using 6 threads. So this means that the given number of messages is multiplied by the number of threads.

```
    MSMQBench.exe -sr 100000 2048 -t 6 -q .\PRIVATE$\msmqbench
```

Please make sure that the queue exists as this tool will not create it for you. You will get the message `MQPathNameToFormatName failed, 3222142979l(0xc00e0003)` if the queue does not exist.


On my machine I got the following result:

```
Total messages: 600000 Sent
Test time:      10.175 seconds
Benchmark:      58970 messages per second
Throughput:     120770326 bytes per second
```
