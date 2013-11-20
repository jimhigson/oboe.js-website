# Use Cases

Oboe.js isn't specific to my application domain, or even to solving the big-small download compromise. Here are some
more use cases that I can think of: 

**Sarah** is sitting on a train using her mobile phone to check her email. The phone has almost finished downloading her 
inbox when her train goes under a tunnel. Luckily, her webmail developers used **Oboe.js** so instead of the request failing 
she can still read most of her emails. When the connection comes back again later the webapp is smart enough to just 
re-request the part that failed. 

**Arnold** is using a programmable stock screener.
The query is many-dimensional so screening all possible companies sometimes takes a long time. To speed things up, **Oboe.js**,
means each result can be streamed and displayed as soon as it is found. Later, he revisits the same query page. 
Since Oboe isn't true streaming it plays nice with the browser cache so now he see the same results instantly from cache.

**Janet** is working on a single-page modular webapp. When the page changes she wants to ajax in a single, aggregated json 
for all of her modules.
Unfortunately, one of the services being aggregated is slower than the others and under traditional
ajax she is forced to wait for the slowest module to load before she can show any of them. 
**Oboe.js** is better, the fast modules load quickly and the slow modules load later. 
Her users are happy because they can navigate page-to-page more fluidly and not all of them cared about the slow module anyway.

**John** is developing internally on a fast network so he doesn't really care about progressive loading. Oboe.js provides 
a neat way to route different parts of a json response to different parts of his application. One less bit to write.
