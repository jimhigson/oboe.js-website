var DemoView = extend(ThingView, function(subject){
    ThingView.apply(this,arguments);

    var DEFAULT_WIDTH = 500;
    var DEFAULT_HEIGHT = 200;

    this.jDom = stampFromTemplate($('#demo'));

    var containerDiv = $("[data-demo=" + subject.name + "]");

    containerDiv.append( this.jDom );

    this.baseWidth  = subject.width  || DEFAULT_WIDTH;
    this.baseHeight = subject.height || DEFAULT_HEIGHT;
    this.setDimensions(this.baseHeight, this.baseWidth, this.scalingFactor());

    Packet.new.on( function(newPacket){

        if( newPacket.demo == subject )
            new PacketView(newPacket, this);

    }.bind(this));

    Message.new.on(function(newMessage){
        if( newMessage.demo == subject ) {
            new MessageView(newMessage, this);
        }
    }.bind(this));

    $( window ).resize(function() {
        this.setDimensions(this.baseHeight, this.baseWidth, this.scalingFactor());
    }.bind(this));

    this.setupControls();
});

DemoView.prototype.setupControls = function(){
    var jControls = this.jDom.find('.controls'),
        jLightbox = jControls.find('.lightbox'),
        jReset = jControls.find('.reset').hide(),
        subject = this.subject;

    function listenForPlay(){
        jLightbox.one('click', function(){

            jLightbox.fadeOut();
            jLightbox.promise().done( function(){
                window.setTimeout( function(){
                    subject.start();
                }, 500);
            });

            jReset.fadeIn();

            listenForReset();
        });
    }

    function listenForReset(){
        jReset.one('click', function(){

            subject.reset();
            jLightbox.fadeIn();
            jReset.fadeOut();
            listenForPlay();
        });
    }

    listenForPlay();
}

DemoView.prototype.scalingFactor = function(){
    var spaceAvailable = this.jDom.parents('main').width();
    return spaceAvailable / this.baseWidth;
};

DemoView.prototype.setDimensions = function(height, width, scalingFactor){

    var container = this.jDom.parents('figure'),
        dimensions = {  width: width * scalingFactor,
            height: height * scalingFactor};

    container.css(dimensions);
    this.jDom.attr(dimensions);

    this.jDom.find('.scaling').attr('transform', 'scale(' + scalingFactor + ')');

    // this should really be more template-esque
    // but can't find a tempting engine that handles
    // SVG elements well. Need to find a DOM-based engine
    // that starts by doing Element.clone().
    this.jDom.attr('height', height * scalingFactor);
    this.jDom.find('.fade').attr('height', height);

    // The container div should have the height set on
    // the server-side to avoid the page reflowing.
    this.jDom.find('.reset').css('translateY', height);
    this.jDom.find('.play').attr('y', height / 2);
};