var PacketView = (function(){
    "use strict";

    var MOBILE_WAVE_OVERSHOOT = 1.66;
    
    var PacketView = extend(ThingView, function (subject, demoView) {
        
        ThingView.apply(this,arguments);
        
        subject.events('isOn').on(function( holder ){
            
            var ProxyConstructor = (holder.medium == 'mobile')
                                 ? PacketOnMobileView
                                 : PacketOnWireView
                                 ;
    
            new ProxyConstructor(subject, demoView, holder);
            
        }.bind(this));
    
    });

    //---------------------------------------------    
    
    var PacketViewRenderer = extend(ThingView, function (packet, demoView, holder) {
        var packetEvents = packet.events;
        
        ThingView.call(this, packet, demoView);

        this.initDomFromTemplate(
            'packets',
            this.templateName(packet),
            this.className(packet)
        );
        
        if( packet.payload ) {
            payloadAttributes(this.jDom, packet.payload);
        }

        packetEvents('move').on(this.animateMove.bind(this));
        packetEvents('done').on(this.done.bind(this));        
    });

    PacketViewRenderer.prototype.className = function(subject){
        return subject.name + ' ' + unitClass(subject);
    };

    PacketViewRenderer.prototype.done = function(){
        this.jDom.remove();
    };   

    //---------------------------------------------
    
    var PacketOnWireView = extend(PacketViewRenderer, function(subject, demoView){
        PacketViewRenderer.apply(this, arguments);
    });

    PacketOnWireView.prototype.animateMove = function( xyFrom, xyTo, duration ){
        this.animateXy('translateX', 'translateY', xyFrom, xyTo, duration)
    };
   
    PacketOnWireView.prototype.templateName = function(packet){
        switch(packet.type) {
            case 'GET':
                return 'getRequest';
            case 'JSON':
                return (   packet.ordering.isFirst
                    ?   'firstPacket'
                    :   (   packet.ordering.isLast
                    ?   'lastPacket'
                    :   'packet'
                    )
                    );
        }        
    };

    //---------------------------------------------    
    
    var PacketOnMobileView = extend(PacketViewRenderer, function(subject, demoView, holder){
        PacketViewRenderer.apply(this, arguments);

        if( holder.blockage ) {

            var clipId = oppositeDirectionTo( subject.direction ) + '-clip';

            this.jDom[0].setAttribute('clip-path', 'url(#' + clipId + ')');
        }        
    });

    PacketOnMobileView.prototype.animateMove = function( xyFrom, xyTo, duration ){
        
        function distance(xy1, xy2){
            function sq(n){
                return Math.pow(n, 2);
            }

            return Math.sqrt(sq(xy2.x - xy1.x) + sq(xy2.y - xy1.y));
        }        
        
        var packet = this.subject,
            transmissionDistance = distance( xyFrom, xyTo),
            jAirbornePacketInTransit = this.jDom.find('.packet');
        
        this.jPausibleElements = jAirbornePacketInTransit;

        this.putAtXy( jAirbornePacketInTransit, 'circleX', 'circleY', xyFrom);

        jAirbornePacketInTransit.animate(
            {   circleRadius: transmissionDistance * MOBILE_WAVE_OVERSHOOT,
                opacity: 0
            },
            {   duration:duration * MOBILE_WAVE_OVERSHOOT,
                queue:false,
                complete:function(){
                    this.jDom.remove();
                }.bind(this)
            }
        );
        this.pauseAnimationIfDemoPaused(jAirbornePacketInTransit);
    };

    PacketViewRenderer.prototype.done = function(){
       // when we get a done event, remove the packet after a short time.
       // this will do nothing in most cases because the animation will
       // already have removed it when it completes but here we allow
       // a little movement to continue after the wave hits the target
       window.setTimeout(function(){
          this.jDom.remove();
       }.bind(this), 500);
    };   
    
    PacketOnMobileView.prototype.templateName = function(_packet) {
        return 'airwavePacket';
    };

    //---------------------------------------------

    return PacketView;
})();
