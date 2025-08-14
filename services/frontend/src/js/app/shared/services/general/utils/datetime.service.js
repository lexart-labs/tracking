(function (ng) {

    'use strict';

    var Module = ng.module('LexTracking');

    Module.factory('DateTimeUtilService', ['RestClient', function(RestClient){
	  
	  var factory = {
	    getMonths: function(cb) {
			var months = [
				{
					index : "1",
					name : "Enero"
				},
				{
					index : "2",
					name : "Febrero"
				},
				{
					index : "3",
					name : "Marzo"
				},
				{
					index : "4",
					name : "Abril"
				},
				{
					index : "5",
					name : "Mayo"
				},
				{
					index : "6",
					name : "Junio"
				},
				{
					index : "7",
					name : "Julio"
				},
				{
					index : "8",
					name : "Agosto"
				},
				{
					index : "9",
					name : "Septiembre"
				},
				{
					index : "10",
					name : "Octubre"
				},
				{
					index : "11",
					name : "Noviembre"
				},
				{
					index : "12",
					name : "Diciembre"
				}
			]
			return months;
	    }

	  };
	  return factory;
	}]);

}(angular));