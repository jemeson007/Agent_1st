/*
 * rostrum.chat.js
 * Chat feature module for rostrum
 */

 /*jslint     browser : true, continue : true, 
   devel : true, indent : 2, maxerr : 50,
   newcap : true, nomen : true, plusplus : true,
   regexp : true, sloppy : true, vars : false,
   white : true
  */

  /*global $, rostrum, */

  rostrum.chat = (function (){
    'use strict';
  	//--------------------------------BEGIN MODULE SCOPE VARIABLES --------------------
  	var 
  	  configMap = {
  	  	main_html : String()
  	  	+'<div class = "rostrum-chat">'
  	  	 +'<div class="rostrum-chat-head">'
  	  	   +'<div class="rostrum-chat-head-toggle">+</div>'
  	  	   +'<div class="rostrum-chat-head-title">'
  	  	     +'Chat'
  	  	   +'</div>'
  	  	 +'</div>'
  	  	 +'<div class="rostrum-chat-closer">x</div>'
  	  	 +'<div class="rostrum-chat-sizer">'
           +'<div class="rostrum-chat-list">'
             +'<div class="rostrum-chat-list-box"></div>'
           +'</div>'  
  	  	   +'<div class="rostrum-chat-msg">'
             +'<div class = "rostrum-chat-msg-log"></div>'
             +'<div class = "rostrum-chat-msg-in">'
               +'<form class="rostrum-chat-msg-form">'
  	  	     +'<input type="text"/>'
             +'<input type="submit" style = "display : none"/>'
  	  	     +'<div class = "rostrum-chat-msg-send">'
               + 'Send'
           +'</div>'
         +'<form>'
        +'</div>'
  	   +'</div>'
  	 +'</div>'
  	+'</div>',

  	  	settable_map : {
  	  		slider_open_time	 :true,
  	  		slider_close_time	 :true,
  	  		slider_opened_em	 :true,
  	  		slider_closed_em	 :true,
  	  		slider_opened_title	 :true,
  	  		slider_closed_title  :true,

  	  		chat_model	:true,
  	  		people_model:true,
  	  		set_chat_anchor:true
  	  	},

  	  	slider_open_time:250,
  	  	slider_close_time:250,
  	  	slider_opened_em :19,
  	  	slider_closed_em :2,
  	  	slider_opened_title : 'Tap to close',
  	  	slider_closed_title : 'Tap to open',
  	  	slider_opened_min_em : 10,
  	  	window_height_min_em : 20,
     /*   slider_opened_max_em : null,*/

  	  	chat_model :null,
  	  	people_model :null,
  	  	set_chat_anchor :null
  	  },
  	  stateMap = {
   	  	$append_target : null,
  	  	position_type : 'closed',
  	  	px_per_em :0,
  	  	slider_hidden_px : 0,
  	  	slider_closed_px : 0,
  	  	slider_opened_px : 0
  	  },
  	  jqueryMap = {},

  	  setJqueryMap, setPxSizes, setSliderPosition, 
      scrollChat, writeChat, writeAlert, clearChat,
      onTapToggle, onSubmitMsg, onTapList,
      onSetchatee, onUpdatechat, onListchange,
      onLogin, onLogout,
  	  removeSlider, handleResize,
  	  configModule, initModule;

  	//--------------------------END MODULE SCOPE VARIABLES -------------------------------

  	//--------------------------BEGIN UTILITY VARIABLES ---------------------------------
  	// getEmSize = function(elem){
  	// 	return Number(
  	// 		getComputedStyle(elem, '').fontSize.match(/\d*\.?\d*/)[0]
  	// 		);
  	// };
  	//--------------------------END UTILITY VARIABLES -----------------------------------

  	//--------------------------BEGIN DOM METHODS --------------------------------------
  	//  Begin DOM method / setJqueryMap /
  	setJqueryMap = function(){
   		var 
  		  $append_target = stateMap.$append_target,
  		  $slider = $append_target.find('.rostrum-chat');

  		jqueryMap = {
   			$slider : $slider,
  			$head 	: $slider.find('.rostrum-chat-head'),
  			$toggle : $slider.find('.rostrum-chat-head-toggle'),
  			$title  : $slider.find('.rostrum-chat-head-title'),
  			$sizer  : $slider.find('.rostrum-chat-sizer'),
        $list_box: $slider.find('.rostrum-chat-list-box'),
        $msg_log : $slider.find('.rostrum-chat-msg-log'),
        $msg_in : $slider.find('.rostrum-chat-msg-in'),
        $input : $slider.find('rostrum-chat-msg-in input[type=text]'),
        $send : $slider.find('.rostrum-chat-msg-send'),
        $form :$slider.find('.rostrum-chat-msg-form'),
        $window : $(window)
  		};
  	};
  	//  End DOM method / setJqueryMap /

  	//  Begin DOM method / setPxSizes /
  	setPxSizes = function(){
  		var px_per_em, window_height_em, opened_height_em;
  		px_per_em = rostrum.util_b.getEmSize(jqueryMap.$slider.get(0));
  		window_height_em = Math.floor(
  			(jqueryMap.$window.height() / px_per_em) + 0.5);

  		opened_height_em 
  		  =window_height_em > configMap.window_height_min_em ? configMap.slider_opened_em : configMap.slider_opened_min_em;

        if((window_height_em - configMap.window_height_min_em)>=0.5){
          configMap.slider_opened_em = configMap.slider_opened_min_em + 0.5;
        };

  		stateMap.px_per_em = px_per_em;
  		stateMap.slider_closed_px = configMap.slider_closed_em * px_per_em;
  		stateMap.slider_opened_px = opened_height_em * px_per_em;
  		jqueryMap.$sizer.css({
  			height : (opened_height_em - 2) * px_per_em
  		});
  	};
  	//  End DOM method / setPxSizes /

  	//  Begin public method / handleResize/
  	//  Purpose :
  	//    Given a window resize event, adjust the presentation
  	//    provided by this module if needed
  	//  Actions:
  	//	  If the window height or width falls below a given threshold, resize the chat slider for the
  	//    reduced window size.
  	//  Returns: Boolean
  	//    *false - resize not considered
  	//    *true - resize considered
  	//  Throws : none
  	//
  	handleResize = function(){
  		//Do stuff if and only if [iff] we have a slider container
  		if(!jqueryMap.$slider){return false;}

  		setPxSizes();
  		if(stateMap.position_type === 'opened'){
  			jqueryMap.$slider.css({height : stateMap.slider_opened_px});
  		}
  		return true;
  	};
  	//End public method / handleResize/
  	
  	//  Begin public method / setSliderPosition/
  	//  Example : rostrum.chat.setSliderPosition('closed');
  	//  Purpose : Move the chat slider to the requested position
  	//  Arguments: // *position_type -enum('closed', 'opened', or 'hidden')
  	//    *callback - optional callback to be run end at the end of slider animation.
  	//  The callback receives a jQuery collection representing the slider div as is single argument
  	//  Action :
  	//  This method moves the slider into the requested position.
  	//  If the requested position is the current position , it returns true without taking further action
  	//  Returns:
  	//  *true  - The requested position was achieved
  	//  *false - The requested position was not achieved
  	//  Throws : none
  	//
  	setSliderPosition = function(position_type, callback){
  		var
  		  height_px, animate_time, slider_title, toggle_text;

        // position type of 'opened' is not allowed for anon user;
        // therefore we simply return false; the shell will fix the uri and try again
        if (position_type === 'opened' && configMap.people_model.get_user().get_is_anon()) {
          return false;
        };

  		  //return true if slider already in requested position
  		  if(stateMap.position_type ===position_type){
          if(position_type === 'opened'){
            jqueryMap.$input.focus();
          }
  		  	return true;
  		  }
  		  //prepare animate parameters
  		  switch(position_type){
  		  	case 'opened':
  		  	  height_px = stateMap.slider_opened_px;
  		  	  animate_time = configMap.slider_open_time;
  		  	  slider_title = configMap.slider_opened_title;
  		  	  toggle_text = ' =';
            jqueryMap.$input.focus();
  		  	  break;

  		  	case 'hidden' :
  		  	  height_px = 0;
  		  	  animate_time = configMap.slider_open_time;
  		  	  slider_title = '';
  		  	  toggle_text = '+';
  		  	  break;

  		  	case 'closed' :
  		  	  height_px = stateMap.slider_closed_px;
  		  	  animate_time = configMap.slider_close_time;
  		  	  slider_title = configMap.slider_closed_title;
  		  	  toggle_text = '+';
  		  	  break;
  		  	  //bail for unknown position type
  		  	  default : return false;
  		  }
  		  //animate slider position change
  		  stateMap.position_type = '';
  		  jqueryMap.$slider.animate(
  		  	{height:height_px},
  		  	animate_time,
  		  	function(){
  		  		jqueryMap.$toggle.prop('title', slider_title);
  		  		jqueryMap.$toggle.text(toggle_text);
  		  		stateMap.position_type = position_type;
  		  		if(callback){callback(jqueryMap.$slider);}
  		  	});
  		  return true;
  	}
  	//End public DOM method / setSliderPosition/

    //Begin private DOM methods to manage chat message
    scrollChat = function(){
      var $msg_log = jqueryMap.$msg_log;
      $msg_log.animate({
        scrollTop : $msg_log.prop('scrollHeight')
          - $msg_log.height()
      },
      150
      );
    };

    writeChat = function(person_name, text, is_user){
      var msg_class = is_user ? 'rostrum-chat-msg-log-me' : 'rostrum-chat-msg-log-msg';
      jqueryMap.$msg_log.append(
         '<div class = "' + msg_class + '">'
         +rostrum.util_b.encodeHtml(person_name) + ': '
         +rostrum.util_b.encodeHtml(text) + '</div>'
        );

        scrollChat();
    };

    writeAlert = function (alert_text){
      jqueryMap.$msg_log.append(
        '<div class = "rostrum-chat-msg-log-alert">'
          +rostrum.util_b.encodeHtml(alert_text)
        +'</div>'
      );
      scrollChat();
    };

    clearChat = function(){jqueryMap.$msg_log.empty();};
    //End private DoM methods to manage chat message
  	//---------------------END DOM METHODS----------------------------------------------

  	//--------------------BEGIN EVENT HANDLERS -----------------------------------------
  	onTapToggle = function(event){
  		var set_chat_anchor = configMap.set_chat_anchor;
  		if(stateMap.position_type ==='opened'){
  			set_chat_anchor('closed');
  		}
  		else if(stateMap.position_type === 'closed'){
  			set_chat_anchor('opened');
  			return false;
  		}
  	};

    onSubmitMsg = function(event){
      var msg_text = jqueryMap.$input.val();
      if(msg_text.trim() === ''){return false;}
      configMap.chat_model.send_msg(msg_text);
      jqueryMap.$input.focus();
      jqueryMap.$send.addClass('rostrum-x-select');
      setTimeout(
        function(){jqueryMap.$send.removeClass('rostrum-x-select');}, 
        250
        );
      return false;
    };

    onTapList = function(event){
      var $tapped = $(event.elem_target), chatee_id;
      if(!$tapped.hasClass('rostrum-chat-list-name')){return false;}

      chatee_id = $tapped.attr('data-id');
      if(!chatee_id) {return false;}

      configMap.chat_model.set_chatee(chatee_id);
      return false;
    };

    onSetchatee = function(event, arg_map){
      var
        new_chatee = arg_map.new_chatee,
        old_chatee = arg_map.old_chatee;

      jqueryMap.$input.focus();
      if(!new_chatee){
        if(old_chatee){
          writeAlert(old_chatee.name + 'has left the chat');
        }
        else{
          writeAlert('Your friend has left the chat');
        }
        jqueryMap.$title.text('Chat');
        return false;
      }
      jqueryMap.$list_box
        .find('.rostrum-chat-list-name')
        .removeClass('rostrum-x-select')
        .end()
        .find('[data-id = ' + arg_map.new_chatee.id + ']')
        .addClass('rostrum-x-select');

      writeAlert('Now chatting with '+ arg_map.new_chatee.name);
      jqueryMap.$title.text('Chat with '+ arg_map.new_chatee.name);
      return true;
    };

    onListchange = function(event){
      var
        vlist_html = String(),
        people_db = configMap.people_model.get_db(),
        chatee = configMap.chat_model.get_chatee();

      people_db().each(function(person, idx){
        var select_class = '';

        if (person.get_is_anon() || person.get_is_user()) {
          return true;
        };

        if(chatee && chatee.id === person.id){
          select_class = 'rostrum-x-select';
        }
        list_html
          += '<div class = "rostrum-chat-list-name'
          + select_class + '"data-id = "' + person.id + '">'
          +rostrum.util_b.encodeHtml(person.name) + '</div>';
      });

      if(!list_html){
        list_html = String()
          + '<div class = "rostrum-chat-list-note">'
          + 'To chat alone is the fate of all great souls...<br><br>'
          + 'No one is online'
          + '</div>';
          clearChat();
      }
      // jqueryMap.$list_box.html(list_html);
      jqueryMap.$list_box.html(list_html);
    };

    onUpdatechat = function (event, msg_map){
      var 
        is_user,
        sender_id = msg_map.sender_id,
        msg_text = msg_map.msg_text,
        chatee = configMap.chat_model.get_chatee() || {},
        sender = configMap.people_model.get_by_cid(sender_id);

      if(!sender){
        writeAlert(msg_text);
        return false;
      }  

      is_user = sender.get_is_user();

      if(!(is_user || sender_id === chatee.id)){
        configMap.chat_model.set_chatee(sender_id);
      }

      writeChat(sender.name, msg_text, is_user);

      if(is_user){
        jqueryMap.$input.val('');
        jqueryMap.$input.focus();
      }
    };

    onLogin = function(event, login_user){
      configMap.set_chat_anchor('opened');
    };

    onLogout = function(event, logout_user){
      configMap.set_chat_anchor('closed');
      jqueryMap.$title.text('Chat ');
      clearChat();
    };
  	//--------------------END EVENT HANDLERS  -----------------------------------------

  	//--------------------BEGIN API SPECIFICATIONS-----------------------------
  	// Begin Public Method / configModule API specifications /
  	// Example : rostrum.chat.configModule({slider_open_em : 18});
  	// Purpose : Configure the module prior to initialization
  	// Arguments : 
  	//  *set_chat_anchor - a callback to modify the URI anchor to indicate
  	// opened or closed state. This callback must return false if the requested
  	// state cannot be met
  	//  *chat_model - the chat model object provides methods to interact with our 
  	// instant messaging
  	//  *people_model - the people model object which provides methods to manage
  	// the list of people the model maintains
  	//  *slider_*settings. All these are optional scalars.
  	//    See mapConfig.settable_map for a full list
  	//    Example: slider_open_em is the open height in em's
  	// Action :
  	//   The internal configuration data structure (configMap) is
  	//   updated with provided arguments. No other actions are taken.
  	// Returns : true
  	// Throws : Javascript error object and stack trace on unacceptable or missing arguments
  	//
  	//
  	configModule = function(input_map){
  		rostrum.util.setConfigMap({
  			input_map : input_map,
  			settable_map : configMap.settable_map,
  			config_map : configMap
  		});
  		return true;
  	};
  	// End Public Method /configModule/

  	// Begin Public Method / initModule
  	// Example : rostrum.chat.initModule($('#div_id'));
  	// Purpose :
  	//   Directs Chat to offer its capability to the user
  	// Arguments :
  	//   * $append_target(example: $('#div_id')).
  	//     A jQuery collection that should represent
  	//     a single DOM container
  	// Action :
  	//   Appends the chat slider to the provided container and fills it 
  	// with HTML content. It then initializes elements, events and handlers to provide the user with
  	// a chat-room interface
  	// Returns : true on success, false on failure
  	// Throws : none
  	//
  	//
  	initModule = function($append_target){
      var $list_box;

      //load chat slider html and jquery cache
  		stateMap.$append_target = $append_target;
      $append_target.append(configMap.main_html);
  		setJqueryMap();
  		setPxSizes();

  	//initialize chat slider to default title and state
  	jqueryMap.$toggle.prop('title', configMap.slider_closed_title);
  	jqueryMap.$head.click(onTapToggle);
  	stateMap.position_type = 'closed';

    //Have $list_box subscribe to jquery global events
    $list_box = jqueryMap.$list_box;
    $.gevent.subscribe($list_box, 'rostrum-listchange', onListchange);
    $.gevent.subscribe($list_box, 'rostrum-setchatee', onSetchatee);
    $.gevent.subscribe($list_box, 'rostrum-updatechat', onUpdatechat);
    $.gevent.subscribe($list_box, 'rostrum-login', onLogin);
    $.gevent.subscribe($list_box, 'rostrum-logout', onLogout);

    //bind user input events
    jqueryMap.$head.bind( 'utap', onTapToggle);
    jqueryMap.$list_box.bind('utap', onTapList);
    jqueryMap.$send.bind( 'utap', onSubmitMsg);
    jqueryMap.$form.bind('submit', onSubmitMsg);

  	return true;
  	};
  	// End Public Method / initModule /

  	// Begin Public Method / setSliderPosition/
  	//
  	// Example : rostrum.chat.setSliderPosition('closed');
  	// Purpose : Ensure chat slider is in the requested state
  	// Arguments:
  	//	*position_type - enum('closed','opened', or 'hidden')
  	//  *callback - optional callback at the end of animation.
    //	(callback receives slider DOM element as argument)
    // Action :
    //  Leaves slider in current state if it matches requested,
    //  otherwise animate to requested state.
    // Returns:
    //   *true - requested state achieved
    //   *false -requested state not achieved
    // Throws : none
    //
    //

  	//--------------------BEGIN PUBLIC METHODS-----------------------------------------
  	//  Begin Public Method / configModule /
  	// Purpose : Adjust configuration of allowed keys
  	// Arguments : A map of settable keys and values
  	//  *colour_name - colour to use
  	// Settings: 
  	//  *configMap.settable_map declares allowed keys
  	// Returns :true
  	// Throws : none
  	//
  	configModule = function(input_map){
  		rostrum.util.setConfigMap({
  			input_map : input_map,
  			settable_map : configMap.settable_map,
  			config_map : configMap
  		});
  		return true;
  	} ;
  	// End Public Method / configModule/

  	// Begin Public Method / initModule /
  	// Purpose : Initializes module
  	// Arguments:
  	//  *$container the jquery element used by this feature
  	// Returns : true
  	// Throws : none
  	//
  	initModule = function($append_target){
  		$append_target.append(configMap.main_html);
  		stateMap.$append_target = $append_target;
  		setJqueryMap();
  		setPxSizes();

  		//initialize chat slider to default title and state
  		jqueryMap.$toggle.prop('title', configMap.slider_closed_title);
  		jqueryMap.$head.click(onTapToggle);
  		stateMap.position_type = 'closed';

  		return true;
  	};
  	// End Public Method / initModule /

  	// Begin Public Method / removeSlider /
  	// Purpose :
  	//   *Removes chatSlider DOM element
  	//   *Reverts to initial state
  	//   *Removes pointers to callbacks and other data
  	// Arguments :none
  	// Returns : none
  	// Throws :none
  	//
  	removeSlider = function(){
  		//unwind initialization and state
  		// remove DOM container; this removes event bindings too
  		if(jqueryMap.$slider){
  			jqueryMap.$slider.remove();
  			jqueryMap = {};
  		}
  		stateMap.$append_target = null;
  		stateMap.$position_type = 'closed';

  		// unwind key configurations
  		configMap.chat_model = null;
  		configMap.people_model = null;
  		configMap.set_chat_anchor = null;

  		return true;
   	};
   	// End public Method /removeSlider /

  	//return Public Methods
  	return{
  		setSliderPosition : setSliderPosition,
  		configModule : configModule,
  		initModule : initModule,
  		removeSlider : removeSlider,
  		handleResize : handleResize
  	};
  	//------------------------END PUBLIC METHODS ----------------------------
  }());