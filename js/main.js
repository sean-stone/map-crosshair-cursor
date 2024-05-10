require([
    'esri/layers/FeatureLayer',
    'esri/layers/GraphicsLayer',
    'esri/Map',
    'esri/views/MapView',
    'esri/geometry/geometryEngine',
    'esri/Graphic',
    'dojo/json',

    // Custom modules
    './js/modules/symbols.js',
    './js/modules/animationUtils.js',

    // Configs
    'dojo/text!./config.json'
], (
    FeatureLayer,
    GraphicsLayer,
    Map,
    MapView,
    geometryEngine,
    Graphic,
    JSON,

    mySymbols,
    animationUtils,

    configData
) => {
    const config = JSON.parse(configData);

    let animateLines = new GraphicsLayer();
    let crosshairGraphic = new GraphicsLayer();

    const photosLayer = new FeatureLayer({
        url: config.FeatureLayerURL,
        outFields: config.FeatureLayerOutfields
    });

    const map = new Map({
        basemap: config.Basemap,
        layers: [animateLines, crosshairGraphic, photosLayer]
    });

    const view = new MapView({
        container: 'viewDiv',
        map: map,
        center: config.view.center,
        zoom: config.view.zoom
    });

    function addVerticesOfPolygon(geometry) {
        const bottomLeft = new Graphic({
            geometry: {
                type: 'point',
                x: geometry.xmin,
                y: geometry.ymin,
                spatialReference: config.SpatialReference
            },
            symbol: mySymbols.crosshairCornerPointsSymbol()
        });

        const topLeft = new Graphic({
            geometry: {
                type: 'point',
                x: geometry.xmin,
                y: geometry.ymax,
                spatialReference: config.SpatialReference
            },
            symbol: mySymbols.crosshairCornerPointsSymbol()
        });

        const topRight = new Graphic({
            geometry: {
                type: 'point',
                x: geometry.xmax,
                y: geometry.ymax,
                spatialReference: config.SpatialReference
            },
            symbol: mySymbols.crosshairCornerPointsSymbol()
        });

        const bottomRight = new Graphic({
            geometry: {
                type: 'point',
                x: geometry.xmax,
                y: geometry.ymin,
                spatialReference: config.SpatialReference
            },
            symbol: mySymbols.crosshairCornerPointsSymbol()
        });

        crosshairGraphic.graphics.addMany([bottomLeft, topLeft, topRight, bottomRight]);
    }

    function generateCrosshair(geometry, objectid) {
        // Fail fast
        if (crosshairGraphic.graphics.length !== 0 && crosshairGraphic.graphics.items[0].attributes.objectid === objectid) {
            return
        }

        const screenHeight = view.height;
        const scale = view.scale;
        const percentage = 10;
        const height = (scale / screenHeight) * percentage;
        const extentGeom = geometryEngine.buffer(geometry, height).extent;
        view.cursor = 'pointer';

        // Add the geometry and symbol to a new graphic
        const polygonGraphic = new Graphic({
            geometry: extentGeom,
            symbol: mySymbols.crosshairSquareSymbol(),
            attributes: {
                'objectid': objectid
            }
        });

        crosshairGraphic.graphics.removeAll();
        crosshairGraphic.graphics.addMany([polygonGraphic])
        addVerticesOfPolygon(extentGeom);
        animationUtils.startAnimation(extentGeom, view.extent, config, animateLines);
    }

    photosLayer.when().then(() => {
        view.on('pointer-move', eventHandler);
        view.on('pointer-down', eventHandler);

        function eventHandler(event) {
            // only include graphics from photosLayer in the hitTest
            const opts = {
                include: photosLayer
            }

            view.hitTest(event, opts).then(getGraphics);
        }

        function getGraphics(response) {
            if (response.results.length) {
                generateCrosshair(response.results[0].graphic.geometry, response.results[0].graphic.attributes.OBJECTID);
            } else {
                // clear graphics layer
                view.cursor = 'auto';
                crosshairGraphic.graphics.removeAll();
                animateLines.graphics.removeAll();
                animationUtils.stopAnimation()
            }
        }
    });
});
