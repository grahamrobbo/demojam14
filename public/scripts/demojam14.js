var locationModel = new sap.ui.model.json.JSONModel().attachEvent(
  "requestCompleted",
  null,
  onLocationModelLoaded
);

var lastCoords = null;

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
            label: '{name}'
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

  new sap.m.Dialog({
    title: 'Surf Analytics - ' + oEvent.getSource().getLabel(),
    class: "sapUiPopupWithPadding",
    stretch: false,
    content: [
      new sap.m.IconTabBar({
        items: [
          new sap.m.IconTabFilter({
            text: 'Spot Info',
            icon: 'sap-icon://tag-cloud-chart',
            content: [
              new sap.m.Image({
                src: "/img/15_1Laird_Hamilton_.jpg",
                width: "900px"
              })
            ]
          }),
          new sap.m.IconTabFilter({
            text: 'Swell View',
            icon: 'sap-icon://picture',
            content: [
              new sap.m.Image({
                src: "/img/Sunset_Surfer.jpg",
                width: "900px"
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
        oEvent.getSource().getParent().close();
        oEvent.getSource().getParent().destroy();
      }
    })
  }).open();
}