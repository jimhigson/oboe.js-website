var ClientView = (function(){

    var ClientView = extend(ThingView, function(client, demoView){
        ThingView.apply(this,arguments);

        var jDom = this.initDomFromTemplate( 'places', 'client-' + client.aspect, client.name),
            browserContentsPaneSelector = '.' + client.name + ' .browserContents', 
            browserTemplateName = 'client-' + client.page;
        
        this.stampContentsFromTemplate( browserContentsPaneSelector, browserTemplateName);
        addClass(jDom, client.page);
       
        this.moveTo(client.locations.where);

        var showSpinner = this.showSpinner.bind(this),
            hideSpinner = this.hideSpinner.bind(this);
        
        client.events('request').on(showSpinner);
        client.events('requestFail').on(hideSpinner);
        client.events('requestComplete').on(hideSpinner);
        client.events('reset').on(hideSpinner);

        jDom.click(function(){
            if( client.demo.paused ) {
                client.demo.unpause();
            } else {
                client.demo.pause();
            }
        });

        jDom.find('.zoom').attr('transform', 'scale(' + client.zoom + ')');
       
        this.manageProgressBar();

        this.initHiding();
        this.writeLabel();
    });

    ClientView.factory = function(client, demoView) {

        function type(pageName){
            switch(pageName){
                case "singlePageSite":
                case "graph":
                    return SimpleClient;
                case "map":
                    return PinDropClient;
                case "cartogram":
                    return PoliticalClient;
                case "twitter":
                    return TwitterPageClient;
                default:
                    throw Error("unknown page type " + pageName);
            }
        }
        
        var Type = type(client.page);
        return new Type(client, demoView);
    };

    ClientView.prototype.manageProgressBar = function(){
       
        if( !this.subject.showProgress ) {
           this.jDom.find('.progressBar').remove();
           return;
        }
       
        var jSpace = this.jDom.find('.progressBar'),
            jBar = jSpace.find('.bar'),
            receivedSoFar = 0,
            expectedSize;
       
        function updateBarWidth(){
           if( expectedSize ) {
              var proportionReceived = receivedSoFar / expectedSize,
                  roundedProportion = Math.round(proportionReceived*100)/100;
              jBar.attr('width', roundedProportion);
           }
        }

        var reset = function(){
            receivedSoFar = 0;
            updateBarWidth();
            removeClass(jSpace, 'complete');
        }.bind(this);
       
        this.subject.events('reset').on(reset);
       
        // for discrete parsing, everything goes back to zero when the request fails:
        if( this.subject.parseStrategy == 'discrete' ) { 
           this.subject.events('requestFail').on(reset);
        }
       
        this.subject.events('acceptedFromupstream').on(function( packet ){
           receivedSoFar++;

           if( packet.ordering.expectedSize ) {
              expectedSize = packet.ordering.expectedSize; 
           }
           
           updateBarWidth();           
           
           if( packet.ordering.isLast ) {
              addClass(jSpace, 'complete');
           }
           if( packet.ordering.isFirst ) {
              removeClass(jSpace, 'complete');
           }
        }.bind(this));
    };
   
    ClientView.prototype.showSpinner = function(){
        addClass(this.jDom, 'requesting');
    };
    ClientView.prototype.hideSpinner = function(){
        removeClass(this.jDom, 'requesting');
    };

    // ---------------------------------
    
    /* simple client turns on classes when packets are received, works for
     * any class/hiding based client svg */
    var SimpleClient = extend(ClientView, function(client, demoView){
        ClientView.apply(this, arguments);
        
        client.events('gotData').on(this.newData.bind(this));

        client.events('reset').on(function(){
            var ele = this.jDom[0],
                oldClassAttr = ele.getAttribute('class'),
                newClassAttr = oldClassAttr.replace(/received-\d/g, '');

            ele.setAttribute('class', newClassAttr);
        }.bind(this));        
    });

    SimpleClient.prototype.newData = function( packet ){
       addClass(this.jDom, 'received-' + packet.ordering.i);
    }; 

    // ---------------------------------

   /* like simple but animates new pins appearing */
   var PinDropClient = extend(SimpleClient, function(client, demoView){
      SimpleClient.apply(this, arguments);
   });

   PinDropClient.prototype.newData = function( packet ){
      
      // random delay before dropping because for non-progressive parsing
      // it looks odd if all drop perfectly together
      var randomDelay = Math.random() * 400;
      
      SimpleClient.prototype.newData.apply(this, arguments);

      var jPin = this.jDom.find('.unit-' + packet.ordering.i);

      jPin
         .css({opacity:0})
         .delay(randomDelay)         
         .animate({opacity:1});
      
      jPin.find('.pointer')
         .css({'translateY': -20})
         .delay(randomDelay)
         .animate({'translateY': 0}, {easing:'easeOutBounce'});
   };   

   // ---------------------------------   

    var PoliticalClient = extend(ClientView, function(client, demoView){
        ClientView.apply(this, arguments);
        
        this.runningTotals = {
            dem:0,
            rep:0
        };
        
        client.events('gotData').on(function( packet ){
            var payload = packet.payload;
            
            payloadAttributes(this.stateElement(payload.state), payload);
            
            this.updateTotals(payload);
        }.bind(this));

        client.events('reset').on(function(){
            this.jDom.find('.states [data-state]')
                        .each(function(){
                            $(this).attr('data-wonby', '')
                        });

            this.jDom.find('.pie path')
                .each(function(){
                    $(this).attr('d', '')
                });            

            this.runningTotals = {
                dem:0,
                rep:0
            };            
        }.bind(this));
    });

    PoliticalClient.prototype.stateElement = function(stateCode){
        var selector = '.states [data-state=' + stateCode + ']';
        return this.jDom.find(selector);
    };

    PoliticalClient.prototype.updateTotals = function(payload){
        var TOTAL_VOTES = 509,
            winner = payload.wonBy,
            total = this.runningTotals[winner] += payload.votes;
            proportion = total/TOTAL_VOTES,
            selector = '.pie [data-wonby=' + winner + ']';
        
        var jSlice = this.jDom.find(selector);
        
        jSlice.attr('d', this.pieWedge(proportion, 0.5) );
    };

    /**
     * @param proportion Number between 0 and 1, the proportion of the whole
     *  circle that the pie wedge should occupy.
     * @param direction Either 1 or -1 - should the wedge go CW or A-CW from
     *  the start angle
     */
    PoliticalClient.prototype.pieWedge = function(proportion, startPoint){

        function round(n) {
            return Math.round(n*100)/100;
        }

        var endPoint = startPoint + (2 * proportion),
            x1 = round(Math.cos(Math.PI * startPoint)),
            y1 = round(Math.sin(Math.PI * startPoint)),
            x2 = round(Math.cos(Math.PI * endPoint)),
            y2 = round(Math.sin(Math.PI * endPoint)),        
            largeArc = (proportion > 0.5) ? 1 : 0;
        
        return "M0 0 L" + x1 + " " + y1 + " A1 1 0 " + largeArc + " 1 " + x2 + " " + y2 + " z";
    };

    // ---------------------------------
    
    var TwitterPageClient = extend(ClientView, function(client, demoView){
        ClientView.apply(this, arguments);        
        
        var jTweetTemplate = $('#tweet'),
            jTweetScroll = this.jDom.find('.tweetsScroll'),
            packetsReceived = 0,
            livePacketsReceived = 0,
            MAX_DISPLAYABLE = 5;

        client.events('gotData').on(function( packet ){

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

        client.events('reset').on(function(){
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
