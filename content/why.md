Why use Oboe.js?
================

Downloading REST resources
--------------------------

Let's start with the standard pattern found on most AJAX-powered sites.
We have a client-side web application and a service that it goes to for data.
The page isn't updated until the response completes.

{{demo "fast-ajax-discrete"}}

On a good connection there isn't a huge amount of time to save but we can
show data sooner and give a more responsive feel by using streaming.

{{demo "fast-ajax-progressive"}}

As the connection gets slower or the response gets larger the improvement
is more significant.

Mobile data connections
-----------------------

Mobile networks today are high-bandwidth but can also be
high-latency and come with inconsistent packet delivery times.
This is why buffered content like streaming HD video plays
fluidly but web surfing still feels laggy.

{{demo "mobile-discrete"}}

Oboe.js helps webapps to feel faster when running over mobile networks by
making it easy for the programmer to use chunks from the response as soon 
as they arrive:

{{demo "mobile-progressive"}}

The visualisation above shows how the data is displayed sooner.
In itself, progressive display also improves the *perception* of performance.

Dropped connections
-------------------

Oboe.js can provide improved tolerance if the connection is dropped before
a response completes.
Most AJAX frameworks equate a dropped connection with total failure and discard
the partially transferred data, even if 90% transferred correctly.

We can handle this situation better by using the partially transferred data
instead of throwing it away. From a streaming approach using this data
follows naturally without requiring any extra programming. 

In the next visualisation we have a mobile connection which fails when the
user enters a building:

{{demo "mobile-fail-discrete"}}

Because Oboe.js views the HTTP response as a
series of small, useful parts, when a connection is lost it is simply
the case that some parts were successful and were used already,
while others did not arrive. No special cases are required.

In the example below the client is smart enough so that when the network
comes back it only requests the data that it missed on the first request.

{{demo "mobile-fail-progressive"}}

Aggregating resources
---------------------

In an N-tier architecture it is a common pattern for web clients to
connect to an aggregation layer. The aggregation layer connects to
several back-end services and returns a single response with all
their data combined.

Below we can see an example without streaming. Origin 1 is slower
than Origin 2 but the whole system is forced to run at the speed of
its slowest component.

{{demo "aggregated-discrete"}}

We can speed the system up if we use Oboe.js in the aggregator and the
client. The aggregator dispatches the data as soon as it has it and 
the client displays the data as soon as it is arrives.

{{demo "aggregated-progressive"}}

The from the aggregator is 100% valid JSON so it remains compatible 
with standard AJAX tools. A streaming parser like Oboe.js reads the resource
as a stream while a standard parser reads it like a static resource.

Historic and live data on the same transport
--------------------------------------------

Consider the common pattern - an application fetches existing data
and then keeps the page updated with 'live' events as they happen.
We normally use two transports for this but
wouldn't our day be easier if we didn't have to program for distinct cases?

In the example below the message server intentionally writes a JSON response
that never completes. The only difference between 'old' and 'new' data
is timing.

{{demo "historic-and-live"}}

Cacheable streaming
-------------------

[Above](#historic-and-live-data-on-the-same-transport) we had a JSON
server which intentionally never completes the response. Below there is a
slightly different case: data which streams but will eventually complete.

Streaming techniques such as Websockets employ workarounds to avoid caches
and proxies.
Oboe.js is different; by taking a REST-based approach to streaming it remains
compatible with HTTP intermediaries and can take advantage of caches to better
distribute the content.

The visualisation below is based on [a cartogram taken from
Wikipedia](http://en.wikipedia.org/wiki/File:Cartogram%E2%80%942012_Electoral_Vote.svg)
and simulates each state's results being announced in the [2012 United
States presidential
election](http://en.wikipedia.org/wiki/United_States_presidential_election,_2012).
Time is sped up so that hours are condensed into seconds.

{{demo "caching"}}

This won't work for every use case. Websockets remains the better choice where
live data after-the-fact is no longer interesting. Cacheable streaming
works best for cases where the live data remains interesting as it ages.

REST talks in the language of resources, not services. URLs should
identify things, not endpoints. It shouldn't matter if the server has
the thing now or if it will send it later when it does have it, or some
combination of both.

In Summary
----------

Using streaming to load data is usually faster. The biggest advantages come with large
responses, mobile networks, or reading from streaming
JSON services.

Downsides?
----------

Oboe.js might be marginally
slower for messages that load *very* quickly 
but for most real-world cases reacting to i/o sooner beats
fussing about CPU usage. If in doubt, benchmark, but don't forget to
use the real internet and think about perceptual performance.
