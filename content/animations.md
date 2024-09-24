🦄 Animations
==========

The number one question I get asked about this site is how I made the the animations on the <a href="/why">Why Oboe.js</a> page.

jQuery was common back when this site was made, but was starting to get a bad rep. The animations are all rendered
using jQuery to manipulate <a href="https://github.com/jimhigson/oboe.js-website/tree/master/svgSource">svgs</a>
(like you would manipulate any other DOM), but the principles of how they're animated could apply to React, d3, or any other more modern tech.

The crux is, there's a tiny MVC simulation engine implemented using OOP. Back in the day, es6 classes didn't exist, so
the OOP is all done via direct prototype manipulation. The code is all in the [demo](https://github.com/jimhigson/oboe.js-website/tree/master/statics/js/demo) directory. Find the simulation models in [models dir](https://github.com/jimhigson/oboe.js-website/tree/master/statics/js/demo/model) and the views in [views](https://github.com/jimhigson/oboe.js-website/tree/master/statics/js/demo/view). The models all use [pub-sub](https://github.com/jimhigson/oboe.js-website/blob/master/statics/js/demo/pubSub.js#L35) to communicate with each other (when they start or end doing something) and the views also subscribe to the pubsub to know when they should render.

There's a widespread understanding that jQuery is opposed to MVC. Sure, I wouldn't use it today, but when it was
strictly called only from the view code, it could be useful for manipulating the DOM. Today I'd use React, or call the
vanilla DOM directly.

I think it's an interesting window into how we could still make custom things with constrained tech, and severely limited and incompatible browsers. It harks back to an older age when not every js project had 10,000 transitive npm dependencies and we built lots starting from not much.