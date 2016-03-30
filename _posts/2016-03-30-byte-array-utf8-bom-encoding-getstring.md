---
layout: post
title: "Howto correctly process byte arrays with UTF8 BOM in c#"
tags: [BOM, UTF8, C#, stream, StreamReader]
---

A lot of developers are aware that sometimes files have a [byte order mark (BOM)](https://en.wikipedia.org/wiki/Byte_order_mark). These can cause issues when developers do very simple imports like

    var text = Encoding.UTF8.GetString(byteData);

If this byte array has a BOM then you will see this in the `text` variable and that is usually not intended. Various hacks are applied like checking if the byte array starts with a UTF8 BOM and skip it or other various quirks and just ignoring the fact that the text data could be stored in a different encoding then UTF8.

## Encoding

The issue here is that the byte array is encoded. The `GetString` should only be used on fragments, not on complete documents. If you open a file or read a web page then these are streams. These streams are then often text and text can be encoded in ASCII, US-ASCII, UTF8, Windows-1252, etc. and how do you know? This is where the BOM is used with files because files do not have meta data (unless you use [NTFS Alternate Data Streams (ADS)](https://support.microsoft.com/en-us/kb/105763) but there are no standards for it).

With web pages its different. There you have HTTP headers and we have access to the [Content-Type](https://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.17). This identifies the type of data that is present after the body but also optionally has a `charset` attribute. This stands for *Character Set* and identifies which text encoding is used.

    Content-Type: text/html; charset=ISO-8859-4

or

    Content-Type: application/json; charset=US-ASCII


There is no reason to have a UTF8 BOM when there is a Content-Type header identifying that the data is UTF8 encoding but browsers will detect the BOM and not render it.


## StreamReader

If you want to have a generic importer that knows how to correctly load a certain text encoding then don't apply hacks to handle the BOM. Use the c# `System.IO.StreamReader` to read text in the correct encoding. It supports most common BOM's and using the StreamReader will result in not having the BOM in the converted string.

## Read byte array in correct encoding with optional BOM

Maybe you want to be able to read data with or without a BOM or in an exotic encoding. The following function handles both.

    string GetString(byte[] data, string contentTypeValue, Encoding encoding)
    {
      if(!string.IsNullOrEmpty(contentTypeValue))
      {
          var contentType = new ContentType(contentTypeValue);

          if(!string.IsNullOrEmpty(type.CharSet))
            encoding = Encoding.GetEncoding(type.CharSet)
      }

      using (var stream = new MemoryStream(data, false))
      using (var reader = new StreamReader(stream, encoding))
      {
        return reader.ReadToEnd();
      }
    }

This function will check if a content type is available and if it has a charset attribute and use that value to initialize the StreamReader or use the encoding specified in the argument. It has no error checking. It also has mixed responsibilities as normally you would split this in two methods to and have a third that manages what would happen if there is a parsing error or an unsupported text encoding. This example would just blow up :-).
