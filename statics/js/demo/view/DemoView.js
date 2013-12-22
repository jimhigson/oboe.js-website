var DemoView = extend(ThingView, function(demo){
    ThingView.apply(this,arguments);

    var DEFAULT_WIDTH = 500;
    var DEFAULT_HEIGHT = 200;

    this.jDom = stampFromTemplate($('#demo'), demo.colors);

    var containerDiv = $("[data-demo=" + demo.name + "]");

    containerDiv.append( this.jDom );

    this.baseWidth  = demo.width  || DEFAULT_WIDTH;
    this.baseHeight = demo.height || DEFAULT_HEIGHT;
    this.setDimensions(this.baseHeight, this.scalingFactor());

    this.initSubviewCreation();
 
    this.resizeWithWindow();

    this.setupControls();
});

DemoView.prototype.resizeWithWindow = function(ModelType, ViewType){
    $( window ).resize(function() {
        this.setDimensions(this.baseHeight, this.scalingFactor());
    }.bind(this));
};

DemoView.prototype.initSubviewCreation = function(ModelType, ViewType){
    this.createNewViewsForNewModelItems(Packet, PacketView);
    this.createNewViewsForNewModelItems(Message, MessageView);
    this.createNewViewsForNewModelItems(AggregatingServer, ServerView);
    this.createNewViewsForNewModelItems(Server, ServerView);
    this.createNewViewsForNewModelItems(Wire, WireView);
    this.createNewViewsForNewModelItems(Client, ClientView);
    this.createNewViewsForNewModelItems(Relay, RelayView);
    this.createNewViewsForNewModelItems(Barrier, BarrierView);
};

DemoView.prototype.createNewViewsForNewModelItems = function(ModelType, ViewType){
    this.subject.events(ModelType.name).on(function(modelItem){
        ViewType.factory
            ?   ViewType.factory(modelItem, this)
            :   new ViewType(modelItem, this);
    }.bind(this));
};

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

DemoView.prototype.setDimensions = function(height, scalingFactor){

    this.jDom.attr('height', height * scalingFactor);

    this.jDom.find('.scaling').attr('transform', 'scale(' + scalingFactor + ')');   
    this.jDom.find('.fade').attr('height', height);

    // The container div should have the height set on
    // the server-side to avoid the page reflowing.
    this.jDom.find('.reset').css('translateY', height);
    this.jDom.find('.play').attr('y', height / 2);
};
