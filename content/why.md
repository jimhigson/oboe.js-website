# Why Streaming REST?

## Downloading from non-streamed REST

Well, why not?

<figure data-demo="fast-ajax-discrete"></figure>

## Streaming downloading from non-streamed REST

On a fast, low latency, predictable network there isn't a great deal of time to save.
That doesn't stop us rendering things progressively though. Progressive AJAX is a lot
like progressive HTML rendering.

<figure data-demo="fast-ajax-progressive"></figure>

## Mobile data connections

Mobile networks today can be high-bandwidth but they are also high-latency and
give poor guarantees of packet delivery time. This is why mobile networks, with buffering
on the device, streaming HD video fluidly while web surfing feels laggy. If we wait until
we have everything we're wasting the chance to show data earlier.

<figure data-demo="mobile-discrete"></figure>

With some stream-loading we show everything at the earliest opportunity:

<figure data-demo="mobile-progressive"></figure>

## Failed connections

Mobile networks go down while requests are being made. Today's AJAX frameworks treat
responses as wholly successful or wholly unsuccessful. Even if a request is 90% done
when the connection goes down, nothing is shown.

<figure data-demo="mobile-fail-discrete"></figure>

If we use the data that we have, we can show it *now* and only request the missing
part when the network comes back.

<figure data-demo="mobile-fail-progressive"></figure>

## Aggregating resources

- waiting for the last one

<figure data-demo="aggregated-discrete"></figure>

- don't let one slow resource slow everything down

<figure data-demo="aggregated-progressive"></figure>

## Historic and live data on the same transport

<figure data-demo="chat-service"></figure>

## Cacheable streaming

I'll write it later

<figure data-demo="slow-ajax-discrete"></figure>