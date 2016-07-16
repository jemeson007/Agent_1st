/*
 *roston.data.js
 *Data Module
*/

/*jslint 	browser :true, continue : true,
devel : true, indent : 2, maxerr : 50,
newcap : true, nomen : true, plusplus : true,
regexp : true, sloppy : true, vars : false,
white : true
*/
/*global $, roston */
roston.data = (function(){
  'use strict';
  var
    stateMap = {sio:null},
    makeSio, getSio, 
    // configMap = {String()
    //             + ''}
    configMap={ String()
            +'/webapp/socket.html'

    }, 
    initModule;

  makeSio = function(){
  	var socket = io.connect('/chat');

  	return{
  		emit : function(event_name, data){
  			socket.emit(event_name, data);
  		},
  		on: function(event_name, callback){
  			socket.on(event_name, function(){
  				callback(arguments);
  			});
  		}
  	};
  };

  getSio = function(){
  	if(!stateMap.sio){ stateMap.sio = makeSio();}
  	return stateMap.sio;
  };

  initModule = function($container){
    $container = ($(this));
    // $container.html(configMap.main_html);
    $container.html(configMap.socket.html);
  };

  return {
  	getSio : getSio,
  	initModule : initModule
  };


	return {};
}());