$(function(){
   // make internal nav sticky
   if( $( window ).width() > 780 ) {
   
      $('.internalNav').sticky({
         topSpacing:10
      ,  getWidthFrom:'.col1'
      });         

      // highlight active item on internal nav 
       var prev;
       
       var headings = $('main h2').map(function(i, el) {
           return {
               top: $(el).offset().top,
               id: el.id
           }
       });
       
       function closest() {
           var h;
           var top = $(window).scrollTop() +20;
           var i = headings.length;
           while (i--) {
               h = headings[i];
               if (top >= h.top)
                   return h;
           }
       }
       
       function updateActive() {
           var activeHeading = closest();
                         
           if (!activeHeading)
               activeHeading = headings.first()[0];
                                 
           if (prev) {
               prev.removeClass('active');
           }
           
           var a = $('a[href="#' + activeHeading.id + '"]');
           a.addClass('active');
           
           prev = a;
       }
       
        if( headings.length ) {
            $(document).scroll(updateActive);
            updateActive();
        }

       // set up smooth scrolling for internal links
       // http://css-tricks.com/snippets/jquery/smooth-scrolling/
       $('a[href*=#]:not([href=#])').click(function() {
           if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
               var target = $(this.hash);
               target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
               if (target.length) {
                   $('html,body').animate({
                       scrollTop: target.offset().top
                   }, 500);
                   return false;
               }
           }
       });       
   }
});