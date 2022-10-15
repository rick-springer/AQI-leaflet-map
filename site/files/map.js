var map;

function updateURLParameter(url, param, paramVal) {
	var theAnchor = null;
	var newAdditionalURL = "";
	var tempArray = url.split("?");
	var baseURL = tempArray[0];
	var additionalURL = tempArray[1];
	var temp = "";

	if (additionalURL) {
		var tmpAnchor = additionalURL.split("#");
		var theParams = tmpAnchor[0];
		theAnchor = tmpAnchor[1];
		if (theAnchor) {
			additionalURL = theParams;
		}

		tempArray = additionalURL.split("&");

		for (i = 0; i < tempArray.length; i++) {
			if (tempArray[i].split('=')[0] != param) {
				newAdditionalURL += temp + tempArray[i];
				temp = "&";
			}
		}
	} else {
		var tmpAnchor = baseURL.split("#");
		var theParams = tmpAnchor[0];
		theAnchor = tmpAnchor[1];

		if (theParams) {
			baseURL = theParams;
		}
	}

	if (theAnchor) {
		paramVal += "#" + theAnchor;
	}

	var rows_txt = temp + "" + param + "=" + paramVal;
	return baseURL + "?" + newAdditionalURL + rows_txt;
}

function getUrlParameters() {
	var vars = [], hash;
	var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
	for (var i = 0; i < hashes.length; i++) {
		hash = hashes[i].split('=');
		vars.push(hash[0]);
		vars[hash[0]] = hash[1];
	}
	return vars;
}

function foundLocation(position) {
	if (typeof map != "undefined") {
		var lat = position.coords.latitude;
		var lon = position.coords.longitude;
		map.setView(new L.LatLng(lat, lon), 11);
	}
}

function myWindroseMarker(data) {
	var content = '<canvas id="id_' + data.id + '" width="50" height="50"></canvas>';
	var icon = L.divIcon({ html: content, iconSize: [50, 50], className: 'owm-div-windrose' });
	return L.marker([data.coord.Lat, data.coord.Lon], { icon: icon, clickable: false });
}

function myWindroseDrawCanvas(data, owm) {

	var canvas = document.getElementById('id_' + data.id);
	canvas.title = data.name;
	var angle = 0;
	var speed = 0;
	var gust = 0;
	if (typeof data.wind != 'undefined') {
		if (typeof data.wind.speed != 'undefined') {
			canvas.title += ', ' + data.wind.speed + ' m/s';
			canvas.title += ', ' + owm._windMsToBft(data.wind.speed) + ' BFT';
			speed = data.wind.speed;
		}
		if (typeof data.wind.deg != 'undefined') {
			canvas.title += ', ' + owm._directions[(data.wind.deg / 22.5).toFixed(0)];
			angle = data.wind.deg;
		}
		if (typeof data.wind.gust != 'undefined') {
			gust = data.wind.gust;
		}
	}
	if (canvas.getContext && speed > 0) {
		var red = 0;
		var green = 0;
		if (speed <= 10) {
			green = 10 * speed + 155;
			red = 255 * speed / 10.0;
		} else {
			red = 255;
			green = 255 - (255 * (Math.min(speed, 21) - 10) / 11.0);
		}
		var ctx = canvas.getContext('2d');
		ctx.translate(25, 25);
		ctx.rotate(angle * Math.PI / 180);
		ctx.fillStyle = 'rgb(' + Math.floor(red) + ',' + Math.floor(green) + ',' + 0 + ')';
		ctx.beginPath();
		ctx.moveTo(-15, -25);
		ctx.lineTo(0, -10);
		ctx.lineTo(15, -25);
		ctx.lineTo(0, 25);
		ctx.fill();

		if (gust > 0 && gust != speed) {
			if (gust <= 10) {
				green = 10 * gust + 155;
				red = 255 * gust / 10.0;
			} else {
				red = 255;
				green = 255 - (255 * (Math.min(gust, 21) - 10) / 11.0);
			}
			canvas.title += ', gust ' + data.wind.gust + ' m/s';
			canvas.title += ', ' + owm._windMsToBft(data.wind.gust) + ' BFT';
			ctx.fillStyle = 'rgb(' + Math.floor(red) + ',' + Math.floor(green) + ',' + 0 + ')';
			ctx.beginPath();
			ctx.moveTo(-15, -25);
			ctx.lineTo(0, -10);
			ctx.lineTo(0, 25);
			ctx.fill();
		}
	} else {
		canvas.innerHTML = '<div>'
			+ (typeof data.wind != 'undefined' && typeof data.wind.deg != 'undefined' ? data.wind.deg + '°' : '')
			+ '</div>';
	}
}

