/*
 *rostrum.js
 * Root namespace module
*/

 /*jslint		browser:true, continue:true,
 devel: true, indent:2, maxerr : 50,
 newcap: true, nomenL true, plusplus : true
 regexp: true, sloppy:true, vars: false,
 white:true
 */
 /*global $, rostrum */

 var rostrum = (function(){
 	'use strict';
 	var initModule = function($container){
 		rostrum.data.initModule();
 		rostrum.model.initModule();
 		rostrum.shell.initModule($container);
 	};
 	return{initModule: initModule};
 }());                                                                                                                                                   