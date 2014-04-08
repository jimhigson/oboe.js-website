Why Oboe.js?
============

This page was written to show how streaming can speed up applications. The examples 
illustrated show web interfaces using AJAX to pull in new data but the same techniques
would apply equally well anywhere that REST is used.

Stream any JSON REST resource
-----------------------------

Let's start by examining the standard pattern found on most AJAX-powered sites.
We have a client-side web application and a service that provides it with data.
The page isn't updated until the response completes:

{{demo "fast-ajax-discrete"}}

Oboe is different from most streaming JSON libraries since the JSON
does not have to follow a special format. 
On a good connection there isn't a lot of time to save but 
it is likely that [progressive display in itself will improve the *perception* of 
performance](http://www.sigchi.org/chi95/proceedings/shortppr/egd_bdy.htm):

{{demo "fast-ajax-progressive"}}

With a slower connection or larger data the improvement
is more significant.

Transmit fluently over mobile
-----------------------------

Mobile networks today are high-bandwidth but can also be
high-latency and come with inconsistent packet delivery times.
This is why buffered content like streaming <abbr title="high definition">HD</abbr> video plays
fluidly but web surfing still feels laggy. The visualisation
below approximates a medium-sized download on a mobile network:

{{demo "mobile-discrete"}}

Oboe.js makes it easy for the programmer to use chunks from the response as soon 
as they arrive. This helps webapps to feel faster when running over mobile networks:


{{demo "mobile-progressive"}}

Handle dropped connections with grace
-------------------------------------

Oboe.js provides improved tolerance if a connection is lost before
the response completes.
Most AJAX frameworks equate a dropped connection with total failure and discard
the partially transferred data, even if 90% was received correctly.

We can handle this situation better by using the partially transferred data
instead of throwing it away. Given an incremental approach to parsing, using partial data
follows naturally without requiring any extra programming. 

In the next visualisation we have a mobile connection which fails when the
user enters a building:

{{demo "mobile-fail-discrete"}}

Because Oboe.js views the HTTP response as a
series of small, useful parts, when a connection is lost it is simply
the case that some parts were successful and were used already,
while others did not arrive. Fault tolerance comes for free.

In the example below the client is smart enough so that when the network
comes back it only requests the data that was missed on the first attempt:

{{demo "mobile-fail-progressive"}}

Streamline resource aggregation
-------------------------------

It is a common pattern for web clients to retrieve data through a middle tier.
Nodes in the middle tier connect to multiple back-end services and
create a single, aggregated response by combining their data.

The visualisation below shows an example without streaming.
<span class="server2">Origin 1</span> is slower
than
<span class="server1">Origin 2</span>
but the 
<span class="aggregator">aggregator</span> is forced to respond at the speed of
<span class="server2">the slowest service</span>:

{{demo "aggregated-discrete"}}

We can speed this scenario up by using Oboe.js to load data in
<span class="aggregator">the aggregator</span> and 
<span class="place">the client</span>.
The aggregator dispatches the data as soon as it has it and 
the client displays the data as soon as it is arrives.

{{demo "aggregated-progressive"}}

Despite being a stream, 
<span class="aggregator">the aggregator's</span>
output is 100% valid JSON so it remains compatible 
with standard AJAX tools. A client using a streaming parser like Oboe.js
consumes the resource as a stream but a more traditional client has no 
problem reading it as a static resource.

In a Java stack this could also be implemented by using 
[GSON](http://code.google.com/p/google-gson/) in the middle tier.

Step outside the trade-off between big and small JSON
---------------------------------------------

There is often a tradeoff using traditional REST clients:

* Request too much data and the application feels unresponsive because each request
  takes some time to download.
* Request less and, while the first data is handled earlier, more requests are needed,
  meaning a greater http overhead and more time overall.

Oboe.js breaks out of the tradeoff by beating both.
Large resources load just as responsively as smaller ones so the developer can request more
and let it stream. 

In the visualisation below three rival clients
connect to <span class="place">the same server</span>. The
<span class="client1">top client requests a lot of data</span>,
<span class="client2">the middle a little data twice</span>, and
<span class="client3">the bottom a lot using Oboe.js</span>:

{{demo "big-small"}}

Send historic and live data using the same transport
-------------------------------------------------

It is a common pattern in web interfaces to fetch existing data
and then keep the page updated with 'live' events as they happen.
We traditionally use two transports here but
wouldn't our day be easier if we didn't have to program distinct cases?

In the example below the message server intentionally writes a JSON response
that never completes. It starts by writing out the existing messages
as a chunk and then continues to write out new ones as they happen.
The only difference between 'old' and 'new' data is timing:

{{demo "historic-and-live"}}

Publish cacheable, streamed content
-----------------------------------

[Above](#send-historic-and-live-data-using-the-same-transport) we had a
service where the response intentionally never completes. Here we will
consider a slightly different case: JSON that streams to reflect
live events but which eventually ends.

Most streaming HTTP techniques like Websockets intentionally avoid caches
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
live data after-the-fact is no longer interesting. REST-based Cacheable streaming
works best for cases where the live data is not specific to a single user and remains
interesting as it ages.

What downsides?
----------

Because it is a pure Javascript parser, Oboe.js requires more CPU time
than JSON.parse. Oboe.js works marginally more
slowly for small messages that load very quickly 
but for most real-world cases sage use of i/o beats optimising CPU cycles.

SAX parsers require less memory than Oboe's pattern-based parsing model because
they do not build up a parse tree. See [Oboe.js vs SAX vs DOM](parsers). 

If in doubt, benchmark, but don't forget to
use the real internet, including mobile, and think about perceptual performance.

