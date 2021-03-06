var map;
var currArt;
      require([
        "dojo/parser",
        "dojo/ready",
        "dojo/_base/array",
        "esri/Color",
        "dojo/dom-style",
        "dojo/query",

        "esri/map", 
        "esri/request",
        "esri/graphic",
        "esri/geometry/Extent",

        "esri/symbols/SimpleMarkerSymbol",
        "esri/symbols/SimpleFillSymbol",
        "esri/symbols/PictureMarkerSymbol",
        "esri/renderers/ClassBreaksRenderer",

        "esri/layers/GraphicsLayer",
        "esri/SpatialReference",
        "esri/dijit/PopupTemplate",
        "esri/geometry/Point",
        "esri/geometry/webMercatorUtils",

        "extras/ClusterLayer",

        "dijit/layout/BorderContainer", 
        "dijit/layout/ContentPane", 
        "dojo/domReady!"
      ], function(
        parser, ready, arrayUtils, Color, domStyle, query,
        Map, esriRequest, Graphic, Extent,
        SimpleMarkerSymbol, SimpleFillSymbol, PictureMarkerSymbol, ClassBreaksRenderer,
        GraphicsLayer, SpatialReference, PopupTemplate, Point, webMercatorUtils,
        ClusterLayer
      ) {
        ready(function() {
          parser.parse();

          var clusterLayer;
          var popupOptions = {
            "markerSymbol": new SimpleMarkerSymbol("circle", 20, null, new Color([0, 0, 0, 0.25])),
            "marginLeft": "20",
            "marginTop": "20"
          };
          map = new Map("map", {
            basemap: "streets",
            center: [-118.191405, 34.041123],
            zoom: 13
          });

          map.on("load", function() {
            // hide the popup's ZoomTo link as it doesn't make sense for cluster features
            domStyle.set(query("a.action.zoomTo")[0], "display", "none");

            // get the latest 1000 murals
            var photos = esriRequest({
              "url": "data/1000-murals.json",
              "handleAs": "json"
            });
            photos.then(addClusters, error);
          });

          function addClusters(resp) {
            var photoInfo = {};
            var wgs = new SpatialReference({
              "wkid": 4326
            });
            photoInfo.data = arrayUtils.map(resp, function(p) {
              var latlng = new  Point(parseFloat(p.lng), parseFloat(p.lat), wgs);
              var webMercator = webMercatorUtils.geographicToWebMercator(latlng);
              var attributes = {
                "Description": p.description,
                "Name": p.name,
                "Images": p.image,
                "Image": p.image[0],
                "Link": p.image[0],
                "Comments": p.comments,
                "street": p.street,
                "city": p.city,
                "zip": p.zip,
                "owner": p.owner
              };
              return {
                "x": webMercator.x,
                "y": webMercator.y,
                "attributes": attributes
              };
            });

            // popupTemplate to work with attributes specific to this dataset
            var popupTemplate = PopupTemplate({
              "title": "",
              "fieldInfos": [{
                "fieldName": "Name",
                "label": "Name",
                visible: true
              }, {
                "fieldName": "Description",
                visible: true
              }],
              "mediaInfos": [{
                "title": "",
                "caption": "",
                "type": "image",
                "value": {
                  "sourceURL": "{Image}",
                  "linkURL": "{Link}"
                }
              }]
            });

            // cluster layer that uses OpenLayers style clustering
            clusterLayer = new ClusterLayer({
              "data": photoInfo.data,
              "distance": 100,
              "id": "clusters",
              "labelColor": "#fff",
              "labelOffset": 10,
              "resolution": map.extent.getWidth() / map.width,
              "singleColor": "#888",
              "singleTemplate": popupTemplate
            });
            var defaultSym = new SimpleMarkerSymbol().setSize(4);
            var renderer = new ClassBreaksRenderer(defaultSym, "clusterCount");

            var picBaseUrl = "http://static.arcgis.com/images/Symbols/Shapes/";
            var blue = new PictureMarkerSymbol("/images/paint.ico", 32, 32).setOffset(0, 15);
            var green = new PictureMarkerSymbol(picBaseUrl + "GreenPin1LargeB.png", 64, 64).setOffset(0, 15);
            var red = new PictureMarkerSymbol(picBaseUrl + "RedPin1LargeB.png", 72, 72).setOffset(0, 15);
            renderer.addBreak(0, 2, blue);
            renderer.addBreak(2, 200, green);
            renderer.addBreak(200, 1001, red);

            clusterLayer.setRenderer(renderer);
            map.addLayer(clusterLayer);

            // close the info window when the map is clicked
            map.on("click", cleanUp);
            // close the info window when esc is pressed
            map.on("key-down", function(e) {
              if (e.keyCode === 27) {
                cleanUp();
              }
            });
            clusterLayer.on("click", function(evt) {
              console.log(evt);
            });
            clusterLayer.on("selection-complete", function(evt){
              alert("test");
              console.log(evt.features);
            });
          }

          function cleanUp() {
            map.infoWindow.hide();
            clusterLayer.clearSingles();
          }

          function error(err) {
            console.log("something failed: ", err);
          }

          // show cluster extents...
          // never called directly but useful from the console 
          window.showExtents = function() {
            var extents = map.getLayer("clusterExtents");
            if ( extents ) {
              map.removeLayer(extents);
            }
            extents = new GraphicsLayer({ id: "clusterExtents" });
            var sym = new SimpleFillSymbol().setColor(new Color([205, 193, 197, 0.5]));

            arrayUtils.forEach(clusterLayer._clusters, function(c, idx) {
              var e = c.attributes.extent;
              extents.add(new Graphic(new Extent(e[0], e[1], e[2], e[3], map.spatialReference), sym));
            }, this);
            map.addLayer(extents, 0);
          }
        });
      });