var locationModel = new sap.ui.model.json.JSONModel().attachEvent(
  "requestCompleted",
  null,
  onLocationModelLoaded
);

var spotModel = new sap.ui.model.json.JSONModel().attachEvent(
  "requestCompleted",
  null,
  onSpotModelLoaded
);

var lastCoords = null;

var chartMap = [];

var spotDialog = new sap.m.Dialog({
  class: "sapUiPopupWithPadding",
  stretch: false,
  content: [
    new sap.m.IconTabBar('iconTabBar', {
      items: [
        new sap.m.IconTabFilter('aboutSpot', {
          key: 'spotInfo',
          text: 'Spot Info',
          icon: 'sap-icon://tag-cloud-chart',
          content: [
            new sap.ui.layout.Grid({
              defaultSpan: "L12 M12 S12",
              content: [
                new sap.ui.layout.form.SimpleForm({
                  minWidth: 1024,
                  maxContainerCols: 2,
                  editable: false,
                  layout: "ResponsiveGridLayout",
                  // title: "Current Conditions",
                  title: new sap.ui.core.Title({
                    level: 'H3',
                    text: "Latest conditions at {path:'/0/localTimestamp',formatter:'tstampToDate'}",
                    icon: 'http://cdnimages.magicseaweed.com/30x30/{/0/condition/weather}.png'
                  }),
                  labelSpanL: 4,
                  labelSpanM: 4,
                  emptySpanL: 1,
                  emptySpanM: 1,
                  columnsL: 2,
                  columnsM: 1,
                  content: [
                    new sap.m.Label({
                      text: "{/0/swell/minBreakingHeight}-{/0/swell/maxBreakingHeight} ft"
                    }).addStyleClass('sapUI5text'),
                    new sap.m.RatingIndicator({
                      maxValue: "{parts:[{path:'/0/solidRating'},{path:'/0/fadedRating'}],formatter:'calcMaxValue'}",
                      value: "{/0/solidRating}"
                    }),
                    new sap.m.Label({
                      text: "Wind"
                    }).addStyleClass('sapUI5text'),
                    new sap.m.Text({
                      text: "{/0/wind/speed} {/0/wind/unit}"
                    }).addStyleClass('sapUI5text'),
                    new sap.m.Label({
                      text: "Primary Swell"
                    }).addStyleClass('sapUI5text'),
                    new sap.m.Text({
                      text: "{/0/swell/components/primary/height} ft at {/0/swell/components/primary/period}s from {/0/swell/components/primary/compassDirection}"
                    }).addStyleClass('sapUI5text'),
                    new sap.m.Label({
                      text: "Secondary Swell"
                    }).addStyleClass('sapUI5text'),
                    new sap.m.Text({
                      text: "{/0/swell/components/secondary/height} ft at {/0/swell/components/secondary/period}s from {/0/swell/components/secondary/compassDirection}"
                    }).addStyleClass('sapUI5text'),
                    new sap.m.Label({
                      text: "Wind Swell"
                    }).addStyleClass('sapUI5text'),
                    new sap.m.Text({
                      text: "{/0/swell/components/tertiary/height} ft at {/0/swell/components/tertiary/period}s from {/0/swell/components/tertiary/compassDirection}",
                      visible: "{path:'/0/swell/components',formatter: 'tertiaryAvailable'}"
                    }).addStyleClass('sapUI5text'),
                    new sap.m.Label({
                      text: "Air Temp"
                    }).addStyleClass('sapUI5text'),
                    new sap.m.Text({
                      text: "{/0/condition/temperature} °f"
                    }).addStyleClass('sapUI5text'),
                  ]
                })
              ]
            })
          ]
        }),
        new sap.m.IconTabFilter({
          text: 'Swell Chart',
          icon: 'sap-icon://globe',
          content: [
            new sap.m.VBox({
              items: [
                new sap.m.Image('swellMap', {
                  src: "/img/surf-wallpaper1.jpg",
                  width: "900px"
                }),
                new sap.m.Label('swellTime', {
                  text: "{path:'localTimestamp',formatter:'tstampToDate'}"
                })
              ]
            })
          ]
        }),
        new sap.m.IconTabFilter({
          text: 'Period Chart',
          icon: 'sap-icon://globe',
          content: [
            new sap.m.VBox({
              items: [
                new sap.m.Image('periodMap', {
                  src: "/img/surf-wallpaper1.jpg",
                  width: "900px"
                }),
                new sap.m.Label('periodTime', {
                  text: "{path:'localTimestamp',formatter:'tstampToDate'}"
                })
              ]
            })
          ]
        }),
        new sap.m.IconTabFilter({
          text: 'Wind Chart',
          icon: 'sap-icon://globe',
          content: [
            new sap.m.VBox({
              items: [
                new sap.m.Image('windMap', {
                  src: "/img/surf-wallpaper1.jpg",
                  width: "900px"
                }),
                new sap.m.Label('windTime', {
                  text: "{path:'localTimestamp',formatter:'tstampToDate'}"
                })
              ]
            })
          ]
        }),
        new sap.m.IconTabFilter({
          text: 'Pressure Chart',
          icon: 'sap-icon://globe',
          content: [
            new sap.m.VBox({
              items: [
                new sap.m.Image('pressureMap', {
                  src: "/img/surf-wallpaper1.jpg",
                  width: "900px"
                }),
                new sap.m.Label('pressureTime', {
                  text: "{path:'localTimestamp',formatter:'tstampToDate'}"
                })
              ]
            })
          ]
        }),
        new sap.m.IconTabFilter({
          text: 'Social Feed',
          icon: 'sap-icon://feed',
          content: [
            new sap.m.Image({
              src: "/img/surf-wallpaper1.jpg",
              width: "900px"
            })
          ]

        }),
        new sap.m.IconTabFilter({
          text: 'Another Test',
          icon: 'sap-icon://favorite',
          content: [
            new sap.m.Image({
              src: "/img/surfer-chick.jpg",
              width: "900px"
            })
          ]
        })
      ]
    })
  ],
  beginButton: new sap.m.Button({
    text: 'Close',
    press: function (oEvent) {
      sap.ui.getCore().byId('iconTabBar').setSelectedKey('spotInfo').setExpanded(true);
      oEvent.getSource().getParent().close();
    }
  })
}).setModel(spotModel);

