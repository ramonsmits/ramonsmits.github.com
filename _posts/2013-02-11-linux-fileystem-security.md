---
layout: post
title: "Linux filesystem security"
tags: [linux, filesystem, security, synology, nas, chmod]
---
As a windows user I often try to use and interpret linux as I would do with windows and that is often incorrect. I just read the following about the linux file system security and immediately understand all security related issues I currently have on my Synology NAS.

>If a user or group does not have execute permission on a given directory, the user or group is unable to list or read anything in it, regardless of the permissions set on the things inside. If you lack execute permission on a directory but do have read permission and you try to list its contents with ls, you receive an error message that, in fact, lists the directory's contents. But this doesn't work if you have neither read nor execute permissions on the directory.

Source: http://www.linuxjournal.com/article/7667?page=0,2