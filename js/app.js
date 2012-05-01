
(function ($) {
		
	// Hlavní třída aplikace
	function MyAccount () {
		var myAccount = this;
		
		this.actualLongitude = null;
		this.actualLatitude = null;
		this.actualThreadPage = 'main';
		this.mapPlace = false;
		this.db = false;
		this.forceSetPosition = false;
		this.afterMapLoad = false;
		this.markers = [];
		
		/**
		 * Načte správné select options do datumu a časů
		 */
		this.loadDateTimeInputs = function (target) {
			var now = new Date();
			var year = $(target).find('.date').find('select[name="date-year"]');
			var yearMax = 2030;
			var yearMin = now.getFullYear()-2;
			year.html('');
			for (var i=yearMin;i <= yearMax;i++) {
				var option = $('<option/>').val(i).html(i);
				if (i == now.getFullYear()) {
					option.attr('selected', 'selected');
				}
				year.append(option);
			}
			year.selectmenu('refresh');
			
			var month = $(target).find('.date').find('select[name="date-month"]');
			var months = ['leden', 'únor', 'březen', 'duben', 'květen', 'červen', 'červenec', 'srpen', 'září', 'říjen', 'listopad', 'prosinec'];
			month.html('');
			for (var i in months) {
				var option = $('<option/>').val(i).html(months[i]);
				if (i == now.getMonth()) {
					option.attr('selected', 'selected');
				}
				month.append(option);
			}
			month.selectmenu('refresh');
			
			var date = $(target).find('.date').find('select[name="date-day"]');
			var dateMax = 31;
			var dateMin = 1;
			date.html('');
			for (var i=dateMin;i <= dateMax;i++) {
				var option = $('<option/>').val(i).html(i);
				if (i == now.getDate()) {
					option.attr('selected', 'selected');
				}
				date.append(option);
			}
			date.selectmenu('refresh');
			
			var hour = $(target).find('.time').find('select[name="time-hour"]');
			var hourMax = 23;
			var hourMin = 0;
			hour.html('');
			for (var i=hourMin;i <= hourMax;i++) {
				var option = $('<option/>').val(i).html(i);
				if (i == now.getHours()) {
					option.attr('selected', 'selected');
				}
				hour.append(option);
			}
			hour.selectmenu('refresh');
			
			var minute = $(target).find('.time').find('select[name="time-minute"]');
			var minutes = ['00', '15', '30', '45'];
			minute.html('');
			for (var i in minutes) {
				var option = $('<option/>').val(parseInt(minutes[i])).html(minutes[i]);
				if (minutes[i] > now.getMinutes()-15 && minutes[i] < now.getMinutes()) {
					option.attr('selected', 'selected');
				}
				minute.append(option);
			}
			minute.selectmenu('refresh');
		}
		
		/**
		 * Spustí aplikaci
		 */
		this.init = function () {
			// Defaultně nastavý přechody mezi stránkami na slide
			$.mobile.defaultPageTransition = "slide";
			myAccount.loadPosition();
			
			myAccount.bindPages();
			myAccount.openDatabase();
			myAccount.createDatabase();
		}
		
		/**
		 * Nabinduje potřebné události na akce uživatele
		 */
		this.bindPages = function () {
			// Před načtení stránky Nová platba
			$('#new-payment').live('pagebeforeshow', function (that, obj) {
				if (obj.prevPage.attr('id') == 'select-place' || obj.prevPage.attr('id') == 'map-place') {
					return;
				}
				myAccount.actualThreadPage = 'new-payment';
				myAccount.loadDateTimeInputs('#new-payment');
				myAccount.loadPosition();
				myAccount.loadCameraUtils();
				myAccount.bindPlace();
				myAccount.bindSendForm('payment');
			});
			
			$('#new-withdraw').live('pagebeforeshow', function (that, obj) {
				if (obj.prevPage.attr('id') == 'select-place' || obj.prevPage.attr('id') == 'map-place') {
					return;
				}
				myAccount.actualThreadPage = 'new-withdraw';
				myAccount.loadDateTimeInputs('#new-withdraw');
				myAccount.loadPosition();
				myAccount.loadCameraUtils();
				myAccount.bindPlace();
				myAccount.bindSendForm('withdraw');
			});
			
			$('#new-debt').live('pagebeforeshow', function (that, obj) {
				if (obj.prevPage.attr('id') == 'select-place' || obj.prevPage.attr('id') == 'map-place') {
					return;
				}
				myAccount.actualThreadPage = 'new-debt';
				myAccount.loadDateTimeInputs('#new-debt');
				myAccount.loadPosition();
				myAccount.loadCameraUtils();
				myAccount.bindPlace();
				myAccount.bindPerson();
				myAccount.bindSendForm('debt');
			});
			
			$('#new-loan').live('pagebeforeshow', function (that, obj) {
				if (obj.prevPage.attr('id') == 'select-place' || obj.prevPage.attr('id') == 'map-place') {
					return;
				}
				myAccount.actualThreadPage = 'new-loan';
				myAccount.loadDateTimeInputs('#new-loan');
				myAccount.loadPosition();
				myAccount.loadCameraUtils();
				myAccount.bindPlace();
				myAccount.bindPerson();
				myAccount.bindSendForm('loan');
			});
			
			$('#new-income').live('pagebeforeshow', function (that, obj) {
				if (obj.prevPage.attr('id') == 'select-place' || obj.prevPage.attr('id') == 'map-place') {
					return;
				}
				myAccount.actualThreadPage = 'new-income';
				myAccount.loadDateTimeInputs('#new-income');
				myAccount.loadPosition();
				myAccount.loadCameraUtils();
				myAccount.bindPlace();
				myAccount.bindPerson();
				myAccount.bindSendForm('income');
			});
			
			$('#persons').live('pagebeforeshow', function (that, obj) {
				myAccount.loadPersonsOverview();
			});
			$('#places').live('pagebeforeshow', function (that, obj) {
				myAccount.loadPlacesOverview();
			});
			$('#atms').live('pagebeforeshow', function (that, obj) {
				myAccount.loadATMsOverview();
			});
			$('#log').live('pagebeforeshow', function (that, obj) {
				myAccount.loadLog();
			});
			
			// Před načtení stránky Výběr místa
			$('#select-place').live('pagebeforeshow', function (that, obj) {
				myAccount.loadPlaces();
			});
			
			// Před načtení stránky Výběr místa z mapy
			$('#map-place').live('pagebeforeshow', function (that, obj) {
				myAccount.loadMapPlaces();
			});
			
			$('#select-person').live('pagebeforeshow', function (that, obj) {
				myAccount.loadPersons();
			});
			
		}
		
		/**
		 * Do zadaného cíle načte aktuální GPS pozici
		 */
		this.loadPosition = function () {
			if (typeof navigator.geolocation == 'undefined') {
				$('#'+myAccount.actualThreadPage+'-actual-position-text').val('není k dispozici');
				$('#'+myAccount.actualThreadPage+'-actual-position-text').button('refresh');
				myAccount.dialog('Není k dispozici informace o GPS poloze');
				return;
			}
			navigator.geolocation.getCurrentPosition(function (position) {
				myAccount.actualLongitude = position.coords.longitude;
				myAccount.actualLatitude = position.coords.latitude;
				$('#'+myAccount.actualThreadPage+'-longitude').val(position.coords.longitude);
				$('#'+myAccount.actualThreadPage+'-latitude').val(position.coords.latitude);
				$('#'+myAccount.actualThreadPage+'-actual-position-text').val(myAccount.formatGPS(position.coords.latitude)+', '+myAccount.formatGPS(position.coords.longitude));
				$('#'+myAccount.actualThreadPage+'-actual-position-text').button('refresh');
				$('#new-'+myAccount.actualThreadPage+'-form').find('[name="position-id"]').val('');
			}, function (er) {
				myAccount.dialog(er.name)
			}, {
				enableHighAccuracy: true
			});
		}
		
		/**
		 * Načte možnosti kamery do aplikace
		 */
		this.loadCameraUtils = function () {
			if (typeof navigator.camera == 'undefined') {
				$('#'+myAccount.actualThreadPage+'-picture-camera, '+'#'+myAccount.actualThreadPage+'-picture-disk').attr('disabled', true);
				$('#'+myAccount.actualThreadPage+'-picture-camera, '+'#'+myAccount.actualThreadPage+'-picture-disk').button('refresh');
				return;
			}
			// @todo Dodelat přístup ke kameře ve PhoneGap
		}
		
		
		/**
		 * Nabinduje změnu z aktuální pozice
		 */
		this.bindPlace = function () {
			var target = '#'+myAccount.actualThreadPage+'-actual-position';
			$(target).unbind('change').bind('change', function (ev) {
				if (this.checked == true) {
					// když zaškrtne, načte aktuální umístění
					myAccount.loadPosition(target+'-text');
					$(target+'-name').attr('disabled', false);
				} else {
					$.mobile.changePage('#select-place');
					$(target+'-name').attr('disabled', true);
				}
			});
			$('#'+myAccount.actualThreadPage+'-show-map').unbind('click').bind('click', function (ev) {
				myAccount.forceSetPosition = [];
				myAccount.forceSetPosition.push({
					lat: $('#'+myAccount.actualThreadPage+'-latitude').val(),
					lng: $('#'+myAccount.actualThreadPage+'-longitude').val(),
					text: $('#'+myAccount.actualThreadPage+'-actual-position-name').val()
				});
			});
		}
		
		this.bindPerson = function () {
			var target = '#'+myAccount.actualThreadPage+'-new-person';
			$(target).unbind('change').bind('change', function (ev) {
				if (this.checked == true) {
					$(target+'-name').attr('disabled', false);
				} else {
					$.mobile.changePage('#select-person');
					$(target+'-name').attr('disabled', true);
				}
			});
		}
		
		this.loadPlaces = function () {
			myAccount.getPlaces(function (places) {
				var placesEl = $('#select-place-list');
				placesEl.html('');
				var allPlaces = [];
				for (var i = 0;i<places.length;i++) {
					var place = places.item(i);
					var ahref = $('<a href="#" data-i="'+i+'">'+place['name']+
						'<br/><span class="decent">'+place['lat']+
						', '+place['lng']+'</span></a>');
					var li = $('<li/>').html(ahref);
					placesEl.append(li);
					ahref.unbind('click').bind('click', function (ev) {
						ev.preventDefault();
						var i = parseInt($(this).attr('data-i'));
						$('#'+myAccount.actualThreadPage+'-form').find('[name="position-name"]').val(places.item(i)['name']);
						$('#'+myAccount.actualThreadPage+'-form').find('[name="position-id"]').val(places.item(i)['id']);
						$('#'+myAccount.actualThreadPage+'-actual-position-text').val(myAccount.formatGPS(places.item(i)['lat'])+', '+myAccount.formatGPS(places.item(i)['lng']));
						$('#'+myAccount.actualThreadPage+'-actual-position-text').button('refresh');
						$.mobile.changePage('#'+myAccount.actualThreadPage);
					});
					allPlaces.push({
						lat: place['lat'],
						lng: place['lng'],
						text: place['name']
					});
				}
				$('#select-place-map').unbind('click').bind('click', function (ev) {
					myAccount.forceSetPosition = allPlaces;
					myAccount.afterMapLoad = function(ev) {
						var lat = ev.latLng.lat();
						var lng = ev.latLng.lng();
						$('#'+myAccount.actualThreadPage+'-form').find('[name="position-name"]').val('');
						$('#'+myAccount.actualThreadPage+'-form').find('[name="latitude"]').val(lat);
						$('#'+myAccount.actualThreadPage+'-form').find('[name="longitude"]').val(lng);
						$('#'+myAccount.actualThreadPage+'-actual-position-text').val(myAccount.formatGPS(lat)+', '+myAccount.formatGPS(lng));
						$('#'+myAccount.actualThreadPage+'-actual-position-name').attr('disabled', false);
						$('#'+myAccount.actualThreadPage+'-actual-position-text').button('refresh');
						$.mobile.changePage('#'+myAccount.actualThreadPage);
					};
				});
				placesEl.listview('refresh');
			});
		}
		
		this.loadMapPlaces = function () {
			if (myAccount.actualLatitude == null) {
				myAccount.loadPosition();
			}
			var nowLatLng = new google.maps.LatLng(myAccount.actualLatitude, myAccount.actualLongitude);
			if (myAccount.mapPlace == false) {
				var option = {
					zoom: 14,
					center: nowLatLng,
					mapTypeId: google.maps.MapTypeId.ROADMAP
				};
				var mapsEl = document.getElementById('map-place-maps');
				$(mapsEl).height($(document).height()-$('#map-place [data-role="header"]').height()-$('#map-place [data-role="footer"]').height());
				$(mapsEl).parent().css('padding', '0');
				myAccount.mapPlace = new google.maps.Map(
					mapsEl,
					option
				);
			} else {
				myAccount.mapPlace.setCenter(nowLatLng);
			}
			
			var marker;
			while (marker = myAccount.markers.pop()) {
				marker.setVisible(false);
			}
			if (myAccount.forceSetPosition != false) {
				var latlng = nowLatLng;
				for (var i in myAccount.forceSetPosition) {
					var pos = myAccount.forceSetPosition[i];
					latlng = new google.maps.LatLng(pos.lat, pos.lng);
					var marker = new google.maps.Marker({
						position: latlng,
						map: myAccount.mapPlace
					});
					var win = new google.maps.InfoWindow({
						content: pos.text
					});
					google.maps.event.addListener(marker, 'click', function (ev) {
						win.open(myAccount.mapPlace, marker);
					});
					myAccount.markers.push(marker);
				}
				myAccount.mapPlace.setCenter(latlng);
				myAccount.forceSetPosition = false;
			}
			google.maps.event.clearListeners(myAccount.mapPlace, 'click');
			if (myAccount.afterMapLoad != false) {
				google.maps.event.addListener(myAccount.mapPlace, 'click', myAccount.afterMapLoad);
				myAccount.afterMapLoad = false;
			}
		}
		
		this.loadPersons = function () {
			myAccount.getPersons(function (persons) {
				var personsEl = $('#select-person-list');
				personsEl.html('');
				for (var i = 0;i<persons.length;i++) {
					var person = persons.item(i);
					var ahref = $('<a href="#" data-i="'+i+'">'+person['name']+'</a>');
					var li = $('<li/>').html(ahref);
					personsEl.append(li);
					ahref.unbind('click').bind('click', function (ev) {
						ev.preventDefault();
						var i = parseInt($(this).attr('data-i'));
						$('#'+myAccount.actualThreadPage+'-form').find('[name="person-name"]').val(persons.item(i)['name']);
						$('#'+myAccount.actualThreadPage+'-form').find('[name="person-id"]').val(persons.item(i)['id']);
						$.mobile.changePage('#'+myAccount.actualThreadPage);
					});
				}
				personsEl.listview('refresh');
			});
		}
		
		this.getPlaces = function (cb) {
			myAccount.db.transaction(function (tr) {
				var sql = 'SELECT * FROM place WHERE name <> \'\' ORDER BY name;';
				var args = [];
				tr.executeSql(sql, args, function (tr, res) {
					cb(res.rows);
				});
			});
		}
		
		this.getPersons = function (cb) {
			myAccount.db.transaction(function (tr) {
				var sql = 'SELECT * FROM person WHERE name <> \'\' ORDER BY name;';
				var args = [];
				tr.executeSql(sql, args, function (tr, res) {
					cb(res.rows);
				});
			});
		}
		this.getPersonsOverview = function (cb) {
			myAccount.db.transaction(function (tr) {
				var sql = 'SELECT *, SUM(CASE WHEN (action_item.type = \'debt\') THEN -1*action_item.value ELSE (CASE WHEN action_item.type = \'loan\' THEN action_item.value ELSE 0 END) END) AS sum_state '+
					'FROM person '+
					'JOIN action_item ON (person.id = action_item.id_person) '+
					'WHERE person.name <> \'\' '+
					'GROUP BY person.id ORDER BY ABS(sum_state) DESC, person.name;';
				var args = [];
				tr.executeSql(sql, args, function (tr, res) {
					cb(res.rows);
				});
			});
		}
		
		this.loadPersonsOverview = function () {
			myAccount.getPersonsOverview(function (persons) {
				var personsEl = $('#persons-list');
				personsEl.html('');
				for (var i = 0;i<persons.length;i++) {
					var person = persons.item(i);
					var head = $('<h3 data-i="'+i+'">'+person['name']+'</3>');
					var content = $('<p/>').html('<div>Stav: '+person['sum_state']+'</div>');
					var coll = $('<div/>').attr('data-role', 'collapsible').html(head).append(content);
					var li = $('<li/>').html(coll);
					personsEl.append(li);
				}
				personsEl.listview('refresh');
				//coll.collapsible('refresh');
			});
		}
		
		this.getPlacesOverview = function (cb) {
			myAccount.db.transaction(function (tr) {
				var sql = 'SELECT *, SUM(CASE WHEN (action_item.type IN (\'income\', \'payment\', \'debt\', \'loan\')) THEN action_item.value ELSE 0 END) AS sum_spend '+
					'FROM place '+
					'JOIN action_item ON (place.id = action_item.id_place) '+
					'WHERE place.name <> \'\' '+
					'GROUP BY place.id '+
					'HAVING ABS(sum_spend) > 0 '+
					'ORDER BY ABS(sum_spend) DESC, place.name;';
				var args = [];
				tr.executeSql(sql, args, function (tr, res) {
					cb(res.rows);
				});
			});
		}
		
		this.loadPlacesOverview = function () {
			myAccount.getPlacesOverview(function (rows) {
				var el = $('#places-list');
				el.html('');
				var allPlaces = [];
				for (var i = 0;i<rows.length;i++) {
					var item = rows.item(i);
					var head = $('<h3>'+item['name']+'</3>');
					var mapBut = $('<a data-i="'+i+'" href="#map-place" data-role="button" />').html('Mapa');
					var content = $('<p/>').html('<div>'+(
						(item['type']=='income'? 'Vyděláno': 
							item['type']=='payment' ?'Utraceno' :'Stav'
						)
					)+': '+item['sum_spend']+'</div>').append(mapBut);
					var coll = $('<div/>').attr('data-role', 'collapsible').html(head).append(content);
					var li = $('<li/>').html(coll);
					el.append(li);
					mapBut.button();
					mapBut.unbind('click').bind('click', function (ev) {
						var i = parseInt($(this).attr('data-i'));
						myAccount.forceSetPosition = [];
						myAccount.forceSetPosition.push({
							lat: rows.item(i)['lat'],
							lng: rows.item(i)['lng'],
							text: rows.item(i)['name']
						});
					});
					allPlaces.push({
						lat: item['lat'],
						lng: item['lng'],
						text: item['name']
					});
				}
				$('#map-place-places').unbind('click').bind('click', function () {
					myAccount.forceSetPosition = allPlaces;
				});
				el.listview('refresh');
				//coll.collapsible('refresh');
			});
		}
		
		this.getATMsOverview = function (cb) {
			myAccount.db.transaction(function (tr) {
				var sql = 'SELECT *, SUM(CASE WHEN (action_item.type IN (\'withdraw\')) THEN action_item.value ELSE 0 END) AS sum_withdraws '+
					'FROM place '+
					'JOIN action_item ON (place.id = action_item.id_place) '+
					'WHERE action_item.type = \'withdraw\' '+
					'GROUP BY place.id '+
					'ORDER BY ABS(sum_withdraws) DESC, place.name;';
				var args = [];
				tr.executeSql(sql, args, function (tr, res) {
					cb(res.rows);
				});
			});
		}
		
		this.loadATMsOverview = function () {
			myAccount.getATMsOverview(function (rows) {
				var el = $('#atms-list');
				el.html('');
				var allPlaces = [];
				for (var i = 0;i<rows.length;i++) {
					var item = rows.item(i);
					var head = $('<h3>'+item['name']+'</3>');
					var mapBut = $('<a href="#map-place" data-i="'+i+'" data-role="button" />').html('Mapa');
					var content = $('<p/>').html('<div>Vybráno: '+item['sum_withdraws']+'</div>').append(mapBut);
					var coll = $('<div/>').attr('data-role', 'collapsible').html(head).append(content);
					var li = $('<li/>').html(coll);
					el.append(li);
					mapBut.button();
					mapBut.unbind('click').bind('click', function (ev) {
						var i = parseInt($(this).attr('data-i'));
						myAccount.forceSetPosition = [];
						myAccount.forceSetPosition.push({
							lat: rows.item(i)['lat'],
							lng: rows.item(i)['lng'],
							text: rows.item(i)['name']
						});
					});
					allPlaces.push({
						lat: item['lat'],
						lng: item['lng'],
						text: item['name']
					});
				}
				$('#map-place-atms').unbind('click').bind('click', function () {
					myAccount.forceSetPosition = allPlaces;
				});
				el.listview('refresh');
				//coll.collapsible('refresh');
			});
		}
		
		this.getLog = function (cb) {
			myAccount.db.transaction(function (tr) {
				var sql = 'SELECT *, person.name AS person_name, place.name AS place_name '+
					'FROM action_item '+
					'LEFT JOIN place ON (place.id = action_item.id_place) '+
					'LEFT JOIN person ON (person.id = action_item.id_person) '+
					'ORDER BY datetime DESC;';
				var args = [];
				tr.executeSql(sql, args, function (tr, res) {
					cb(res.rows);
				});
			});
		}
		
		this.loadLog = function () {
			myAccount.getLog(function (rows) {
				var el = $('#log-list');
				el.html('');
				for (var i = 0;i<rows.length;i++) {
					var item = rows.item(i);
					switch (item['type']) {
						case 'loan':
							var text = '<h3 data-i="'+i+'">Půjčeno '+item['person_name']+' - '+item['value']+'Kč</3>';
							break;
						case 'debt':
							var text = '<h3 data-i="'+i+'">Vypůjčeno od '+item['person_name']+' - '+item['value']+'Kč</3>';
							break;
						case 'income':
							var text = '<h3 data-i="'+i+'">Příjem od '+item['person_name']+' - '+item['value']+'Kč</3>';
							break;
						case 'payment':
							var text = '<h3 data-i="'+i+'">Platba v '+item['place_name']+' - '+item['value']+'Kč</3>';
							break;
						case 'withdraw':
							var text = '<h3 data-i="'+i+'">Výběr v '+item['place_name']+' - '+item['value']+'Kč</3>';
							break;
						default:
							var text = 'Neznámá akce';
					}
					var content = $('<p/>').html('<div>'+item['datetime']+'</div>');
					var head = $(text);
					//var mapBut = $('<a href="#map-place" data-role="button" />').html('Mapa');
					var coll = $('<div/>').attr('data-role', 'collapsible').html(head).append(content);
					var li = $('<li/>').html(coll);
					el.append(li);
					//mapBut.button();
				}
				el.listview('refresh');
				//coll.collapsible('refresh');
			});
		}
		
		
		this.bindSendForm = function (type) {
			$('#new-'+type+'-form').find('[name="position-id"]').val('');
			$('#new-'+type+'-form').unbind('submit').bind('submit', function (ev) {
				ev.preventDefault();
				var el = $(this);
				var month = el.find('[name="date-month"]').val();
				var day = el.find('[name="date-day"]').val();
				var hour = el.find('[name="time-hour"]').val();
				var minute = el.find('[name="time-minute"]').val();
				var datetime = 
					el.find('[name="date-year"]').val()+'-'+
					(month<10?'0':'')+month+'-'+
					(day<10?'0':'')+day+' '+
					(hour<10?'0':'')+hour+':'+
					(minute<10?'0':'')+minute+':00'
				;
				var place = el.find('[name="position-name"]').length>0? {
					id:  el.find('[name="position-id"]').val(),
					name: el.find('[name="position-name"]').val(),
					lat: el.find('[name="latitude"]').val(),
					lng: el.find('[name="longitude"]').val()
				} :null;
				var person = el.find('[name="person-name"]').length>0? {
					id:  el.find('[name="person-id"]').val(),
					name: el.find('[name="person-name"]').val()
				} :null;
				myAccount.addActionItem(type, 
					el.find('[name="value"]').val(), 
					datetime, 
					el.find('[name="note"]').val(), 
					place, person, function () {
						$.mobile.changePage('#main');
						myAccount.dialog('Uloženo');
					}
				);
			});
		}
		
		this.addActionItem = function (type, value, datetime, note, place, person, cb) {
			myAccount.db.transaction(function (tr) {
				if (place != null && place.id == '') {
					var sql = 'INSERT INTO place (name, lat, lng) VALUES (?, ?, ?);';
					var args = [place.name, place.lat, place.lng];
				} else {
					var sql = 'SELECT 1;';
					var args = [];
				}
					tr.executeSql(sql, args, function (tr, resPlace) {
						if (person != null && person.id == '') {
							var sql = 'INSERT INTO person (name) VALUES (?);';
							var args = [person.name];
						} else {
							var sql = 'SELECT 1;';
							var args = [];
						}
							tr.executeSql(sql, args, function (tr, resPerson) {
								var id_person = null;
								var id_place = null;
								if (place != null) {
									if (place.id != '') {
										id_place = place.id;
									} else {
										id_place = resPlace.insertId;
									}
								}
								if (person != null) {
									if (person.id != '') {
										id_person = person.id;
									} else {
										id_person = resPerson.insertId;
									}
								}
								var sql = 'INSERT INTO action_item (value, datetime, note, type, id_person, id_place) VALUES (?, ?, ?, ?, ?, ?);';
								tr.executeSql(sql, [value, datetime, note, type, id_person, id_place], cb);
							});
						
					});
				
			});
		}
		
		
		
		
			
		/**
		 * Vytvoří dialog s textem
		 */
		this.dialog = function (text) {
			alert(text);
		}
		this.formatGPS = function (gps) {
			return Math.round(gps*1000000)/1000000
		}
		
		this.openDatabase = function () {
			try {
				myAccount.db = openDatabase("myAccount2", "1.0", "Database of appliaction myAccount", 100*1024);
			} catch (e) {
				alert('Váš prohlížeč nepodporuje WEB SQL databázi. Bez ní není možné aplikaci používat.');
			}
		}
		
		this.createDatabase = function () {
				myAccount.db.transaction(function (tr) {
					var sql = 'CREATE TABLE IF NOT EXISTS action_item( '+
						'id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, '+
						'value DOUBLE, '+
						'datetime DATETIME, '+
						'note TEXT, '+
						'type VARCHAR(20), '+
						'id_person INTEGER, '+
						'id_place INTEGER '+
						');';
					tr.executeSql(sql, []);
					sql = 'CREATE TABLE IF NOT EXISTS person( '+
						'id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, '+
						'name TEXT '+
						');';
					tr.executeSql(sql, []);
					sql = 'CREATE TABLE IF NOT EXISTS place( '+
						'id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, '+
						'name VARCHAR(50), '+
						'lat DOUBLE, '+
						'lng DOUBLE '+
						');';
					tr.executeSql(sql, []);
				});
		}
	}
	
	
	// Vytvoření třídy aplikace
	var myAccount = new MyAccount();
	myAccount.init();

})(jQuery);