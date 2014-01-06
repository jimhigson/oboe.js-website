/* this file is stuff that css doesn't do yet, or that I'm too lazy to do in css
 * It is not OO at all unlike the other JS. Pretty bad perhaps. */

var jWindow = $(window);

var headings = [];

function recordHeadingsPosition(){
   headings = $('main h2').map(function(i, el) {
      return {
         top: $(el).offset().top,
         id: el.id
      };
   });
}

function closestHeading() {
   var h;
   var top = jWindow.scrollTop() +100;
   var i = headings.length;
   while (i--) {
      h = headings[i];
      if (top >= h.top)
         return h;
   }
}

var prevHeading;
function updateActiveHeading() {
   if( headings.length == 0 ) {
      return;
   }
   
   var activeHeading = closestHeading();

   if (!activeHeading)
      activeHeading = headings.first()[0];

   if (prevHeading) {
      prevHeading.removeClass('active');
   }

   var a = $('a[href="#' + activeHeading.id + '"]');
   a.addClass('active');

   prevHeading = a;
}

jWindow.resize(function() {
   recordHeadingsPosition();
   updateActiveHeading();
});

$(function(){
   var MIN_SIZE_FOR_TWO_COL = 950,
       SIZE_REQUIRING_PHONE_LAYOUT = 600;

   var jWindow = $(window),
        jReducedLogo = $('.reducedLogo'),
        jSiteNav = $('#siteNav'),
        
        siteNavStickyOptions = {
            getWidthFrom: '#pageArea',
            topSpacing: 0
        };

    // make internal nav sticky
    if( jWindow.width() > SIZE_REQUIRING_PHONE_LAYOUT ) {
        jSiteNav.sticky(siteNavStickyOptions);
    }

    $('svg.menuButton').click(function() {
        jSiteNav.toggleClass('open')

        jSiteNav.sticky('restick', siteNavStickyOptions);
    });    

    
    jWindow.scroll(function() {
        var pos = jWindow.scrollTop();

        jReducedLogo.toggleClass('show', pos > 240);
    });    
    
   if( jWindow.width() > MIN_SIZE_FOR_TWO_COL ) {

      // make internal nav sticky
      $('.internalNav').sticky({
         topSpacing:28
      ,  getWidthFrom:'.col1'
      });


        // highlight active item on internal nav
        recordHeadingsPosition();
        updateActiveHeading();
       
        if( headings.length ) {
            $(document).scroll(updateActiveHeading);
            updateActiveHeading();
        }

       // set up smooth scrolling for internal links
       // http://css-tricks.com/snippets/jquery/smooth-scrolling/
       var jHtmlBody = $('html,body');
       
       $('ul.sections a').click(function() {
           if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
               var target = $(this.hash);
               target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
               if (target.length) {
                   jHtmlBody.animate({
                       scrollTop: (target.offset().top - 70)
                   }, 500);
                   return false;
               }
           }
       });
   }
});


