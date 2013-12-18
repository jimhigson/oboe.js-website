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
    
    var PacketViewRenderer = extend(ThingView, function (subject, demoView, holder) {
        ThingView.call(this,subject, demoView);

        this.initDomFromTemplate(
            'packets',
            this.templateName(subject),
            this.className(subject)
        );

        subject.events('move').on(this.animateMove.bind(this));

        subject.events('done').on(this.done.bind(this));        
    });

    PacketViewRenderer.prototype.className = function(subject){
        return [
            subject.name
            // since we only have categorical colours...
        ,   unitClass(subject)
        ].join(' ');
    };

    //---------------------------------------------
    
    var PacketOnWireView = extend(PacketViewRenderer, function(subject, demoView){
        PacketViewRenderer.apply(this, arguments);
    });

    PacketOnWireView.prototype.animateMove = function( xyFrom, xyTo, duration ){
        this.animateXy('translateX', 'translateY', xyFrom, xyTo, duration)
    };

    PacketOnWireView.prototype.done = function(){
        this.jDom.remove()
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

            //var clipId = holder.blockage.view.identifyClip( subject.direction );
            var clipId = oppositeDirectionTo( subject.direction ) + '-clip';

            console.log(this.jDom[0], clipId);

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
            jPacketInTransit = this.jDom.find('.packet');

        putAtXy( jPacketInTransit, 'circleX', 'circleY', xyFrom);

        jPacketInTransit.animate(
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
    };

    PacketOnMobileView.prototype.done = function() {};
    
    PacketOnMobileView.prototype.templateName = function(_packet) {
        return 'airwavePacket';
    };

    //---------------------------------------------

    return PacketView;
})();    