function getNearestSurfLocations(coords) {
  console.log('getLoc');
  if (coords === lastCoords) return;
  lastCoords = coords;
  locationModel.loadData('/data/surf/locations.json?x=' + coords[0] + '&y=' + coords[1]);
}

function onLocationModelLoaded(event) {
  new sap.m.Dialog({
    title: 'Surf Analytics - nearest spots',
    stretch: false,
    content: [
      new sap.m.List({
        items: {
          path: '/locations',
          template: new sap.m.DisplayListItem({
            type: "Navigation",
            press: onLocationPress,
            label: '{name}',
          }).data({
            'spotId': '{spotId}'
          })
        }
      })
    ],
    beginButton: new sap.m.Button({
      text: 'Close',
      press: function (oEvent) {
        oEvent.getSource().getParent().close();
        oEvent.getSource().getParent().destroy();
      }
    })
  }).setModel(locationModel).open();
}

function onLocationPress(oEvent) {

  spotModel.loadData('http://magicseaweed.com/api/g4954BBp237aO6FRC490k7FjxBQzwRxO/forecast/t/?units=us&spot_id=' + oEvent.getSource().data().spotId);

  spotDialog.setTitle('Surf Analytics - ' + oEvent.getSource().getLabel()).open();

  //loadAboutSpot(oEvent.getSource().data().spotId);

}

function loadAboutSpot(spot) {
  var oText = new sap.m.Text();

  switch (spot) {
  case '998':
    oText.setText('North Narrabeen');
    break;
  default:
    oText.setText('Spot ' + spot); {

    }

    sap.ui.getCore().byId('aboutSpot').removeAllContent();
    sap.ui.getCore().byId('aboutSpot').addContent(oText);
  }
}

function onSpotModelLoaded(oEvent) {
  chartMap = [];
}

function rotateImages() {
  var swellMap = sap.ui.getCore().byId('swellMap');
  var periodMap = sap.ui.getCore().byId('periodMap');
  var windMap = sap.ui.getCore().byId('windMap');
  var pressureMap = sap.ui.getCore().byId('pressureMap');
  var swellTime = sap.ui.getCore().byId('swellTime');
  var periodTime = sap.ui.getCore().byId('periodTime');
  var windTime = sap.ui.getCore().byId('windTime');
  var pressureTime = sap.ui.getCore().byId('pressureTime');

  if (spotModel.getData().length != chartMap.length) {
    chartMap = [];
    for (var i = 0; i < spotModel.getData().length; i++) {
      chartMap.push({
        active: true,
        localTimestamp: spotModel.getData()[i].localTimestamp,
        charts: spotModel.getData()[i].charts
      });
      loadCharts(spotModel.getData()[i].charts);
    }
  }

  if (chartMap.length > 0) {
    for (var j = 0; j < chartMap.length; j++) {
      if (chartMap[j].active) {
        if (chartMap[j + 1]) {
          if (swellMap) swellMap.setSrc(chartMap[j + 1].charts.swell);
          if (periodMap) periodMap.setSrc(chartMap[j + 1].charts.period);
          if (windMap) windMap.setSrc(chartMap[j + 1].charts.wind);
          if (pressureMap) pressureMap.setSrc(chartMap[j + 1].charts.pressure);
          if (swellTime) swellTime.setText(tstampToDate(chartMap[j + 1].localTimestamp));
          if (periodTime) periodTime.setText(tstampToDate(chartMap[j + 1].localTimestamp));
          if (windTime) windTime.setText(tstampToDate(chartMap[j + 1].localTimestamp));
          if (pressureTime) pressureTime.setText(tstampToDate(chartMap[j + 1].localTimestamp));

          chartMap[j + 1].active = true;
        } else {
          if (swellMap) swellMap.setSrc(chartMap[0].charts.swell);
          if (periodMap) periodMap.setSrc(chartMap[0].charts.period);
          if (windMap) windMap.setSrc(chartMap[0].charts.wind);
          if (pressureMap) pressureMap.setSrc(chartMap[0].charts.pressure);
          chartMap[0].active = true;
        }
        chartMap[j].active = false;
        return;
      }
    }
  } else {
    if (swellMap) swellMap.setSrc('/img/surfer - chick.jpg');
    if (periodMap) periodMap.setSrc('/img/surfer - chick.jpg');
    if (windMap) windMap.setSrc('/img/surfer - chick.jpg');
    if (pressureMap) pressureMap.setSrc('/img/surfer - chick.jpg');
  }
}

function loadCharts(charts) {
  $.get(charts.swell);
  $.get(charts.period);
  $.get(charts.wind);
  $.get(charts.pressure);
}

function tstampToDate(tstamp) {
  var oDate = new Date(tstamp * 1000);
  return oDate.toLocaleDateString() + ' ' + oDate.toLocaleTimeString();
}

function calcMaxValue(solid,faded) {
  if(!solid) return;
  if(!faded) return;
  return solid+faded;
}

function tertiaryAvailable(readings) {
  if(!readings) return;
  return readings.tertiary ? true : false;
}

function swellImg(img) {
  if (!img) return;
  return '<img src="' + img + '" class="swellImg" style="width:900px;display:none">';
}

setInterval(rotateImages, 200);