---
layout: post
title: "Visual Studio - Format XML attributes on seperate lines"
---

Most visual studio developers are aware that they can auto format their c# or xml files by hitting `CTRL+E, D` as this is something they see other developers do. However, most are unaware of the fact that they can configure formatting rules. For example, I like uniform xml formatting accross all solutions but as with all formatting most stuff formatting lay-out is personal and especially how to format xml attributes. Visual Studio will not mess with xml attributes and tries to leave them as is but this can be changed by selecting the option *Align attributes each on a separate line* in the XML Formatting options.

You can modify xml formatting at the following location in the Options dialog:

    Text Editor -> XML -> Formatting section Attributes

This will result in the following xml formatting:

    <MsmqTransportConfig InputQueue="SmartService"
                         NumberOfWorkerThreads="1"
                         MaxRetries="5"
                         ErrorQueue="error"/>

I like tabs for indentation but this does not work well together with the attribute formatting as it aligns all attributes but indents it with tabs. When another developer uses a different tab size then mine (I like 2 characters) then usually attributes are incorrectly formatted to the right. Visual Studio should indent from the starting of the tag with spaces so formatting is correct for all tab sizes. Besides that there is a 'bug' that does not format config files with the configured xml formatting settings when Visual Studio (extentions and tools) modify configuration files. When this happens all tab characters are gone and the xml is indented with spaces. I advice to not use tab indentation for xml files and select *the Align attributes each on a separate* line setting.