function windroseAdded(e) {
	for (var i in this._markers) {
		var m = this._markers[i];
		var cv = document.getElementById('id_' + m.options.owmId);
		for (var j in this._cache._cachedData.list) {
			var station = this._cache._cachedData.list[j];
			if (station.id == m.options.owmId) {
				myWindroseDrawCanvas(station, this);
			}
		}
	}
}

function toggleWheel(localLang) {
	if (map.scrollWheelZoom._enabled) {
		map.scrollWheelZoom.disable();
		document.getElementById('wheelimg').src = 'site/files/ScrollWheelDisabled20.png';
		document.getElementById('wheeltxt').innerHTML = getI18n('scrollwheel', localLang) + ' ' + getI18n('off', localLang);
	} else {
		map.scrollWheelZoom.enable();
		document.getElementById('wheelimg').src = 'site/files/ScrollWheel20.png';
		document.getElementById('wheeltxt').innerHTML = getI18n('scrollwheel', localLang) + ' ' + getI18n('on', localLang);
	}
}

function initMap() {

	var standard = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		maxZoom: 19,
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors</a>'
	});

	var topographic = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
		attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
	});

	var aqicn = L.tileLayer('https://tiles.waqi.info/tiles/usepa-aqi/{z}/{x}/{y}.png?token=_TOKEN_ID_', {
		attribution: 'Air  Quality  Tiles  &copy;  <a  href="http://waqi.info">waqi.info</a>'
	});

	var OWM_API_KEY = 'c64818b9da20a4abe316608ce03cdaa7';

	var clouds = L.OWM.clouds({ opacity: 0.8, legendImagePath: 'files/NT2.png', appId: OWM_API_KEY });
	var cloudscls = L.OWM.cloudsClassic({ opacity: 0.5, appId: OWM_API_KEY });
	var precipitation = L.OWM.precipitation({ opacity: 0.5, appId: OWM_API_KEY });
	var precipitationcls = L.OWM.precipitationClassic({ opacity: 0.5, appId: OWM_API_KEY });
	var rain = L.OWM.rain({ opacity: 0.5, appId: OWM_API_KEY });
	var raincls = L.OWM.rainClassic({ opacity: 0.5, appId: OWM_API_KEY });
	var snow = L.OWM.snow({ opacity: 0.5, appId: OWM_API_KEY });
	var pressure = L.OWM.pressure({ opacity: 0.4, appId: OWM_API_KEY });
	var pressurecntr = L.OWM.pressureContour({ opacity: 0.5, appId: OWM_API_KEY });
	var temp = L.OWM.temperature({ opacity: 0.5, appId: OWM_API_KEY });
	var wind = L.OWM.wind({ opacity: 0.5, appId: OWM_API_KEY });

	var localLang = getLocalLanguage();

	var city = L.OWM.current({
		intervall: 15, imageLoadingUrl: 'site/leaflet/owmloading.gif', lang: localLang, minZoom: 5,
		appId: OWM_API_KEY
	});
	var windrose = L.OWM.current({
		intervall: 15, imageLoadingUrl: 'site/leaflet/owmloading.gif', lang: localLang, minZoom: 4,
		appId: OWM_API_KEY, markerFunction: myWindroseMarker, popup: false, clusterSize: 50,
		imageLoadingBgUrl: 'https://openweathermap.org/img/w0/iwind.png'
	});
	windrose.on('owmlayeradd', windroseAdded, windrose); // Add an event listener to get informed when windrose layer is ready

	var useGeolocation = true;
	var zoom = 5;
	var lat = 37.09;
	var lon = -95.71;
	var urlParams = getUrlParameters();
	if (typeof urlParams.zoom != "undefined" && typeof urlParams.lat != "undefined" && typeof urlParams.lon != "undefined") {
		zoom = urlParams.zoom;
		lat = urlParams.lat;
		lon = urlParams.lon;
		useGeolocation = false;
	}

	map = L.map('map', {
		center: new L.LatLng(lat, lon), zoom: zoom,
		layers: [standard, aqicn]

	});
	map.attributionControl.setPrefix("");

	var baseMaps = {
		"Street View": standard,
		"Topographic View": topographic
	};

	var overlayMaps = { "Air Quality": aqicn, };

	overlayMaps[getI18n('clouds', localLang)] = clouds;
	// overlayMaps[getI18n('cloudscls', localLang)] = cloudscls;
	overlayMaps[getI18n('precipitation', localLang)] = precipitation;
	// overlayMaps[getI18n('precipitationcls', localLang)] = precipitationcls;
	overlayMaps[getI18n('rain', localLang)] = rain;
	// overlayMaps[getI18n('raincls', localLang)] = raincls;
	overlayMaps[getI18n('snow', localLang)] = snow;
	overlayMaps[getI18n('temp', localLang)] = temp;
	overlayMaps[getI18n('windspeed', localLang)] = wind;
	overlayMaps[getI18n('pressure', localLang)] = pressure;
	overlayMaps[getI18n('presscont', localLang)] = pressurecntr;
	overlayMaps[getI18n('city', localLang) + " (min Zoom 5)"] = city;
	overlayMaps[getI18n('windrose', localLang)] = windrose;

	var layerControl = L.control.layers(baseMaps, overlayMaps, { collapsed: false }).addTo(map);
	map.addControl(new L.Control.Permalink({ layers: layerControl, useAnchor: false, position: 'bottomright' }));

	var patch = L.DomUtil.create('div', 'owm-layercontrol-header');
	patch.innerHTML = getI18n('layers', localLang); // 'TileLayers';
	layerControl._form.children[2].parentNode.insertBefore(patch, layerControl._form.children[2]);
	patch = L.DomUtil.create('div', 'leaflet-control-layers-separator');
	layerControl._form.children[3].children[0].parentNode.insertBefore(patch, layerControl._form.children[3].children[layerControl._form.children[3].children.length - 2]);
	patch = L.DomUtil.create('div', 'owm-layercontrol-header');
	patch.innerHTML = getI18n('current', localLang); // 'Current Weather';
	layerControl._form.children[3].children[0].parentNode.insertBefore(patch, layerControl._form.children[3].children[layerControl._form.children[3].children.length - 2]);
	patch = L.DomUtil.create('div', 'owm-layercontrol-header');
	patch.innerHTML = getI18n('maps', localLang); // 'Maps';
	layerControl._form.children[0].parentNode.insertBefore(patch, layerControl._form.children[0]);

	patch = L.DomUtil.create('div', 'leaflet-control-layers-separator');
	layerControl._form.children[0].parentNode.insertBefore(patch, null);
	patch = L.DomUtil.create('div', 'owm-layercontrol-header');
	patch.innerHTML = getI18n('prefs', localLang); // 'Preferences';
	layerControl._form.children[0].parentNode.insertBefore(patch, null);
	patch = L.DomUtil.create('div', '');
	patch.innerHTML = '<div id="wheeldiv" onClick="toggleWheel(\'' + localLang + '\')"><img id="wheelimg" src="site/files/ScrollWheel20.png" align="middle" > <span id="wheeltxt">' + getI18n('scrollwheel', localLang) + ' ' + getI18n('on', localLang) + '</span></div>';
	layerControl._form.children[0].parentNode.insertBefore(patch, null);

	if (useGeolocation && typeof navigator.geolocation != "undefined") {
		navigator.geolocation.getCurrentPosition(foundLocation);
	}

	var aqiurl = 'https://www.airnowapi.org/';
	var aqi_current_url = 'aq/observation/latLong/current/?format=application/json';
	var aqidist = '&distance=100';
	var aqi_key = '&API_KEY=C039AA9D-04F5-4025-8A80-7C5C6792AA34';

	var weatherbaseurl = 'https://api.openweathermap.org/data/2.5/weather'
	var owm_url_key = '&appid=' + OWM_API_KEY

	map.on('click', function (e) {
		var latlng = e.latlng;
		console.log(latlng)

		var latclick = latlng.lat;
		var lonclick = latlng.lng;

		var aqilat = '&latitude=' + latclick;
		var aqilong = '&longitude=' + lonclick;
		var weathlat = '?lat=' + latclick;
		var weatherlong = '&lon=' + lonclick;

		var aqiapiurl = aqiurl + aqi_current_url + aqilat + aqilong + aqidist + aqi_key;
		var weatherurl = weatherbaseurl + weathlat + weatherlong + owm_url_key;

		d3.json(aqiapiurl).then(function (response) {

			console.log(response);
			aqiarray.unshift(response[0].AQI);
			cityarray.unshift(response[0].ReportingArea);
			statearray.unshift(response[0].StateCode);

			let aqitop5 = response[0,5].AQI

			chart.updateSeries([{
				name: "Air Quality Index",
				data: aqiarray
			}]);

			

			console.log(aqizero)

		});





		d3.json(weatherurl).then(function (response) {

			console.log(response);

		});

		latarray.unshift(latclick);
		lonarray.unshift(lonclick);

	});

}

const icon = `https://openweathermap.org/img/wn/${weather[0]["icon"]
	}@2x.png`;

