# Why Stream-loading?

## Downloading from standard REST

Your app AJAXes in some JSON. You wait for the response to finish and you update the
page.

{{demo "fast-ajax-discrete"}}

## Streaming downloading from standard REST

But if you are developing for a browser you already have progressive HTML, JPEG,
..., ... rendering. Why not render the JSON progressively as well?

On a fast, low latency, predictable network there isn't a great deal of time to save.
That doesn't stop us rendering things progressively though. Progressive AJAX is a lot
like progressive HTML rendering.

{{demo "fast-ajax-progressive"}}

Streaming one, with a server writing out using GSON or Node.js. Although this is a stream,
the contents when it eventually completes are 100% valid JSON and is compatible with
standard tools.

{{demo "streaming-ajax-progressive"}}

## Mobile data connections

Mobile networks today can be high-bandwidth but they are also high-latency and
give poor guarantees of packet delivery time. This is why mobile networks, with buffering
on the device, streaming HD video fluidly while web surfing feels laggy. If we wait until
we have everything we're wasting the chance to show data earlier.

{{demo "mobile-discrete"}}

With some stream-loading we show everything at the earliest opportunity:

{{demo "mobile-progressive"}}

## Dropped connections

Mobile networks go down while requests are being made. Today's AJAX frameworks treat
responses as wholly successful or wholly unsuccessful. Even if a request is 90% done
when the connection goes down, nothing is shown.

{{demo "mobile-fail-discrete"}}

If we use the data that we have, we can show it *now* and only request the missing
part when the network comes back.

{{demo "mobile-fail-progressive"}}

## Aggregating resources

- waiting for the last one

{{demo "aggregated-discrete"}}

- don't let one slow resource slow everything down.
- don't slow everything's display down to the speed of the slowest component

{{demo "aggregated-progressive"}}

## Historic and live data on the same transport

REST talks in the language of resources, not services. URLs should identify
things, not endpoints. It shouldn't matter if the server has the thing now
or if it will send it later when it does have it, or some combination of
both.

You got to a page, you get the 'old' data and then are kept up
to date with 'live' events.
We normally use two transports for this, but wouldn't it be
nicer if we didn't have to handle distinct cases?

{{demo "historic-and-live"}}

If we treat the historic part as a stream and the streaming
becomes trivial. Handle both with the same code, with no
divergent code to write.

*write: Why this is more like REST. Why REST is good.*

## Cacheable streaming

I'll write it later

Copied from [Wikipedia](http://en.wikipedia.org/wiki/File:Cartogram%E2%80%942012_Electoral_Vote.svg)

{{demo "caching"}}
