var DemoView = extend(ThingView, function(demo){
    ThingView.apply(this,arguments);

    this.jDom = stampFromTemplate($('#demo'), demo.colors);

    var containerDiv = $("[data-demo=" + demo.name + "]");

    containerDiv.append( this.jDom );

    this.baseWidth  = demo.width;
    this.baseHeight = demo.height;
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
    this.createNewViewsForNewModelItems(OriginServer, ServerView);
    this.createNewViewsForNewModelItems(Wire, WireView);
    this.createNewViewsForNewModelItems(Client, ClientView);
    this.createNewViewsForNewModelItems(Relay, RelayView);
    this.createNewViewsForNewModelItems(Barrier, BarrierView);
    this.createNewViewsForNewModelItems(Cache, ServerView);
};

DemoView.prototype.createNewViewsForNewModelItems = function(ModelType, ViewType){
    if( !ModelType.newEvent ) {
        throw new Error('constructors must have .newEvent set to be listened to'); 
    }
    
    this.subject.events(ModelType.newEvent).on(function(modelItem){
        ViewType.factory
            ?   ViewType.factory(modelItem, this)
            :   new ViewType(modelItem, this);
    }.bind(this));
};

DemoView.prototype.setupControls = function(){
    var jDom = this.jDom,
        jControls = jDom.find('.controls'),
        jFadeControls = jControls.find('.fadeControls'),
        jLightbox = jDom.find('.lightbox'),
        jReset = jControls.find('.reset').hide(),
        demo = this.subject,
        demoEvents = demo.events;

    jLightbox.click(function(){
        demo.unpause();
    });
    
    jLightbox.hide();
    
    demoEvents('paused').on(function(){
        jLightbox.show();
    });

    demoEvents('unpaused').on(function(){
        jLightbox.hide();
    });    
    
    demoEvents('started').on(function(){
        jFadeControls.fadeOut();
        jReset.fadeIn();
        listenForClickOnReset();
    });

    demoEvents('reset').on(function(){
        jFadeControls.fadeIn();
        jReset.fadeOut();
        jLightbox.fadeOut();
        listenForClickOnPlay();
    });

    function listenForClickOnPlay(){
        jFadeControls.one('click', function(){
            demo.start();
        });
    }

    function listenForClickOnReset(){
        jReset.one('click', function(){
            demo.reset();
        });
    }
    
    listenForClickOnPlay();
};

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
