var ClientView = (function(){

    var ClientView = extend(ThingView, function(subject, demoView){
        ThingView.apply(this,arguments);

        this.initDomFromTemplate( 'places', 'client', subject.name);
        
        var browserTemplateName = 'client-' + subject.page;
        this.stampContentsFromTemplate( 'browserContents', browserTemplateName);
    
        this.moveTo(subject.locations.where);
    });

    ClientView.factory = function(subject, demoView) {

        function type(pageName){
            switch(pageName){
                case "singlePageSite":
                case "graph":
                case "map":
                    return SimpleClient;                
                case "twitter":
                    return TwitterPageClient;
                default:
                    throw Error("unknown page type " + pageName);
            }
        }
        
        var Type = type(subject.page);
        return new Type(subject, demoView);
    };

    // ---------------------------------
    
    /* simple client turns on classes when packets are received, works for
     * any class/hiding based client svg */
    var SimpleClient = extend(ClientView, function(subject, demoView){
        ClientView.apply(this, arguments);
        
        subject.events('gotData').on(function( packet ){
            addClass(this.jDom, 'received-' + packet.ordering.i);
        }.bind(this));

        subject.events('reset').on(function(){
            var ele = this.jDom[0],
                oldClassAttr = ele.getAttribute('class'),
                newClassAttr = oldClassAttr.replace(/received-\d/g, '');

            ele.setAttribute('class', newClassAttr);
        }.bind(this));        
    });

    // ---------------------------------
    
    var TwitterPageClient = extend(ClientView, function(subject, demoView){
        ClientView.apply(this, arguments);        
        
        var jTweetTemplate = $('#tweet'),
            jTweetScroll = this.jDom.find('.tweetsScroll'),
            packetsReceived = 0,
            livePacketsReceived = 0,
            MAX_DISPLAYABLE = 5;

        subject.events('gotData').on(function( packet ){

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

        subject.events('reset').on(function(){
            packetsReceived = 0;
            livePacketsReceived = 0;
            jTweetScroll
                .stop(true)
                .css({'translateY': 0})
                .empty();
        });        
    });

    // ---------------------------------
    
    return ClientView;
}());
