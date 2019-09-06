var jQueryScriptOutputted = false, call42;
function initJQuery() {

  function isNeedJQLoading() {
    if (typeof(jQuery) !== 'undefined') {
      var v1 = parseInt(jQuery.fn.jquery.split('.')[0]);
      var v2 = parseInt(jQuery.fn.jquery.split('.')[1]);
      return (v1 === 1 && v2 < 4) || v1 > 1;
    }
    return true;
  }

  if (isNeedJQLoading() && ! jQueryScriptOutputted) {

    //only output the script once..
    jQueryScriptOutputted = true;

    //output the script (load it from google api)
    document.write("<scr" + "ipt type=\"text/javascript\" src=\"https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js\"></scr" + "ipt>");
    document.write("<scr" + "ipt type=\"text/javascript\">var jq_1_11 = $.noConflict(true);initCall42Widget(jq_1_11);</scr" + "ipt>");

  } else {
    initCall42Widget($);
  }
}

function initCall42Widget($) {

  /*
   * Made from SimpleModal 1.4.4 - jQuery Plugin
   * http://simplemodal.com/
   */
  (function(b){"function"===typeof define&&define.amd?define(["jquery"],b):b($)})(function(b){var j=[],n=b(document),k=navigator.userAgent.toLowerCase(),l=b(window),g=[],o=null,p=/msie/.test(k)&&!/opera/.test(k),q=/opera/.test(k),m,r;m=p&&/msie 6./.test(k)&&"object"!==typeof window.XMLHttpRequest;r=p&&/msie 7.0/.test(k);b.modal=function(a,h){return b.modal.impl.init(a,h)};b.modal.close=function(){b.modal.impl.close()};b.modal.focus=function(a){b.modal.impl.focus(a)};b.modal.setContainerDimensions=
    function(){b.modal.impl.setContainerDimensions()};b.modal.setPosition=function(){b.modal.impl.setPosition()};b.modal.update=function(a,h){b.modal.impl.update(a,h)};b.fn.modal=function(a){return b.modal.impl.init(this,a)};b.modal.defaults={appendTo:"body",focus:!0,opacity:50,overlayId:"simplemodal-overlay",overlayCss:{},containerId:"simplemodal-container",containerCss:{},dataId:"simplemodal-data",dataCss:{},minHeight:null,minWidth:null,maxHeight:null,maxWidth:null,autoResize:!1,autoPosition:!0,zIndex:1E3,
    close:!0,closeHTML:'<a class="modalCloseImg" title="Close"></a>',closeClass:"simplemodal-close",escClose:!0,overlayClose:!1,fixed:!0,position:null,persist:!1,modal:!0,onOpen:null,onShow:null,onClose:null};b.modal.impl={d:{},init:function(a,h){if(this.d.data)return!1;o=p&&!b.support.boxModel;this.o=b.extend({},b.modal.defaults,h);this.zIndex=this.o.zIndex;this.occb=!1;if("object"===typeof a){if(a=a instanceof b?a:b(a),this.d.placeholder=!1,0<a.parent().parent().size()&&(a.before(b("<span></span>").attr("id",
      "simplemodal-placeholder").css({display:"none"})),this.d.placeholder=!0,this.display=a.css("display"),!this.o.persist))this.d.orig=a.clone(!0)}else if("string"===typeof a||"number"===typeof a)a=b("<div></div>").html(a);else return alert("SimpleModal Error: Unsupported data type: "+typeof a),this;this.create(a);this.open();b.isFunction(this.o.onShow)&&this.o.onShow.apply(this,[this.d]);return this},create:function(a){this.getDimensions();if(this.o.modal&&m)this.d.iframe=b('<iframe src="javascript:false;"></iframe>').css(b.extend(this.o.iframeCss,
    {display:"none",opacity:0,position:"fixed",height:g[0],width:g[1],zIndex:this.o.zIndex,top:0,left:0})).appendTo(this.o.appendTo);this.d.overlay=b("<div></div>").attr("id",this.o.overlayId).addClass("simplemodal-overlay").css(b.extend(this.o.overlayCss,{display:"none",opacity:this.o.opacity/100,height:this.o.modal?j[0]:0,width:this.o.modal?j[1]:0,position:"fixed",left:0,top:0,zIndex:this.o.zIndex+1})).appendTo(this.o.appendTo);this.d.container=b("<div></div>").attr("id",this.o.containerId).addClass("simplemodal-container").css(b.extend({position:this.o.fixed?
    "fixed":"absolute"},this.o.containerCss,{display:"none",zIndex:this.o.zIndex+2})).append(this.o.close&&this.o.closeHTML?b(this.o.closeHTML).addClass(this.o.closeClass):"").appendTo(this.o.appendTo);this.d.wrap=b("<div></div>").attr("tabIndex",-1).addClass("simplemodal-wrap").css({height:"100%",outline:0,width:"100%"}).appendTo(this.d.container);this.d.data=a.attr("id",a.attr("id")||this.o.dataId).addClass("simplemodal-data").css(b.extend(this.o.dataCss,{display:"none"})).appendTo("body");this.setContainerDimensions();
    this.d.data.appendTo(this.d.wrap);(m||o)&&this.fixIE()},bindEvents:function(){var a=this;b("."+a.o.closeClass).bind("click.simplemodal",function(b){b.preventDefault();a.close()});a.o.modal&&a.o.close&&a.o.overlayClose&&a.d.overlay.bind("click.simplemodal",function(b){b.preventDefault();a.close()});n.bind("keydown.simplemodal",function(b){a.o.modal&&9===b.keyCode?a.watchTab(b):a.o.close&&a.o.escClose&&27===b.keyCode&&(b.preventDefault(),a.close())});l.bind("resize.simplemodal orientationchange.simplemodal",
    function(){a.getDimensions();a.o.autoResize?a.setContainerDimensions():a.o.autoPosition&&a.setPosition();m||o?a.fixIE():a.o.modal&&(a.d.iframe&&a.d.iframe.css({height:g[0],width:g[1]}),a.d.overlay.css({height:j[0],width:j[1]}))})},unbindEvents:function(){b("."+this.o.closeClass).unbind("click.simplemodal");n.unbind("keydown.simplemodal");l.unbind(".simplemodal");this.d.overlay.unbind("click.simplemodal")},fixIE:function(){var a=this.o.position;b.each([this.d.iframe||null,!this.o.modal?null:this.d.overlay,
    "fixed"===this.d.container.css("position")?this.d.container:null],function(b,e){if(e){var f=e[0].style;f.position="absolute";if(2>b)f.removeExpression("height"),f.removeExpression("width"),f.setExpression("height",'document.body.scrollHeight > document.body.clientHeight ? document.body.scrollHeight : document.body.clientHeight + "px"'),f.setExpression("width",'document.body.scrollWidth > document.body.clientWidth ? document.body.scrollWidth : document.body.clientWidth + "px"');else{var c,d;a&&a.constructor===
  Array?(c=a[0]?"number"===typeof a[0]?a[0].toString():a[0].replace(/px/,""):e.css("top").replace(/px/,""),c=-1===c.indexOf("%")?c+' + (t = document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop) + "px"':parseInt(c.replace(/%/,""))+' * ((document.documentElement.clientHeight || document.body.clientHeight) / 100) + (t = document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop) + "px"',a[1]&&(d="number"===typeof a[1]?
    a[1].toString():a[1].replace(/px/,""),d=-1===d.indexOf("%")?d+' + (t = document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft) + "px"':parseInt(d.replace(/%/,""))+' * ((document.documentElement.clientWidth || document.body.clientWidth) / 100) + (t = document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft) + "px"')):(c='(document.documentElement.clientHeight || document.body.clientHeight) / 2 - (this.offsetHeight / 2) + (t = document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop) + "px"',
    d='(document.documentElement.clientWidth || document.body.clientWidth) / 2 - (this.offsetWidth / 2) + (t = document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft) + "px"');f.removeExpression("top");f.removeExpression("left");f.setExpression("top",c);f.setExpression("left",d)}}})},focus:function(a){var h=this,a=a&&-1!==b.inArray(a,["first","last"])?a:"first",e=b(":input:enabled:visible:"+a,h.d.wrap);setTimeout(function(){0<e.length?e.focus():h.d.wrap.focus()},
    10)},getDimensions:function(){var a="undefined"===typeof window.innerHeight?l.height():window.innerHeight;j=[n.height(),n.width()];g=[a,l.width()]},getVal:function(a,b){return a?"number"===typeof a?a:"auto"===a?0:0<a.indexOf("%")?parseInt(a.replace(/%/,""))/100*("h"===b?g[0]:g[1]):parseInt(a.replace(/px/,"")):null},update:function(a,b){if(!this.d.data)return!1;this.d.origHeight=this.getVal(a,"h");this.d.origWidth=this.getVal(b,"w");this.d.data.hide();a&&this.d.container.css("height",a);b&&this.d.container.css("width",
    b);this.setContainerDimensions();this.d.data.show();this.o.focus&&this.focus();this.unbindEvents();this.bindEvents()},setContainerDimensions:function(){var a=m||r,b=this.d.origHeight?this.d.origHeight:q?this.d.container.height():this.getVal(a?this.d.container[0].currentStyle.height:this.d.container.css("height"),"h"),a=this.d.origWidth?this.d.origWidth:q?this.d.container.width():this.getVal(a?this.d.container[0].currentStyle.width:this.d.container.css("width"),"w"),e=this.d.data.outerHeight(!0),f=
    this.d.data.outerWidth(!0);this.d.origHeight=this.d.origHeight||b;this.d.origWidth=this.d.origWidth||a;var c=this.o.maxHeight?this.getVal(this.o.maxHeight,"h"):null,d=this.o.maxWidth?this.getVal(this.o.maxWidth,"w"):null,c=c&&c<g[0]?c:g[0],d=d&&d<g[1]?d:g[1],i=this.o.minHeight?this.getVal(this.o.minHeight,"h"):"auto",b=b?this.o.autoResize&&b>c?c:b<i?i:b:e?e>c?c:this.o.minHeight&&"auto"!==i&&e<i?i:e:i,c=this.o.minWidth?this.getVal(this.o.minWidth,"w"):"auto",a=a?this.o.autoResize&&a>d?d:a<c?c:a:f?
    f>d?d:this.o.minWidth&&"auto"!==c&&f<c?c:f:c;this.d.container.css({height:b,width:a});this.d.wrap.css({overflow:e>b||f>a?"auto":"visible"});this.o.autoPosition&&this.setPosition()},setPosition:function(){var a,b;a=g[0]/2-this.d.container.outerHeight(!0)/2;b=g[1]/2-this.d.container.outerWidth(!0)/2;var e="fixed"!==this.d.container.css("position")?l.scrollTop():0;this.o.position&&"[object Array]"===Object.prototype.toString.call(this.o.position)?(a=e+(this.o.position[0]||a),b=this.o.position[1]||b):
    a=e+a;this.d.container.css({left:b,top:a})},watchTab:function(a){if(0<b(a.target).parents(".simplemodal-container").length){if(this.inputs=b(":input:enabled:visible:first, :input:enabled:visible:last",this.d.data[0]),!a.shiftKey&&a.target===this.inputs[this.inputs.length-1]||a.shiftKey&&a.target===this.inputs[0]||0===this.inputs.length)a.preventDefault(),this.focus(a.shiftKey?"last":"first")}else a.preventDefault(),this.focus()},open:function(){this.d.iframe&&this.d.iframe.show();b.isFunction(this.o.onOpen)?
    this.o.onOpen.apply(this,[this.d]):(this.d.overlay.show(),this.d.container.show(),this.d.data.show());this.o.focus&&this.focus();this.bindEvents()},close:function(){if(!this.d.data)return!1;this.unbindEvents();if(b.isFunction(this.o.onClose)&&!this.occb)this.occb=!0,this.o.onClose.apply(this,[this.d]);else{if(this.d.placeholder){var a=b("#simplemodal-placeholder");this.o.persist?a.replaceWith(this.d.data.removeClass("simplemodal-data").css("display",this.display)):(this.d.data.hide().remove(),a.replaceWith(this.d.orig))}else this.d.data.hide().remove();
    this.d.container.hide().remove();this.d.overlay.hide();this.d.iframe&&this.d.iframe.hide().remove();this.d.overlay.remove();this.d={}}}}});

  /*!
   * Made from jQuery Cookie Plugin v1.4.1
   * https://github.com/carhartl/jquery-cookie
   */
  (function() {
    var pluses = /\+/g;

    function encode(s) {
      return config.raw ? s : encodeURIComponent(s);
    }

    function decode(s) {
      return config.raw ? s : decodeURIComponent(s);
    }

    function stringifyCookieValue(value) {
      return encode(config.json ? JSON.stringify(value) : String(value));
    }

    function parseCookieValue(s) {
      if (s.indexOf('"') === 0) {
        // This is a quoted cookie as according to RFC2068, unescape...
        s = s.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
      }

      try {
        // Replace server-side written pluses with spaces.
        // If we can't decode the cookie, ignore it, it's unusable.
        // If we can't parse the cookie, ignore it, it's unusable.
        s = decodeURIComponent(s.replace(pluses, ' '));
        return config.json ? JSON.parse(s) : s;
      } catch(e) {}
    }

    function read(s, converter) {
      var value = config.raw ? s : parseCookieValue(s);
      return $.isFunction(converter) ? converter(value) : value;
    }

    var config = $.cookie = function (key, value, options) {

      // Write

      if (value !== undefined && !$.isFunction(value)) {
        options = $.extend({}, config.defaults, options);

        if (typeof options.expires === 'number') {
          var days = options.expires, t = options.expires = new Date();
          t.setTime(+t + days * 864e+5);
        }

        return (document.cookie = [
          encode(key), '=', stringifyCookieValue(value),
          options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
          options.path    ? '; path=' + options.path : '',
          options.domain  ? '; domain=' + options.domain : '',
          options.secure  ? '; secure' : ''
        ].join(''));
      }

      // Read

      var result = key ? undefined : {};

      // To prevent the for loop in the first place assign an empty array
      // in case there are no cookies at all. Also prevents odd result when
      // calling $.cookie().
      var cookies = document.cookie ? document.cookie.split('; ') : [];

      for (var i = 0, l = cookies.length; i < l; i++) {
        var parts = cookies[i].split('=');
        var name = decode(parts.shift());
        var cookie = parts.join('=');

        if (key && key === name) {
          // If second argument (value) is a function it's a converter...
          result = read(cookie, value);
          break;
        }

        // Prevent storing a cookie that we couldn't decode.
        if (!key && (cookie = read(cookie)) !== undefined) {
          result[name] = cookie;
        }
      }

      return result;
    };

    config.defaults = {};

    $.removeCookie = function (key, options) {
      if ($.cookie(key) === undefined) {
        return false;
      }

      // Must not alter options, thus extending a fresh object...
      $.cookie(key, '', $.extend({}, options, { expires: -1 }));
      return !$.cookie(key);
    };
  })();

  /*
   * Call42 widget script
   */
  $(document).ready(function() {

    call42 = (function () {
      var props = {
        ONLINE_STATUS:'off',
        AUTO_DIALOG_SHOWN:false,
        TEXTS:{},
        CW:null,
        WIDGET_OPTIONS:null,
        PHONE_CODE:null,
        IN_PROGRESS:false
      };
      var func = {
        onWidgetClick:function() {
          var text, state;
          $('#callback-widget img').attr('src', props.URL + '/widget/img/phone_onclick.png');
          if (props.IN_PROGRESS) {
            if (props.ONLINE_STATUS === 'on') {
              state = 'progressOnline';
              text = props.TEXTS.dialog_on_online;
            } else {
              state = 'progressOffline';
              text = props.TEXTS.dialog_on_offline;
            }
            $.modal.close();
            func.setDialogState(state);
            func.showDialog(text);
          } else {
            setTimeout(function() {
              func.setDialogState('formless');
              func.showDialog(props.TEXTS.dialog_connection_check);
              $.when( func.requestOnlineStatus('BY_ONLINE_CHANNEL') ).then(
                function() {
                  $.modal.close();
                  text = props.ONLINE_STATUS === 'on'? props.TEXTS.dialog_on_online:props.TEXTS.dialog_on_offline;
                  func.setDialogState('form');
                  func.showDialog(text);
                }
              );
            }, 100 );
          }
        },
        initEventHandling: function() {
          $( "body" ).delegate( ".callback-request-button", "click", function() {
            func.onWidgetClick();
          });
          props.CW.bind('mouseover', function() {
            $('#callback-widget img').attr('src', props.URL + '/widget/img/phone_onover.png');
          });

          props.CW.bind('mouseout', function() {
            $('#callback-widget img').attr('src', props.URL + '/widget/img/phone_regular.png');
          });

          $("#callback-dialog input[name='submit']").bind('click', function() {
            func.call();
          });

          var textEl = $('#callback-dialog input[type="text"]');
          textEl.bind('focus', function(){
            $(this).css('background', 'white');
            func.removeValidationText();
          });
          textEl.bind('mousedown', function(){
            if ($(this).val() === '') {
              $(this).val(props.PHONE_CODE);
            }
          });
          textEl.bind('focusout', function(){
            if ($(this).val() === '+') {
              $(this).val('');
            }
          });
          textEl.bind('keydown', function(e){
            var l = $(this).val().length,
              key = e.which;
            if (e.which === 13) {
              func.call();
            }
            if (func.doGetCaretPosition($(this)[0]) === 0 && (func.isDigit(key) || func.isDelete(key))) {
              return false;
            }
            if (func.doGetCaretPosition($(this)[0]) === 1 && (func.isBackspace(key) || func.isMoveLeft(key))) {
              return false;
            }
            if (l <= 16 && (func.isEdit(key) || func.isDigit(key))  || func.isPaste(e)) {
              return true;
            }
            if (l > 16 && func.isEdit(key)) {
              return true;
            }
            e.preventDefault();
          });
        },
        initAutoShowDialog: function() {
          var activateTime = props.WIDGET_OPTIONS.auto_invitation.activate_time * 1000,
            activatePageLimit = props.WIDGET_OPTIONS.auto_invitation.activate_page_limit,
            activatePageLimitTime = props.WIDGET_OPTIONS.auto_invitation.activate_page_limit_time * 1000,
            visitedPages = $.cookie('visitedPages', Number);

          if (!visitedPages) {
            visitedPages = 1;
          } else {
            visitedPages += 1;
          }
          $.cookie('visitedPages', visitedPages, { path: '/' });
          if (visitedPages >= parseInt(activatePageLimit)) {
            activateTime = activatePageLimitTime;
          }
          func.showDialogAuto(activateTime);
        },
        showDialogAuto: function(activateTime) {
          setTimeout(function() {
            $.when( func.requestOnlineStatus() ).then(
              function() {
                if (props.ONLINE_STATUS === 'on') {
                  if (!$("#callback-dialog").is(':visible')) {
                    func.setDialogState('form');
                    func.showDialog(props.TEXTS.dialog_automatic);
                    $.removeCookie('visitedPages', { path: '/' });
                    $.cookie('autoDialogShown', true, { path: '/' });
                    props.AUTO_DIALOG_SHOWN = true;
                  }
                }
              }
            );
          }, activateTime );
        },
        setBlurOverlay: function(setBlur){
          var els = $('body').children()
            .not($('#simplemodal-container'));
          if (setBlur) {
            els.addClass('callback-widget-blur');
          } else {
            els.removeClass('callback-widget-blur');
          }
        },
        setDialogState: function(state) {
          var form = $('#callback-dialog form'),
            phoneEl = $('#callback-dialog input[type="text"]'),
            submitButton = $("#callback-dialog input[name='submit']"),
            text = $('#callback-dialog .text'),
            textOnConnect = $('#text-on-connect');

          switch(state) {
            case 'formless':
              form.hide();
              text.css('padding', '30px');
              break;
            case 'form':
              form.show();
              func.removeValidationText();
              submitButton.show();
              func.enableSubmit();
              textOnConnect.hide();
              phoneEl.attr('disabled', false);
              text.css('padding', '20px 20px 0px');
              break;
            case 'progressOnline':
              func.disableSubmit();
              submitButton.hide();
              textOnConnect.show();
              phoneEl.attr('disabled', true);
              break;
            case 'progressOffline':
              func.disableSubmit();
              submitButton.addClass('disabled');
              phoneEl.attr('disabled', true);
              break;
          }
        },
        showDialog: function(text) {
          var textEl = $('#callback-dialog .text');
          props.CW.hide();
          if ($.cookie('phone')){
            $('#callback-dialog input[type="text"]').val($.cookie('phone'));
          }
          $("#callback-dialog").modal(
            {
              overlayClose:true,
              focus:false,
              onShow: function () {
                func.setBlurOverlay(true);
                textEl.html(text);
              },
              onClose: function () {
                $.modal.close();
                props.CW.show();
                textEl.html('');
                func.setBlurOverlay(false);
              }
            }
          );
        },
        call: function() {
          var phone = $('#callback-dialog input[type="text"]').val().trim(),
            text, polling;

          if ($('#callback-dialog input[type="text"]').val().length > 5) {
            if (props.ONLINE_STATUS === 'on') {
              func.setDialogState('progressOnline');
            } else {
              func.setDialogState('progressOffline');
            }
            $.cookie('phone', phone);
            var guid = func.getGenerator().getId();
            $.ajax({
              url: props.URL + '/request/' + widget_id,
              type: 'POST',
              crossDomain: true,
              data: {
                phone:phone,
                guid:guid
              },
              beforeSend: function() {
                props.IN_PROGRESS = true;
                props.DIALOG_TEXT = null;
              },
              error: function(err, t) {
                props.IN_PROGRESS = false;
                props.DIALOG_TEXT = props.TEXTS['dialog_error'];
              },
              complete:function() {
                polling = setInterval(function() {
                  if (props.IN_PROGRESS) {
                    func.requestCallbackRequestStatus(guid);
                  } else {
                    clearInterval(polling);
                    $.modal.close();
                    if (props.DIALOG_TEXT) {
                      func.setDialogState('formless');
                      func.showDialog(props.DIALOG_TEXT);
                    }
                  }
                }, 2000);
              }
            });
          }
        },
        requestCallbackRequestStatus: function (guid) {
          var dfd = new $.Deferred();
          $.ajax({
            url: props.URL + '/callbackRequestStatus/' + widget_id + '/' + guid,
            type: 'GET',
            crossDomain: true,
            dataType: 'json',
            success: function(data) {
              if (data && data.done) {
                props.IN_PROGRESS = false;
                if (data.dialog && data.dialog.text) {
                  props.DIALOG_TEXT = props.TEXTS[data.dialog.text];
                }
              }
            }
          });
          return dfd.promise();
        },
        requestOnlineStatus: function (mode) {
          var dfd = new $.Deferred();
          var url = props.URL + '/onlineStatus/' + widget_id;
          if (mode) {
            url += '?mode='+mode;
          }
          setTimeout(function() {
            dfd.resolve( false );
          }, 5000 );
          $.ajax({
            url: url,
            type: 'GET',
            crossDomain: true,
            dataType: 'json',
            success: function(status) {
              props.ONLINE_STATUS = status;
              dfd.resolve( status );
            }
          });

          return dfd.promise();
        },
        doGetCaretPosition: function(oField) {
          var iCaretPos = 0;
          if (document.selection) {
            oField.focus ();
            var oSel = document.selection.createRange ();
            oSel.moveStart ('character', -oField.value.length);
            iCaretPos = oSel.text.length;
          }
          else if (oField.selectionStart || oField.selectionStart == '0')
            iCaretPos = oField.selectionStart;
          return (iCaretPos);
        },
        getGenerator: function() {
          function Generator() {}
          Generator.prototype.rand =  Math.floor(Math.random() * 26) + Date.now();
          Generator.prototype.getId = function() {
            return this.rand++;
          };
          return new Generator();
        },
        enableSubmit:function(){
          $("#callback-dialog input[type='button']").attr('disabled', false).addClass('active');
        },
        disableSubmit: function(){
          $("#callback-dialog input[type='button']").attr('disabled', true).removeClass('active');
        },
        removeValidationText: function() {
          $('#callback-dialog .validation-text').text('');
          $('#callback-dialog .button-holder').css('padding-top', '20px');
        },
        isEdit: function(key) {
          return key === 8 || key === 35 || key === 36 || key === 37 || key === 39 || key === 46 ;
        },
        isDelete: function(key) {
          return key === 46;
        },
        isBackspace: function(key) {
          return key === 8;
        },
        isMoveLeft: function(key) {
          return key === 37;
        },
        isDigit: function(key) {
          return (key > 47 && key < 58) || (key > 95 && key < 106);
        },
        isPaste: function(e) {
          return e.which===86 || e.ctrlKey;
        }
      };
      return {
        init:function() {
          $.ajax({
            url: widget_server_host + '/init/' + widget_id,
            method: 'GET',
            crossDomain: true,
            dataType: 'jsonp',
            success:function(data) {
              props.WIDGET_OPTIONS = data.widget;
              props.URL = data.url;
              if (typeof widget_options != 'undefined') {
                props.WIDGET_OPTIONS = $.extend(true, props.WIDGET_OPTIONS, widget_options);
              }
              props.PHONE_CODE = data.phoneCode;
              props.TEXTS = data.widget.texts;
              $( "body" ).append( data.html );
              props.CW = $('.callback-request-button');
              func.initEventHandling();
              if (!$.cookie('autoDialogShown') && props.WIDGET_OPTIONS.auto_invitation.is_enabled){
                func.initAutoShowDialog();
              }
              if (props.WIDGET_OPTIONS.show_phoneicon === false) {
                $('#callback-widget').remove();
              } else {
                $('#callback-widget img').attr('src', props.URL + '/widget/img/phone_regular.png');
              }
              $( ".callback-dialog .host").text(data.shortUrl).attr('href', props.URL);
              $('#text-on-connect').text(props.TEXTS.dialog_button_on_connect);
              $("#callback-dialog input[name='submit']").attr('value', props.TEXTS.dialog_button);
              $('#callback-dialog input[type="text"]').attr('placeholder', props.TEXTS.dialog_phone_number_placeholder);
            }
          });
        }
      }
    })();
    call42.init();
  });

}
initJQuery();
