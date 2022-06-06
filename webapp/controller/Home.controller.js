sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	'sap/ui/core/Fragment',
	"sap/ui/model/Sorter",
	'sap/m/Token',
	'sap/m/SearchField',
	'sap/ui/model/type/String',
	'sap/ui/core/HTML'
], function (Controller) {
	"use strict";

	return Controller.extend("sap.ui.demo.basicTemplate.controller.Home", {

		onInit: function () {
			this.defaultSettings()
			this.getStation();
			
		},

		getModel: function (sName) {
			return this.getView().getModel(sName) || this.getOwnerComponent().getModel(sName);
		},

		setModel: function (oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		defaultSettings: function () {
			var oModel = this.getModel("Table");
			var iconPlay = "https://img.icons8.com/ios-glyphs/344/play--v2.png"
			oModel.setProperty("/bitrate", "stream_64");
			oModel.setProperty("/volume", "100");
			oModel.setProperty("/statusAudio", false);
			oModel.setProperty("/checkStartRadio", false);
			oModel.setProperty("/statusAudioImg", iconPlay);
		},

		getStation: function () {
			var oModel = this.getModel("Table");
			fetch('http://62.3.58.53:5000/radio').then((response) => {
				return response.json();
			}).then((data) => {
				oModel.setProperty("/radio", data.result.stations);
			})
			setInterval(this.getTrack.bind(this), 7000);
		},

		getTrack: function () {
			var oGetTrack = []
			fetch('http://62.3.58.53:5000/track').then((response) => {
				return response.json();
			}).then((data) => {
				var oModel = this.getModel("Table");
				oModel.setProperty("/now", data.result);
				var oStation = oModel.getProperty("/radio");
				var oTrack = oModel.getProperty("/now");
				oStation.forEach(element => {
					var oId = element.id;
					let oArtist = oTrack.find(track => track.id === oId).track.artist;
					let oSong = oTrack.find(track => track.id === oId).track.song;
					element.artist = oArtist;
					element.song = oSong;
					oGetTrack.push(element);
				});
				oModel.setProperty("/radio", oGetTrack);
				this.updatePlayer();
			})
		},

		visualePlayer: function () {
			var oModel = this.getModel("Table");
			var sBitrate = oModel.getProperty("/bitrate");
			var colorBitrate = this.getView().byId(sBitrate)
			if (this._prevSelectBitrate) {
				this._prevSelectBitrate.$().css('color', '');
			}
			colorBitrate.$().css('color', 'rgba(255, 255, 255, 0.993)');
			this._prevSelectBitrate = colorBitrate;
			var startvisible = this.getView().byId("start");
			startvisible.removeStyleClass('startvisible')
			startvisible.addStyleClass('startvisible')
		},

		playerControl: function (id, status) {
			var oMyDropDown = this.getView().byId("iconplay");
			var bPause = "https://img.icons8.com/ios-glyphs/344/pause--v1.png";
			var bPlay = "https://img.icons8.com/ios-glyphs/344/play--v2.png";
			var oModel = this.getModel("Table");
			oModel.setProperty("/playid", id);
			var sBitrate = oModel.getProperty("/bitrate");
			var oPlayer = this.getView().getDomRef("-audioplayer");
			var dataRadio = oModel.getProperty("/radio");
			if (status === true) {
				this.visualePlayer()
				dataRadio.forEach(element => {
					var sId = element.id;
					var oStream = element[sBitrate];
					if (sId === id) {
						oMyDropDown.removeStyleClass('play')
						oMyDropDown.addStyleClass('pause')
						oPlayer.src = oStream;
						oPlayer.play();
						this.updatePlayer();
						oModel.setProperty("/statusAudioImg", bPause);
						oModel.setProperty("/statusAudio", true);
					}
				});
			} else {
				this.visualePlayer()
				oMyDropDown.removeStyleClass('pause')
				oMyDropDown.addStyleClass('play')
				this.updatePlayer();
				oPlayer.pause();
				oModel.setProperty("/statusAudioImg", bPlay);
				oModel.setProperty("/statusAudio", false);
			}
		},

		updatePlayer: function () {
			var oModel = this.getModel("Table");
			var oIdSearch = oModel.getProperty("/playid");
			var dataRadio = oModel.getProperty("/radio");
			dataRadio.forEach(element => {
				var sId = element.id;
				if (sId === oIdSearch) {
					oModel.setProperty("/player", element);
				}
			});
		},

		playItem: function (oEvent) {
			var oModel = this.getModel("Table");
			var oContext = oEvent.getSource().getBindingContext("Table");
			var oId = oContext.getObject("id");
			var checkId = oModel.getProperty("/playid");
			if (oId != checkId) {
				oModel.setProperty("/playid", oId);
				this.updatePlayer();
				this.playerControl(oId, true);
				if (this._prevSelect) {
					this._prevSelect.$().css('background-color', '');
				}
				var item = oEvent.getSource();
				item.$().css('background-color', '#d9d9d9');
				this._prevSelect = item;
				oModel.setProperty("/checkStartRadio", true);
			}
		},

		playerButton: function () {
			var oModel = this.getModel("Table");
			var oCheckStart = oModel.getProperty("/checkStartRadio");
			var oStatusAudio = oModel.getProperty("/statusAudio");
			if (oCheckStart === false) {
				var oStation = oModel.getProperty("/radio");
				var oId = oStation[0]["id"];
				this.playerControl(oId, true);
				oModel.setProperty("/checkStartRadio", true);
			} else {
				if (oStatusAudio === false) {
					var oId = oModel.getProperty("/playid");
					this.playerControl(oId, true);
				} else {
					var oId = oModel.getProperty("/playid");
					this.playerControl(oId, false);
				}
			}
		},

		setVolume: function (evt) {
			var oModel = this.getModel("Table");
			var oPlayer = this.getView().getDomRef("-audioplayer");
			var value = evt.getSource().getValue();
			oModel.setProperty("/volume", value)
			oPlayer.volume = value / 100;
		},

		stream64: function () {
			var oModel = this.getModel("Table");
			oModel.setProperty("/bitrate", "stream_64");
			var oId = oModel.getProperty("/playid");
			this.playerControl(oId, true);
		},

		stream128: function () {
			var oModel = this.getModel("Table");
			oModel.setProperty("/bitrate", "stream_128");
			var oId = oModel.getProperty("/playid");
			this.playerControl(oId, true);
		},

		stream320: function () {
			var oModel = this.getModel("Table");
			oModel.setProperty("/bitrate", "stream_320");
			var oId = oModel.getProperty("/playid");
			this.playerControl(oId, true);
		}
	});
});