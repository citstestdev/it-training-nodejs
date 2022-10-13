$( document ).ready(function() {

	jQuery('.testimonial-wrp').bxSlider({
	  auto: true,
	  infiniteLoop: false,
	  controls: false,
	  pager:true,
	  slideMargin:50,
	  minSlides:1,
	  maxSlides:1,
	  touchEnabled: true,
	  adaptiveHeight:true
	});


})
new WOW().init();

$(window).scroll(function() {
  var sticky = $('header'),
    scroll = $(window).scrollTop();
   
  if (scroll >= 40) { 
    sticky.addClass('fixed'); }
  else { 
   sticky.removeClass('fixed');

}
});


jQuery(document).ready(function() {
	var window_width = jQuery(window).width();

	
	if (window_width <= 649) {
		jQuery('.service-row').bxSlider({
		  auto: true,
		  infiniteLoop: false,
		  controls: true,
		  pager:false,
		  minSlides:1,
		  maxSlides:1,
		  touchEnabled: true,
		  adaptiveHeight:true,
		});
	
	}
	
	if (window_width <= 649) {
		jQuery('.best-wrk-row').bxSlider({
		  auto: true,
		  infiniteLoop: false,
		  controls: false,
		  pager:true,
		  minSlides:1,
		  maxSlides:1,
		  touchEnabled: true,
		  adaptiveHeight:true,
		});
	
	}
	
	//slicknav menu haeder
     jQuery('ul.menu-list').slicknav({
       prependTo:'.site-menu nav.menu-wrp',
       allowParentLinks:"false",
      	label: ' ',
       'duration':true,
       easingOpen: 'swing',
       easingClose: 'swing',
       closedSymbol:'&#9658;',
       openedSymbol:'&#9660;',
       animations:'jquery',
     });
});