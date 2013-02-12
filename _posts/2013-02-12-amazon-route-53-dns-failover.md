---
layout: post
title: "Amazon Route 53 Introduces DNS Failover"
---

I must say that I'm a fan of Route 53 for quite some time. It just is an awesome DNS solution which is especially interesting when you use S3 or EC2 as you can select your Amazon stuff from within Route 53 when you create a DNS record. They already have a neat feature called *Latency Based Routing* where you can route the user to the region with the lowest latency.

Today they introduced DNS failover where they dynamically alter the DNS configuration based on the health of your hosts. It can act in an *active-active* ([load balancing](http://en.wikipedia.org/wiki/Load_balancing_(computing))) configuration but also *active-passive* ([fail-over](http://en.wikipedia.org/wiki/Failover)) with as many hosts in any configuration. The health check implementation can check TCP availability and HTTP response validation.

DNS Failover usually works in combination with low DNS TTL ([Time-to-live](http://en.wikipedia.org/wiki/Time_to_live)) values as DNS records need to expire fast enough so that in case of fail-over a new request for a DNS record will not be read from cache. In regulare environments you set DNS records with a TTL of a week as most records are *very* static. In case of fail-over you require your records to expire in minutes (or even seconds). The result of that is a huge increment of the DNS requests. This is something you need to be aware of when you use this feature as this will increase the costs because you are billed by the number of DNS queries.

Interesting reads on the [Amazon Web Services Blog](http://aws.typepad.com/):

* [Create a Backup Website Using Route 53 DNS Failover and S3 Website Hosting](http://aws.typepad.com/aws/2013/02/create-a-backup-website-using-route-53-dns-failover-and-s3-website-hosting.html)
* [Multi-Region Latency Based Routing now Available for AWS](http://aws.typepad.com/aws/2012/03/latency-based-multi-region-routing-now-available-for-aws.html)