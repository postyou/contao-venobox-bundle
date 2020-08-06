/*
 * VenoBox - jQuery Plugin
 * version: 1.5.3
 * @requires jQuery
 *
 * Examples at http://lab.veno.it/venobox/
 * License: MIT License
 * License URI: https://github.com/nicolafranchini/VenoBox/blob/master/LICENSE
 * Copyright 2013-2015 Nicola Franchini - @nicolafranchini
 *
 */
(function($){

    var autoplay,ios,ie9, bgcolor, blocknum, blocktitle, border, core, container, content,trigger,dest,
        evitacontent, evitanext, evitaprev, extraCss, figliall, framewidth, frameheight,
        infinigall, items, keyNavigationDisabled, margine, numeratio, overlayColor, overlay, top,
        prima, title, thisgall, thenext, theprev, type,
        finH, sonH, nextok, prevok,
        pre_open_callback,post_open_callback,pre_close_callback,post_close_callback,post_resize_callback;

    $.fn.extend({
        //plugin name - venobox
        venobox: function(options) {

            // default option
            var defaults = {
                framewidth: '',
                frameheight: '',
                border: '0',
                bgcolor: '#fff',
                titleattr: 'title', // specific attribute to get a title (e.g. [data-title]) - thanx @mendezcode
                numeratio: false,
                infinigall: false,
                overlayclose: true, // disable overlay click-close - thanx @martybalandis 
                pre_open_callback: undefined,
                post_open_callback: undefined,
                pre_close_callback: undefined,
                post_close_callback: undefined,
                post_resize_callback: undefined
            };

            var option = $.extend(defaults, options);

            return this.each(function() {
                var obj = $(this);

                // Prevent double initialization - thanx @matthistuff
                if(obj.data('venobox')) {
                    return true;
                }

                obj.addClass('vbox-item');
                obj.data('framewidth', option.framewidth);
                obj.data('frameheight', option.frameheight);
                obj.data('border', option.border);
                obj.data('bgcolor', option.bgcolor);
                obj.data('numeratio', option.numeratio);
                obj.data('infinigall', option.infinigall);
                obj.data('overlayclose', option.overlayclose);
                obj.data('pre_open_callback', option.pre_open_callback);
                obj.data('post_open_callback', option.post_open_callback);
                obj.data('pre_close_callback', option.pre_close_callback);
                obj.data('post_close_callback', option.post_close_callback);
                obj.data('post_resize_callback', option.post_resize_callback);
                obj.data('venobox', true);

                ios = (navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false);
                ie9 = ((document.all && !window.atob) ? true : false); // IE 9 or less

                obj.click(function(e){
                    e.stopPropagation();
                    e.preventDefault();

                    pre_open_callback = obj.data('pre_open_callback');
                    if(typeof pre_open_callback  != 'undefined' && $.isFunction(pre_open_callback)){
                        var rtn=pre_open_callback($(obj));
                        if(rtn!=undefined && !rtn)
                            return;
                    }
                    obj = $(this);
                    overlayColor = obj.data('overlay');
                    framewidth = obj.data('framewidth');
                    frameheight = obj.data('frameheight');
                    // set data-autoplay="true" for vimeo and youtube videos - thanx @zehfernandes
                    autoplay = obj.data('autoplay') || false;
                    border = obj.data('border');
                    bgcolor = obj.data('bgcolor');
                    nextok = false;
                    prevok = false;
                    keyNavigationDisabled = false;
                    post_open_callback = obj.data('post_open_callback');
                    pre_close_callback = obj.data('pre_close_callback');
                    post_close_callback = obj.data('post_close_callback');
                    post_resize_callback = obj.data('post_resize_callback');


                    dest = obj.attr('href');
                    extraCss = obj.data( 'css' ) || "";
                    top = $(window).scrollTop();
                    top = -top;


                    $('body').wrapInner('<div class="vwrap"></div>');

                    vwrap = $('.vwrap');
                    core = '<div class="vbox-overlay ' + extraCss + '" style="background:'+ overlayColor +'"><div class="vbox-preloader">Loading...</div><div class="vbox-container"><div class="vbox-content"></div></div><div class="vbox-title"></div><div class="vbox-num">0/0</div><div class="vbox-close">X</div><div class="vbox-next">next</div><div class="vbox-prev">prev</div></div>';

                    $('body').append(core);

                    overlay = $('.vbox-overlay');
                    container = $('.vbox-container');
                    content = $('.vbox-content');
                    blocknum = $('.vbox-num');
                    blocktitle = $('.vbox-title');
                    trigger =$(obj);

                    content.html('');
                    content.css('opacity', '0');

                    checknav();

                    overlay.css('min-height', $(window).outerHeight());
                    

                    if (true) {

                        // fade in overlay
                        overlay.animate({opacity:1}, 250, function(){
                            overlay.css({
                                'min-height': $(window).outerHeight(),
                                height : 'auto'
                            });
                            if(obj.data('type') == 'iframe'){
                                loadIframe();
                            }else if (obj.data('type') == 'inline'){
                                loadInline();
                            }else if (obj.data('type') == 'ajax'){
                                loadAjax();
                            }else if (obj.data('type') == 'vimeo'){
                                loadVimeo(autoplay);
                            }else if (obj.data('type') == 'youtube'){
                                loadYoutube(autoplay);
                            } else {
                                content.html('<img src="'+dest+'">');
                                preloadFirst();
                            }
                        });
                    } else {
                        overlay.on("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function(e){

                            // Check if transition is on the overlay - thanx @kanduvisla
                            if( e.target != e.currentTarget ) {
                                return;
                            }

                            overlay.css({
                                'min-height': $(window).outerHeight(),
                                height : 'auto'
                            });
                            if(obj.data('type') == 'iframe'){
                                loadIframe();
                            }else if (obj.data('type') == 'inline'){
                                loadInline();
                            }else if (obj.data('type') == 'ajax'){
                                loadAjax();
                            }else if (obj.data('type') == 'vimeo'){
                                loadVimeo(autoplay);
                            }else if (obj.data('type') == 'youtube'){
                                loadYoutube(autoplay);
                            } else {
                                content.html('<img src="'+dest+'">');
                                preloadFirst();
                            }
                        });
                        overlay.css('opacity', '1');
                    }

                    if (ios) {
                        vwrap.css({
                            'position': 'fixed',
                            'top': top,
                            'opacity': '0'
                        }).data('top', top);
                    } else {
                        vwrap.css({
                            'position': 'fixed',
                            'top': top
                        }).data('top', top);
                        $(window).scrollTop(0);
                    }

                    /* -------- CHECK NEXT / PREV -------- */
                    function checknav(){

                        thisgall = obj.data('gall');
                        numeratio = obj.data('numeratio');
                        infinigall = obj.data('infinigall');

                        items = $('.vbox-item[data-gall="' + thisgall + '"]');

                        if(items.length > 1 && numeratio === true){
                            blocknum.html(items.index(obj)+1 + ' / ' + items.length);
                            blocknum.show();
                        }else{
                            blocknum.hide();
                        }

                        thenext = items.eq( items.index(obj) + 1 );
                        theprev = items.eq( items.index(obj) - 1 );

                        if(obj.attr(option.titleattr)){
                            title = obj.attr(option.titleattr);
                            blocktitle.show();
                        }else{
                            title = '';
                            blocktitle.hide();
                        }

                        if (items.length > 1 && infinigall === true) {

                            nextok = true;
                            prevok = true;

                            if(thenext.length < 1 ){
                                thenext = items.eq(0);
                            }
                            if(items.index(obj) < 1 ){
                                theprev = items.eq( items.index(items.length) );
                            }

                        } else {

                            if (thenext.length > 0) {
                                $('.vbox-next').css('display', 'block');
                                nextok = true;
                            } else {
                                $('.vbox-next').css('display', 'none');
                                nextok = false;
                            }
                            if (items.index(obj) > 0) {
                                $('.vbox-prev').css('display', 'block');
                                prevok = true;
                            } else {
                                $('.vbox-prev').css('display', 'none');
                                prevok = false;
                            }
                        }
                    }

                    /* -------- NAVIGATION CODE -------- */
                    var gallnav = {

                        prev: function() {

                            if (keyNavigationDisabled) {
                                return;
                            } else {
                                keyNavigationDisabled = true;
                            }

                            overlayColor = theprev.data('overlay');

                            framewidth = theprev.data('framewidth');
                            frameheight = theprev.data('frameheight');
                            border = theprev.data('border');
                            bgcolor = theprev.data('bgcolor');
                            dest = theprev.attr('href');

                            autoplay = theprev.data('autoplay');

                            if(theprev.attr(option.titleattr)){
                                title = theprev.attr(option.titleattr);
                            }else{
                                title = '';
                            }

                            if (overlayColor === undefined ) {
                                overlayColor = "";
                            }

                            content.animate({ opacity:0}, 500, function(){

                                overlay.css('background',overlayColor);

                                if (theprev.data('type') == 'iframe') {
                                    loadIframe();
                                } else if (theprev.data('type') == 'inline'){
                                    loadInline();
                                } else if (theprev.data('type') == 'ajax'){
                                    loadAjax();
                                } else if (theprev.data('type') == 'youtube'){
                                    loadYoutube(autoplay);
                                } else if (theprev.data('type') == 'vimeo'){
                                    loadVimeo(autoplay);
                                }else{
                                    content.html('<img src="'+dest+'">');
                                    preloadFirst();
                                }
                                obj = theprev;
                                checknav();
                                keyNavigationDisabled = false;
                            });

                        },

                        next: function() {

                            if (keyNavigationDisabled) {
                                return;
                            } else {
                                keyNavigationDisabled = true;
                            }

                            overlayColor = thenext.data('overlay');

                            framewidth = thenext.data('framewidth');
                            frameheight = thenext.data('frameheight');
                            border = thenext.data('border');
                            bgcolor = thenext.data('bgcolor');
                            dest = thenext.attr('href');
                            autoplay = thenext.data('autoplay');

                            if(thenext.attr(option.titleattr)){
                                title = thenext.attr(option.titleattr);
                            }else{
                                title = '';
                            }

                            if (overlayColor === undefined ) {
                                overlayColor = "";
                            }

                            content.animate({ opacity:0}, 500, function(){

                                overlay.css('background',overlayColor);

                                if (thenext.data('type') == 'iframe') {
                                    loadIframe();
                                } else if (thenext.data('type') == 'inline'){
                                    loadInline();
                                } else if (thenext.data('type') == 'ajax'){
                                    loadAjax();
                                } else if (thenext.data('type') == 'youtube'){
                                    loadYoutube(autoplay);
                                } else if (thenext.data('type') == 'vimeo'){
                                    loadVimeo(autoplay);
                                }else{
                                    content.html('<img src="'+dest+'">');
                                    preloadFirst();
                                }
                                obj = thenext;
                                checknav();
                                keyNavigationDisabled = false;
                            });

                        }

                    };

                    /* -------- NAVIGATE WITH ARROW KEYS -------- */
                    $('body').keydown(function(e) {

                        if(e.keyCode == 37 && prevok == true) { // left
                            gallnav.prev();
                        }

                        if(e.keyCode == 39 && nextok == true) { // right
                            gallnav.next();
                        }

                    });

                    /* -------- PREVGALL -------- */
                    $('.vbox-prev').click(function(){
                        gallnav.prev();
                    });

                    /* -------- NEXTGALL -------- */
                    $('.vbox-next').click(function(){
                        gallnav.next();
                    });

                    /* -------- ESCAPE HANDLER -------- */
                    function escapeHandler(e) {
                        if(e.keyCode === 27) {
                            closeVbox();
                        }
                    }

                    /* -------- CLOSE VBOX -------- */

                    function closeVbox(){
                        if(typeof pre_close_callback  != 'undefined' && $.isFunction(pre_close_callback)){
                            var rtn=pre_close_callback(trigger,overlay,container,content,blocknum,blocktitle);
                            if(rtn!=undefined && !rtn){
                                return;
                            }
                        }


                        $('body').off('keydown', escapeHandler);

                        if (ie9) {

                            overlay.animate({opacity:0}, 500, function(){
                                overlay.remove();
                                $('.vwrap').children().unwrap();
                                $(window).scrollTop(-top);
                                keyNavigationDisabled = false;
                                obj.focus();
                            });

                        } else {

                            overlay.off("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd");
                            overlay.on("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function(e){

                                // Check if transition is on the overlay - thanx @kanduvisla
                                if( e.target != e.currentTarget ) {
                                    return;
                                }

                                overlay.remove();
                                if (ios) {
                                    $('.vwrap').on("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function(){
                                        $('.vwrap').children().unwrap();
                                        $(window).scrollTop(-top);
                                    });
                                    $('.vwrap').css('opacity', '1');
                                }else{
                                    $('.vwrap').children().unwrap();
                                    $(window).scrollTop(-top);
                                }
                                keyNavigationDisabled = false;
                                obj.focus();
                            });
                            if(typeof post_close_callback  != 'undefined' && $.isFunction(post_close_callback))
                                overlay.animate({
                                    'opacity': '0'
                                },'slow',post_close_callback(trigger,overlay,container,content,blocknum,blocktitle));
                            else
                                overlay.animate({
                                    'opacity': '0'
                                },'slow');
                        }
                    }

                    /* -------- CLOSE CLICK -------- */
                    var closeclickclass = '.vbox-overlay';
                    if(!obj.data('overlayclose')){
                        closeclickclass = '.vbox-close';    // close only on X
                    }

                    $(closeclickclass).click(function(e){
                        evitacontent = '.figlio';
                        evitaprev = '.vbox-prev';
                        evitanext = '.vbox-next';
                        figliall = '.figlio *';
                        if(!$(e.target).is(evitacontent) && !$(e.target).is(evitanext) && !$(e.target).is(evitaprev)&& !$(e.target).is(figliall)){
                            closeVbox();
                        }
                    });
                    $('body').keydown(escapeHandler);
                    return false;
                });
            });
        }
    });

    /* -------- LOAD AJAX -------- */
    function loadAjax(){
        console.log('ajax');
        $.ajax({
            url: dest,
            cache: false
        }).done(function( msg ) {
            content.html('<div class="vbox-inline">'+ msg +'</div>');
          var imgs=content.find("img");
            var len=imgs.length;
            var count=0;
            if(len>0)
                imgs.each(function(i,elem){
                    $(this).one("load",function(){
                        count++;
                        if(count==len)
                            updateoverlay(true);
                    }).each(function() {
                        if(this.complete) $(this).load();
                    });
                });
            else
                updateoverlay(true);

        }).fail(function() {
            content.html('<div class="vbox-inline"><p>Error retrieving contents, please retry</div>');
            updateoverlay(true);
        })
    }

    /* -------- LOAD IFRAME -------- */
    function loadIframe(){
        content.html('<iframe class="venoframe" src="'+dest+'"></iframe>');
        //  $('.venoframe').load(function(){ // valid only for iFrames in same domain
        updateoverlay();
        //  });
    }

    /* -------- LOAD VIMEO -------- */
    function loadVimeo(autoplay){
        var pezzi = dest.split('/');
        var videoid = pezzi[pezzi.length-1];
        var stringAutoplay = autoplay ? "?autoplay=1" : "";
        content.html('<iframe class="venoframe" webkitallowfullscreen mozallowfullscreen allowfullscreen frameborder="0" src="https://player.vimeo.com/video/'+videoid+stringAutoplay+'"></iframe>');
        updateoverlay();
    }

    /* -------- LOAD YOUTUBE -------- */
    function loadYoutube(autoplay){
        var pezzi = dest.split('/');
        var videoid = pezzi[pezzi.length-1];
        var stringAutoplay = autoplay ? "?autoplay=1" : "";
        content.html('<iframe class="venoframe" webkitallowfullscreen mozallowfullscreen allowfullscreen src="https://www.youtube.com/embed/'+videoid+stringAutoplay+'"></iframe>');
        updateoverlay();
    }

    /* -------- LOAD INLINE -------- */
    function loadInline(){
        content.html('<div class="vbox-inline">'+$(dest).html()+'</div>');
        updateoverlay();
    }

    /* -------- PRELOAD IMAGE -------- */
    function preloadFirst(){
        prima = $('.vbox-content').find('img');
        prima.one('load', function() {
            updateoverlay();
        }).each(function() {
            if(this.complete) $(this).load();
        });
    }

    /* -------- CENTER ON LOAD -------- */
    function updateoverlay(notopzero){

        notopzero = notopzero || false;
        if (notopzero != true) {
            $(window).scrollTop(0);
        }
        blocktitle.html(title);
        var child=content.find(">:first-child");
        if(frameheight=='' && !child.hasClass('venoframe'))
            frameheight="auto";
        child.addClass('figlio').css('width', framewidth).css('height', frameheight).css('padding', border).css('background', bgcolor);
        sonH = content.outerHeight();
        finH = $(window).height();

        if(sonH+80 < finH){
            margine = (finH - sonH)/2;
            content.css('margin-top', margine);
            content.css('margin-bottom', margine);

        }else{
            content.css('margin-top', '40px');
            content.css('margin-bottom', '40px');
        }

        if(typeof post_open_callback  != 'undefined' && $.isFunction(post_open_callback))
            content.animate({
                'opacity': '1'
            },'slow',post_open_callback(trigger,overlay,container,content,blocknum,blocktitle));
        else
            content.animate({
                'opacity': '1'
            },'slow');
    }

    /* -------- CENTER ON RESIZE -------- */
    function updateoverlayresize(){
        if($('.vbox-content').length) {
            if (typeof post_resize_callback != 'undefined' && $.isFunction(post_resize_callback))
                post_resize_callback(trigger,overlay,container,content,blocknum,blocktitle);
            sonH = content.height();
            finH = $(window).height();

            if (sonH + 80 < finH) {
                margine = (finH - sonH) / 2;
                content.css('margin-top', margine);
                content.css('margin-bottom', margine);
            } else {
                content.css('margin-top', '40px');
                content.css('margin-bottom', '40px');
            }
        }
    }

    $(window).resize(function(){
        updateoverlayresize();
    });

})(jQuery);
