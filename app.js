
	// Global variables

    var scriptVersion = "Version 193 on Mar 17, 12:05 PM"

    var spreadsheetId

    var currUser = {}

    var trpHdrs
    var trpVals
    var trpTitle
    var trpShtId
    var trpIdxArr

    var resHdrs
    var resVals
    var resTitle
    var resShtId
    var resIdxArr

    var placeTree

    var Goth
  
    var arrOptions
    var optionsIdx
  
    var timerStart

    var user = {}

    var DateTime = luxon.DateTime;

    var ukPlaces = []

    var tempAct = [[
        'endTimestamp',
        'activities[0].activityType',
        'calcDuration/60',
        'distance/1609.34',
        'calcDistance/1609.34',
        'activities?.activityType',
        'waypointPath?.waypoints.travelMode',
        'waypointPath?.waypoints.source',
        'waypointPath?.waypoints.distanceMeters/1609.34',
        'simplifiedRawPath?.source',
        'simplifiedRawPath?.distanceMeters/1609.34'
    
      ]]
    

   
/*global jQuery */
jQuery(function ($) {
	// 'use strict';


	var App = {

		init: function () {

			this.serviceWorker()
                console.log('serviceworker')

            authorize()
                console.log('authorize')

			this.bindEvents();
                console.log('bindEvents')

		},

        serviceWorker: function () {

            if ("serviceWorker" in navigator) {
                if (navigator.serviceWorker.controller) {
                  console.log("[PWA Builder] active service worker found, no need to register");
                } else {
                  // Register the service worker
                  navigator.serviceWorker
                    .register("pwabuilder-sw.js", {
                      scope: "./"
                    })
                    .then(function (reg) {
                      console.log("[PWA Builder] Service worker has been registered for scope: " + reg.scope);
                    })
                    .catch(function (err) {
                      console.log("[PWA Builder] Service worker registration failed: ", err)
                    });
                }
              }


        },

		bindEvents: function () {

            // Auth tab
          
            // $('#btnAuth')                   .button().click(btnAuthHtml);
         
            // Home tab

            // $('#btnSignout')            .button().click(btnSignoutHtml);
            $('#btnCountries')          .button().click(btnCountriesHtml);
            $('#btnTrips')              .button().click(listTrips);
            $('#btnReservations')       .click(listReservations);
            $('#btnPlaces')             .click(btnPlacesHtml);
            $('#btnTripByYr')           .click(btnTripByYrHtml);
            $('#btnPhotoXray')          .click(btnPhotoXrayHtml);
            
            // Trips
            $('#btnTrpSelect')            .click(btnTrpSelectHtml);
            
            $('#shtSelectDropDown')        .on('show.bs.dropdown', function () {
                btnShtMoreVertHtml()
            })
            
            $('#btnTrpAddTrip')   .click(btnAddTripHtml);
            $('#btntrpmdtlDelete')   .click(btntrpmdtlDeleteHtml);
            
            // $('#btnShtAddPDocument

            $('#btnTrpmSubmit')       .click(btnTrpmSubmitSheetHtml);
            $('#btnTrpmDelete')       .click(btnTrpmDeleteSheetHtml);
            $('#btnTrpmBuildDest')    .click(btnTrpmBuildDestHtml);

            

            $("#trpSearch").on("input", function() {
                var value = $(this).val().toLowerCase();
                var exc = value.substr(0,1) == '-'
                var nbrDays = 0

                $("#trpContainer #trpCompositeKey").filter(function() {

                    var txt = $(this).text().toLowerCase()

                    if (exc)    var toggle = txt.indexOf(value.substring(1)) == -1
                    else        var toggle = txt.indexOf(value) > -1

                    $(this).parent().parent().parent().toggle(toggle)
                    if (toggle && this.dataset.nbrdays) nbrDays += this.dataset.nbrdays*1
                    console.log('this app', $(this), toggle, this.dataset.nbrdays*1, nbrDays)

                });

                console.log('nbrDays', nbrDays + ' days')

                // $("#trpNbr").html(countDisplayed("trpContainer"))
                // $("#trpNbrDays").html(formatNumber(nbrDays) + ' days')

                dispTrpNbrDays(countDisplayed("trpContainer"), nbrDays)


            });

            // Reservations
            $('#btnResSelect')            .click(btnResSelectHtml);
            
            $('#resSelectDropDown')        .on('show.bs.dropdown', function () {
                btnResMoreVertHtml()
            })
            
            $('#btnResAddReservation')   .click(btnAddReservationHtml);

            $('#btnResmSubmit')       .click(btnResmSubmitSheetHtml);
            $('#btnResmDelete')       .click(btnResmDeleteSheetHtml);


            // refresh the calendar to match search results.
            $("#resSearch")[0].addEventListener('input', debounce( () => {
                btnShowCalendarHtml()
            }, 1000))

            $("#resSearch").on("input", function() {
                var value = $(this).val().toLowerCase();
                var exc = value.substr(0,1) == '-'

                $("#resContainer #resCompositeKey").filter(function() {

                    var txt = $(this).text().toLowerCase()

                    if (exc)    var toggle = txt.indexOf(value.substring(1)) == -1
                    else        var toggle = txt.indexOf(value) > -1

                    $(this).parent().parent().parent().toggle(toggle)

                });

                $("#resNbr").html(countDisplayed("resContainer"))

            });

            // Places
            $("#plSearch").on("input", function() {
                var value = $(this).val().toLowerCase();
                var exc = value.substr(0,1) == '-'

                $("#plContainer #plCompositeKey").filter(function() {

                    var txt = $(this).text().toLowerCase()

                    if (exc)    var toggle = txt.indexOf(value.substring(1)) == -1
                    else        var toggle = txt.indexOf(value) > -1

                    $(this).parent().parent().parent().toggle(toggle)

                });

                $("#plNbr").html(countDisplayed("plContainer"))

            });
            
            // tripsByYr
            var tblTrips = document.getElementById('tblTripsByYr');

            tblTrips.addEventListener('swiped-right', function(e) {
                changeYr('prev')
            });

            tblTrips.addEventListener('swiped-left', function(e) {
                changeYr('next')
            });


             // Countries
             $("#cntSearch").on("input", function() {
                var value = $(this).val().toLowerCase();
                // var exc = value.substr(0,1) == '-'
                var exc = false

                $(".cntTreeItem").filter(function() {

                    var txt = $(this).text().toLowerCase()

                    if (exc)    var toggle = txt.indexOf(value.substring(1)) == -1
                    else        var toggle = txt.indexOf(value) > -1

                    $(this).toggle(toggle)

                });

                // $("#resNbr").html(countDisplayed("resContainer"))

            });
        

            // All tabs

            var whiteList = $.fn.tooltip.Constructor.Default.allowList
          
                whiteList.table = []
                whiteList.td = []
                whiteList.th = []
                whiteList.thead = []
                whiteList.tr = []
                whiteList.tbody = []
                whiteList.button = []
          
            setupFormValidation()
          
          
            // $("#myToast").on("show.bs.toast", function() {
            //   $(this).removeClass("d-none");
            //       })
          
            // $("#myToast").on("hidden.bs.toast", function() {
            //   $(this).addClass("d-none");
            //       })
 
            $('.modal').on('shown.bs.modal', function () {
                $(this).find('[autofocus]').focus();
            });
            $('.modal').on('show.bs.modal', function (e) {
                var activeElement = document.activeElement;
                $(this).on('hidden.bs.modal', function () {
                    activeElement.focus();
                    $(this).off('hidden.bs.modal');
                });
            });
          
            Date.prototype.toLocaleISOString = function() {
                const zOffsetMs = this.getTimezoneOffset() * 60 * 1000;
                const localTimeMs = this - zOffsetMs;
                const date = new Date(localTimeMs);
                const utcOffsetHr = this.getTimezoneOffset() / 60;
                const utcOffsetSign = utcOffsetHr <= 0 ? '+' : '-';
                const utcOffsetString = utcOffsetSign + (utcOffsetHr.toString.length == 1 ? `0${utcOffsetHr}` : `${utcOffsetHr}`) + ':00';
                return date.toISOString().replace('Z', utcOffsetString);
            };                 
		},

	};

    App.init();

});
