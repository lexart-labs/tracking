(function (ng) {

    'use strict';

    var Module = ng.module('LexTracking');

    Module.factory('CustomTranslateErrorHandlerFactory', function(){
      
      var factory = function (translationID, uses) {
        // return the following text as a translation 'result' - this will be
        // displayed instead of the language key.
        console.log("Missing: " + translationID);
        return 'NO DEFAULT KEY';
	  };
	  
	  return factory;

	});


}(angular));