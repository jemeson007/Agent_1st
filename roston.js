/*
 *roston.js
 * Root namespace module
*/

 /*jslint		browser:true, continue:true,
 devel: true, indent:2, maxerr : 50,
 newcap: true, nomenL true, plusplus : true
 regexp: true, sloppy:true, vars: false,
 white:true
 */
 /*global $, roston */

var roston = (function(){
 	'use strict';
 	var initModule = function($container){
 		roston.data.initModule();
 		avtr.initModule($container);
 		roston.model.initModule();
 		roston.shell.initModule($container);

 	};
 	return{initModule: initModule};
 }());                                                                                                                                                   