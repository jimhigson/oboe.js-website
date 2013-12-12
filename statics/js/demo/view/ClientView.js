var ClientView = extend(ThingView, function(subject, demoView){
    ThingView.apply(this,arguments);

    var templateName = 'client-' + subject.page;
    this.initDomFromTemplate( 'places', templateName, subject.name);

    this.moveTo(subject.locations.where);

    clientPage(subject.page, this.jDom, subject.events);
});

function clientPage(pageName, jDom, events) {
    function singlePageSite(){
        events('receive').on(function( packet ){
            addClass(jDom, 'received-' + packet.ordering.i);
        });

        events('reset').on(function(){
            var ele = jDom[0],
                oldClassAttr = ele.getAttribute('class'),
                newClassAttr = oldClassAttr.replace(/received-\d/g, '');

            ele.setAttribute('class', newClassAttr);
        });
    }

    function twitter(){
        var jTweetTemplate = $('#tweet'),
            jTweetScroll = jDom.find('.tweetsScroll'),
            packetsReceived = 0,
            livePacketsReceived = 0,
            MAX_DISPLAYABLE = 5;

        events('receive').on(function( packet ){

            packetsReceived++;

            if( packet.mode == 'live' ) {
                livePacketsReceived++;
            }

            var jTweet = stampFromTemplate(jTweetTemplate, unitClass(packet)),
                tweetOffset = (packetsReceived-1) * 22
            scrollOffset = (livePacketsReceived) * 22

            if( packet.mode == 'live' ) {
                jTweetScroll.append(jTweet);
                jTweet.css({'translateY': -scrollOffset});
                jTweetScroll.animate({'translateY': scrollOffset});
            } else {
                jTweetScroll.prepend(jTweet);
                jTweet.css({'translateY': tweetOffset});
            }

            // prevent an infinite DOM from being built by removing tweets which
            // will never be seen again:
            if( packetsReceived > MAX_DISPLAYABLE ) {
                jTweetScroll.find('.tweet:first-child').remove();
            }
        });

        events('reset').on(function(){
            packetsReceived = 0;
            livePacketsReceived = 0;
            jTweetScroll
                .stop(true)
                .css({'translateY': 0})
                .empty();
        });
    }

    switch(pageName){
        case "twitter":
            return twitter();
        case "singlePageSite":
            return singlePageSite();
        default:
            throw Error("unknown page type " + pageName);
    }
}