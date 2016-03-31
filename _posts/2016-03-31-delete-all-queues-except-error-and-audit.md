---
layout: post
title: "Deleting all NServiceBus MSMQ queues except error and audit"
tags: [NServiceBus, ServiceControl, MSMQ, PowerShell, exclude]
---

This post mentions how to delete all (private) MSMQ queues by using powershell and hints at using a regex to filter. It took me a few minutes to find out how to delete all queues except a few whitelisted ones. Specifically the queues used by ServiceControl to import data so it continious to operate.

    `[System.Messaging.MessageQueue]::GetPrivateQueuesByMachine("LOCALHOST") | % {".\" + $_.QueueName} | ? {$_ -notmatch "error|audit"} | % {[System.Messaging.MessageQueue]::Delete($_); }`

This script will delete all queues except:

- audit
- audit.log
- error
- error.log
