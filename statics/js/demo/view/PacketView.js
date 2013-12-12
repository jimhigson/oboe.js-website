var PacketView = extend(ThingView, function (subject, demoView) {
    ThingView.apply(this,arguments);

    function templateName(){
        switch(subject.type) {
            case 'GET':
                return 'getRequest';
            case 'JSON':
                return (   subject.ordering.isFirst
                    ?   'firstPacket'
                    :       (   subject.ordering.isLast
                    ?   'lastPacket'
                    :   'packet'
                    )
                    );
        }
    }

    var className = [
        subject.name
        // since we only have categorical colours...
        ,   unitClass(subject)
    ].join(' ');

    this.initDomFromTemplate(
        'packets',
        templateName(),
        className
    );

    subject.events('move').on(function( xyFrom, xyTo, duration ){

        animateXy(this.jDom, 'translateX', 'translateY', xyFrom, xyTo, duration)

    }.bind(this));

    subject.events('done').on(function(){
        this.jDom.remove();
    }.bind(this));
});