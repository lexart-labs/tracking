(function (ng) {

  'use strict';

  var Module = ng.module('LexTracking');

  Module.controller('CalendarCtrl', ['$scope', 'CalendarServices', '$timeout', 'uiCalendarConfig', 'ngDialog', 'UserServices', '$rootScope', '$filter',
    function ($scope, CalendarServices, $timeout, uiCalendarConfig, ngDialog, UserServices, $rootScope, $filter) {

      var id = $rootScope.userId;
      var userRole = $rootScope.userRole;
      var eventosFijos = [];
      var eventoFijo = {};
      var horarioFijoAux = {};
      var horarioFijoExc = {};
      var diasAgregados = [];
      $scope.horariosFijosAux = [];
      $scope.arrayAux = [];
      $scope.selectedEvent = null;
      $scope.isFirstTime = true;
      $scope.events = [];
      $scope.startTime = [];
      $scope.endTime = [];
      $scope.filter = { user: id };
      $scope.users = [];
      $scope.startTimeFijo = {};
      $scope.endTimeFijo = {};
      $scope.eventsAux = {};
      $scope.startEnd = {};
      $scope.mostrarHorariosModal = [];
      var endMonthViewDate = {};
      $scope.horariosFijosAux = [];
      $scope.date = moment();
      $scope.eventSources = [$scope.events];
      var fechaActual = moment().format('MM-YYYY');
      var parseDate = moment($scope.date).toDate();
      $scope.fechaActualCompleta = moment().toDate()
      $scope.exceptions = []
      $scope.todayIs = moment().format('DD/MM/YYYY');
      $scope.exceptionsAux = [];
      $scope.eventDeleted = [];
      $scope.filters = [];
      $scope.indexDeleted = null;
      $scope.currentMonthText = "";
      $scope.trackedEvents = [];
      $scope.diaAnterior = ''
      var count = 0;
      $scope.error = '';

      $scope.diaSeleccionado = {
        selected: {
          name: "Lunes", horarios: []
        }
      };

      $scope.mostrarInfo = [{
        name: '',
        horarios: ''
      }];

      $scope.horariosFijos = [
        { name: 'Lunes', horarios: [] },
        { name: 'Martes', horarios: [] },
        { name: 'Miercoles', horarios: [] },
        { name: 'Jueves', horarios: [] },
        { name: 'Viernes', horarios: [] },
        { name: 'Sabado', horarios: [] },
        { name: 'Domingo', horarios: [] }
      ];

      //EVENTO HARDCODED
      // $scope.event = {
      //   day: $scope.date.get('date'),
      //   title: 'Test',
      //   start: parseDate,
      //   end: parseDate,
      //   hourStart: null,
      //   hourEnd: null,
      //   allDay: false,
      //   user_id: id
      // }
      // $scope.events.push($scope.event);



      function getUserEvents(id, fecha, cb) {
        var excepciones = [];
        var horariosFijos = [];
        var tracks = [];
        $scope.loading = true;
        CalendarServices.getUserEvents(id, function (err, result) {
          if (result) {
            if (id != 0) {
              angular.forEach(result, function (e) {
                if (e.title == 'Horario Fijo') {
                  e.dayCheck = moment(e.start).format('DD')
                  $scope.mostrarInfo.push({ name: e.day, desde: moment(e.start).format('HH:mm'), hasta: moment(e.end).format('HH:mm') })
                }
              });
              horariosFijos = result
            }
            CalendarServices.getUserExceptions(id, fecha, function (err, res) {
              $scope.exceptions = res
              if ($scope.exceptions && res != 'No hay excepciones para este mes') {
                angular.forEach($scope.exceptions, function (e) {
                  $scope.mostrarInfo.push({ name: e.day, desde: moment(e.start).format('HH:mm'), hasta: moment(e.end).format('HH:mm'), exception: true })
                  e.hourStart = moment(e.start).format('HH:mm')
                  e.hourEnd = moment(e.end).format('HH:mm')
                });
              }
              excepciones = res
              $scope.fechaTracking = $scope.currentMonth.split('-')
              CalendarServices.getTrackedHours(id, $scope.fechaTracking[1] + '-' + $scope.fechaTracking[0] + '-' + '01', function (err, resultado) {
                if (typeof resultado != 'string') {
                  angular.forEach(resultado, function (t, index) {
                    t.day = normalize(moment(t.start).format('dddd').toLowerCase())
                    $scope.mostrarInfo.push({ name: t.day, desde: moment(t.start).format('HH:mm'), hasta: moment(t.end).format('HH:mm'), trackedEvent: true, })
                    $scope.trackedEvents.push(t)
                    
                  })
                }
                tracks = resultado
                cb(excepciones, horariosFijos, tracks)
                $scope.loading = false
              });
            });
          }
        });

      };
      //getUserEvents($scope.filter.user, fechaActual);


      //CONFIGURACION DEL CALENDARIO
      $scope.uiConfig = {
        calendar: {
          timeZone: 'UTC',
          defaultDate: moment().toDate(),
          buttonText: {
            today: 'Hoy',
            month: 'Mes',
          },
          customButtons: {
            agregarHorario: {
              text: 'Horarios Fijos',
              click: function () {
                $scope.modalHorarioFijo()
              }
            },
            semana: {
              text: 'Semana',
              click: function () {
                uiCalendarConfig.calendars['calendar'].fullCalendar('changeView', 'agendaWeek');
              }
            },
            hoy: {
              text: 'Hoy',
              click: function () {
                $scope.uiConfig.calendar.viewRender({
                  intervalEnd: {
                    _d: moment($scope.fechaActualCompleta)

                  }
                }, {

                })

              }
            }
          },
          locale: 'es',
          height: 540,
          editable: false,
          selectable: true,
          nowIndicator: true,


          header: {
            left: 'today prev,next',
            center: 'title',
            right: 'agregarHorario month semana',
          },
          // titleFormat: '[' + monthTitle + ']',

          viewRender: function (view, element, prev, next) {
            $scope.currentMonth = view.intervalEnd._d
            endMonthViewDate = view.intervalEnd._d
            $scope.currentMonth = moment($scope.currentMonth).format('MM-YYYY')
            $scope.currentMonthText = moment(view.intervalEnd._d).format('MMMM YYYY');
            diasAgregados = [];
            $scope.refreshEventos($scope.filter.user, function (bool) {
              if (bool) {
                $scope.actualizarHorariosFijos()
                $scope.changeView()
              }
            })


          },


          dayClick: function (selectedDate) {

            $scope.date = angular.copy(selectedDate._d);
            // $scope.checkDate = moment($scope.date).toDate();
            $scope.checkDate = $scope.date.getDate() + 1;
            $scope.selectedDay = angular.copy(selectedDate.format('DD/MM/YYYY'));
            var fechaClick = moment($scope.date).add(1, 'days')
            var fechaDeHoy = moment()
            if (moment().diff(fechaClick) < 0) {
              $scope.diaAnterior = true
              
            }
            $scope.modalEventos()


          },

          eventClick: function (event) {
            var auxDate = moment(event.start).toDate();
            $scope.date = angular.copy(auxDate);
            // $scope.checkDate = moment($scope.date).toDate();
            $scope.checkDate = $scope.date.getDate();
            $scope.selectedDay = angular.copy(event.start.format('DD/MM/YYYY'));
            $scope.modalEventos()
          },
          eventDrop: $scope.alertOnDrop,
          eventResize: $scope.alertOnResize,

          eventRender: function (event, element) {
            if (event.user_exceptions_id) {
              element.css('background-color', '#f95c33');
              element.css('border-color', '#f95c33')
            } else if (event.id_track) {
              element.css('background-color', '#32AA2C');
              element.css('border-color', '#32AA2C')
            } else {
              element.css('background-color', 'rgb(3, 155, 229)');
              element.css('border-color', 'rgb(3, 155, 229)')
            }
          },
        }
      };




      //AGREGAR EVENTO
      $scope.addEvent = function () {
        // $scope.eventSources = []
        $scope.parseDate = moment($scope.date).toDate()
        $scope.parseDate.setDate($scope.parseDate.getDate() + 1)
        $scope.eventsAux = {
          dayCheck: angular.copy($scope.checkDate),
          day: moment($scope.date).format('DD'),
          dayDescription: moment($scope.date).format('dddd'),
          title: '',
          start: $scope.parseDate,
          end: $scope.parseDate,
          hourStart: null,
          hourEnd: null,
          allDay: false,
          user_id: $scope.filter.user,
          momentStart: moment($scope.eventsAux.start)
        };

        // $scope.eventsAux.start =  moment($scope.eventsAux.start).format('YYYY-MM-DD') + '' + $scope.eventsAux.hourStart;
        // $scope.eventsAux.end =  moment($scope.eventsAux.end).format('YYYY-MM-DD') + $scope.eventsAux.hourEnd;

        $scope.events.push($scope.eventsAux)
      };


      //ARMO ARRAY DE EXCEPCIONES EXTRAIDO DE LA INFO DEL MODAL PARA EL POST
      var dateView = moment()
      $scope.crearArrayPostExceptions = function () {
        $scope.exceptionsAux = []
        angular.forEach($scope.events, function (e) {
          // $scope.btwDatesE(moment(e.start), e.hourStart, e.hourEnd)

          if (e.dayCheck == $scope.checkDate) {
            e.start = moment(e.start).format('YYYY-MM-DD') + ' ' + e.hourStart + ":00"
            e.end = moment(e.end).format('YYYY-MM-DD') + ' ' + e.hourEnd + ":00"
            dateView = moment(e.start).format('YYYY-MM-DD')
            if (e.dayDescription) {
              e.day = e.dayDescription
            }
            $scope.exceptionsAux.push(e)
          }
        })
        $scope.f = $scope.currentMonth.split('-')

        CalendarServices.postUserExceptions($scope.exceptionsAux, $scope.filter.user, $scope.f[1] + '-' + $scope.f[0] + '-' + $scope.checkDate, function (err, result) {
          $scope.uiConfig.calendar.viewRender({
            intervalEnd: {
              _d: dateView
            }
          }, {
          })
        });
      };



      $scope.btwDatesH = function (day, desde, hasta, type) {
        var verify = 0
        $scope.error = ''
        if (type == 'hf') {
          angular.forEach($scope.horariosFijos, function (hF, index) {
            if (hF.name.toLowerCase() == day) {
              angular.forEach(hF.horarios, function (h, index) {
                var start = moment(h.desde + ':00', 'HH:mm:ss')
                var end = moment(h.hasta + ':00', 'HH:mm:ss')
                if (moment(desde + ':00', 'HH:mm:ss').isBetween(start, end) || moment(hasta + ':00', 'HH:mm:ss').isBetween(start, end)) {
                  verify = verify + 1
                }
                if (start.isBetween(moment(desde + ':00', 'HH:mm:ss'), moment(hasta + ':00', 'HH:mm:ss')) || end.isBetween(moment(desde + ':00', 'HH:mm:ss'), moment(hasta + ':00', 'HH:mm:ss'))) {
                  verify = verify + 1
                }

              })
            }
            if (verify > 0) {
              $scope.error = 'Los horarios no se pueden superponer'
            } else {
              $scope.error = ''
            }
          })
        }
      }

      $scope.callCalendar = function () {
        $scope.uiConfig.calendar.viewRender({
          intervalEnd: {
            _d: moment($scope.currentMonth, 'MM-YYYY') || dateView
          }
        }, {})
      }

      $scope.btwDatesE = function (day, desde, hasta, index) {
        var verify = 0
        $scope.error = ''
        day = day.getDate()

        if (!desde || !hasta) {
          setTimeout(function () {
            $scope.error = 'Debes ingresar hora inicial y final para poder continuar'
            return
          }, 1000)
        }


        angular.forEach($scope.events, function (e, ind) {
          if (e.dayCheck == $scope.checkDate && e.title != 'Horario Fijo' && e.dayCheck == day) {
            var start = moment(e.hourStart + ':00', 'HH:mm:ss')
            var end = moment(e.hourEnd + ':00', 'HH:mm:ss')
            if (moment(desde + ':00', 'HH:mm:ss').isBetween(start, end) || moment(hasta + ':00', 'HH:mm:ss').isBetween(start, end)) {
              verify = verify + 1
            }
            if (start.isBetween(moment(desde + ':00', 'HH:mm:ss'), moment(hasta + ':00', 'HH:mm:ss')) || end.isBetween(moment(desde + ':00', 'HH:mm:ss'), moment(hasta + ':00', 'HH:mm:ss'))) {
              verify = verify + 1
            }
            if (verify > 0) {
              if (index == ind) {
                e.error = true
                $scope.indexDeleted = index
              }
              $scope.error = 'Los horarios no se pueden superponer'
            } else {
              $scope.error = ''
            }
          }
        })
      }

      //CAMBIAR VISTA CALENDARIO
      $scope.changeView = function () {

        //uiCalendarConfig.calendars['calendar'].fullCalendar('changeView', 'basicWeek');
        // uiCalendarConfig.calendars['calendar'].fullCalendar('changeView', 'month');
        uiCalendarConfig.calendars['calendar'].fullCalendar('refetchEvents')
        //document.activeElement.blur();

      };

      $scope.selectedDates = function (evento, fechaMonth, fechaDiaAnio) {
        if (typeof fechaMonth == 'string') {
          fechaMonth = new Date(fechaMonth)
        }
        if (!moment.isMoment(fechaDiaAnio)) {
          fechaDiaAnio = moment(fechaDiaAnio)
        }
        var month = fechaMonth.getMonth()
        var dateStr = fechaDiaAnio.get('date') + '-' + (month + 1) + '-' + fechaDiaAnio.get('year')
        $scope.newDateStart = dateStr + ' ' + evento.hourStart
        $scope.newDateEnd = dateStr + ' ' + evento.hourEnd
        var dateParsedStart = moment($scope.newDateStart, "DD-MM-YYYY hh:mm:ss")
        var dateParsedEnd = moment($scope.newDateEnd, "DD-MM-YYYY hh:mm:ss")
        evento.start = moment(dateParsedStart).toDate()
        evento.end = moment(dateParsedEnd).toDate()
        return evento
      };

      //ELIMINAR 
      $scope.remove = function (index) {
        // $scope.events[index].deleted = true
        // $scope.eventDeleted.push($scope.events[index])
        $scope.events.splice(index, 1)
        angular.forEach($scope.events, function (e, index) {
          if (e.error) {
            $scope.error = 'Los horarios no se pueden superponer'
            return
          } else {
            $scope.error = ''
          }
        })
      };

      //TRAER USUARIOS
      if (userRole == "admin" || userRole == "pm") {
        UserServices.find(0, "", function (err, users) {
          if (!err) {
            $scope.users = users.sort(function(a,b) {
              if (a.name > b.name) { return 1; }
              if (a.name < b.name) { return -1; }
              return 0;
            });
            $scope.users.unshift({ id: 0, name: "Todos"});
          };
        })
      };

      //BORRAR EVENTOS DE HORARIO FIJO ALMACENADOS (MANTIENE EXEPCIONES)
      $scope.cleanEvents = function (cb) {
        $scope.trackedEvents = [];
        $scope.events = [];
        $scope.mostrarInfo = [];
        $scope.eventSources[0] = [];
        $scope.horariosFijos = [
          { name: 'Lunes', horarios: [] },
          { name: 'Martes', horarios: [] },
          { name: 'Miercoles', horarios: [] },
          { name: 'Jueves', horarios: [] },
          { name: 'Viernes', horarios: [] },
          { name: 'Sabado', horarios: [] },
          { name: 'Domingo', horarios: [] }
        ];
        // $scope.eventSources[0] = $scope.events;

        cb(true)
      };



      //ACTUALIZAR EVENTOS
      $scope.refreshEventos = function (id, cb) {
        $scope.cleanEvents(function (bool) {
          if (bool) {
            getUserEvents(id, $scope.currentMonth, function (exc, hF, tracks) {
              if (exc || hF || tracks) {
                $scope.eventSources[0] = $scope.events;
                cb(bool)
              }
            })
          }
        });
      };

      //FORMATEAR ARRAY DE HORARIOS FIJOS PARA ENVIARLO A LA API
      $scope.armarHorarioFijoPost = function () {
        $scope.horariosFijosAux = angular.copy($scope.horariosFijos)
        angular.forEach($scope.horariosFijosAux, function (hF, index) {
          hF.name = hF.name.toLowerCase();
          angular.forEach(hF.horarios, function (h) {

            hF.user_id = $scope.filter.user
            hF.start = moment().format('YYYY-MM-DD') + ' ' + h.desde + ":00"
            hF.end = moment().format('YYYY-MM-DD') + ' ' + h.hasta + ":00"
            h.desde = moment().format('YYYY-MM-DD') + ' ' + h.desde + ":00"
            h.hasta = moment().format('YYYY-MM-DD') + ' ' + h.hasta + ":00"
          });

        });
      };

      //MODAL AGREGAR HORARIO FIJO
      $scope.modalHorarioFijo = function (event) {
        setTimeout(function () {
          document.activeElement.blur();
        }, 100)
        $scope.error = ''
        ngDialog.open({
          name: 'modalHorarioFijo',
          template: '/app/components/calendar/views/definirHorarioFijo.modal.html',
          showClose: true,
          scope: $scope,
          disableAnimation: true,
          data: {
            confirm: function () {
              $scope.actualizarHorariosFijos();
              $scope.armarHorarioFijoPost();
              $scope.cleanEvents(function (bool) {
                if (bool) {
                  $scope.horariosFijosAux.push({ id: $scope.filter.user });
                  CalendarServices.postUserEvents($scope.horariosFijosAux, function (err, result) {
                    $scope.uiConfig.calendar.viewRender({
                      intervalEnd: {
                        _d: dateView
                      }
                    }, {

                    })
                  });
                  $scope.horariosFijosAux = []
                }
              });
              ngDialog.close();
            },

            cancel: function () {

              ngDialog.close();
            }
          }
        })
      };


      //MODAL EDITAR EVENTOS
      $scope.modalEventos = function () {
        console.log($scope.events)
        $scope.error = ''
        ngDialog.open({
          template: '/app/components/calendar/views/editarEventosDia.modal.html',
          showClose: true,
          scope: $scope,
          disableAnimation: true,
          data: {
            confirm: function () {
              if ($scope.error == '') {
                $scope.crearArrayPostExceptions()


                ngDialog.close();
              }
              $scope.diaAnterior = false
            },
            cancel: function () {
              if ($scope.indexDeleted) {
                $scope.events.splice($scope.indexDeleted, 1)
              }
              $scope.diaAnterior = false

              ngDialog.close();
            }
          }
        })
      },



        //TOMAR DATOS DE MODAL HORARIO FIJO Y PASARLOS A MOSTRAR INFO - MOSTRAR MODAL ERROR
        $scope.addHorarioFijo = function (day, t) {
          $scope.error = ''
          if (t == undefined || t.hourStart == undefined || t.hourEnd == undefined) {
            $scope.error = 'Nos has ingresado los horarios correctamente'

          } else {
            $scope.btwDatesH(day.toLowerCase(), t.hourStart, t.hourEnd, 'hf')
            if ($scope.error == '') {
              $scope.mostrarInfo.push({ name: day.toLowerCase(), desde: t.hourStart, hasta: t.hourEnd })
            }
          }
        };

      //ACTUALIZAR HORARIOS FIJOS CON INFO DE MOSTRAR INFO
      $scope.actualizarHorariosFijos = function () {
        angular.forEach($scope.horariosFijos, function (day, index) {
          angular.forEach($scope.mostrarInfo, function (dayInfo, indexInfo) {

            if (dayInfo.name.toLowerCase() == day.name.toLowerCase() && !dayInfo.exception && !dayInfo.trackedEvent) {
              $scope.arrayAux.push({ desde: dayInfo.desde, hasta: dayInfo.hasta });

              day.horarios = $scope.arrayAux;

            }

          });
          setHorariosFijos($scope.currentMonth, function (bool) {
          })
          $scope.arrayAux = [];
        });

      };

      //ELIMINAR REGISTRO DE HORARIO EN MODAL HORARIO FIJO
      $scope.eliminarRegistro = function (index) {
        $scope.mostrarInfo.splice(index, 1);
        $scope.horariosFijos = [
          { name: 'Lunes', horarios: [] },
          { name: 'Martes', horarios: [] },
          { name: 'Miercoles', horarios: [] },
          { name: 'Jueves', horarios: [] },
          { name: 'Viernes', horarios: [] },
          { name: 'Sabado', horarios: [] },
          { name: 'Domingo', horarios: [] }
        ];
        $scope.actualizarHorariosFijos()
      };

      //MOSTRAR HORARIO FIJO EN EL CALENDARIO REPETIDO EN LOS DIAS CORRESPONDIENTES
      var eventoAux = {
        title: 'Activo',
        start: null,
        end: null,
        hourStart: null,
        hourEnd: null,
        allDay: false,
      };

      function createUserExceptionTitle(r) {
        var result = r.title;
        if (userRole == "admin" || userRole == "pm") {
          var usrName = $filter('filter')($scope.users, { id: r.user_id })[0].name;
          result = usrName.toUpperCase() + ' - ' + r.title;
        }
        return result;
      };

      function setHorariosFijos(mesActual, callback) {
        var cant = moment(mesActual, "YYYY-MM").daysInMonth()
        eventosFijos = [];
        for (var i = 1; i <= cant; i++) {
          var dia = angular.copy(i)
          var weekDayName = moment(dia + '-' + mesActual, 'DD-MM-YYYY').format('dddd').toLowerCase();
          var check =  moment(dia + '-' + $scope.currentMonth, 'DD-MM-YYYY')
          if ( moment().diff(check) > 0 ){
              if ($scope.trackedEvents.length > 0) {
                angular.forEach($scope.trackedEvents, function (t, index) {
                  if (t.start && t.end && !t.trackedEvent) {
                    if (moment(t.start).toDate() < moment($scope.fechaActualCompleta).add(-1, 'days').toDate()) {
                      t.dayCheck = moment(t.start).format('DD')
                      t.hourStart = moment(t.start).format('HH:mm')
                      t.hourEnd = moment(t.end).format('HH:mm')
                      t.trackedEvent = true
                      $scope.eventSources[0].push(t)
                    }
                  }
                }
                )
              }
          }
          angular.forEach($scope.horariosFijos, function (hF, index) {
            angular.forEach($scope.exceptions, function (r, index) {
              if (r.start) {
                r.dayCheck = moment(r.start).format('DD')
                if (i == r.dayCheck && !r.added) {
                  r.title = createUserExceptionTitle(r);
                  $scope.eventSources[0].push(r)
                  r.added = true
                  diasAgregados.push(i);
                }
              }
            })
            if (hF.horarios.length > 0 && hF.name.toLowerCase() == normalize(weekDayName)) {

              if (diasAgregados.includes(i)) {
                return

              } else {
                angular.forEach(hF.horarios, function (h, index) {
                  eventoAux.day = (i)
                  eventoAux.title = 'Horario Fijo';
                  eventoAux.hourStart = angular.copy(h.desde)
                  eventoAux.hourEnd = angular.copy(h.hasta)
                  var fecha = moment(dia + '-' + mesActual, 'DD-MM-YYYY')
                  eventoFijo = angular.copy($scope.selectedDates(eventoAux, fecha.toDate(), fecha))

                  if (eventoFijo.start >= moment().add(-1, 'days').toDate()) {
                    $scope.eventSources[0].push(eventoFijo)
                    eventoFijo = {}
                  }
                })
                diasAgregados.push(i);
              }

            }
          })
        }
        


        callback(true)
      };


      //SACAR TILDES ETC
      var normalize = (function () {
        var from = "ÃÀÁÄÂÈÉËÊÌÍÏÎÒÓÖÔÙÚÜÛãàáäâèéëêìíïîòóöôùúüûÑñÇç",
          to = "AAAAAEEEEIIIIOOOOUUUUaaaaaeeeeiiiioooouuuunncc",
          mapping = {};

        for (var i = 0, j = from.length; i < j; i++)
          mapping[from.charAt(i)] = to.charAt(i);

        return function (str) {
          var ret = [];
          for (var i = 0, j = str.length; i < j; i++) {
            var c = str.charAt(i);
            if (mapping.hasOwnProperty(str.charAt(i)))
              ret.push(mapping[c]);
            else
              ret.push(c);
          }
          return ret.join('');
        }

      })();






    }]);

}(angular));