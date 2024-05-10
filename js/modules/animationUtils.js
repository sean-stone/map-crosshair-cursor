
define([
    'esri/Graphic',
    './js/modules/symbols.js'
], function (
    Graphic,
    mySymbols
) {
    let viewExtent;
    let areaExtent;
    let config;
    let animateLines;
    let currentFrame = 0;
    let endAnimation = 40;
    let stopAnimation = false;

    function frame() {
        animateLinesFunc(currentFrame);
        if (currentFrame > endAnimation) {
            return
        }
        currentFrame++;
        requestAnimationFrame(frame);
    }

    function animateVert(startPosition, endPosition) {
        let animatedVertex;

        if (startPosition < endPosition) {
            animatedVertex = startPosition + (((Math.abs(startPosition - endPosition)) / endAnimation) * currentFrame);
        } else {
            animatedVertex = startPosition - (((Math.abs(startPosition - endPosition)) / endAnimation) * currentFrame);
        }

        return animatedVertex
    }

    function animateLinesFunc() {
        if (stopAnimation) {
            return
        }

        const maxValue = 20000000;
        const minValue = -20000000;

        const leftAnimatedVert = animateVert(viewExtent.xmin, areaExtent.xmin);
        const rightAnimatedVert = animateVert(viewExtent.xmax, areaExtent.xmax);
        const upAnimatedVert = animateVert(viewExtent.ymax, areaExtent.ymax);
        const downAnimatedVert = animateVert(viewExtent.ymin, areaExtent.ymin);

        let leftGraphic = new Graphic({
            geometry: {
                type: 'polyline', // autocasts as new Polyline()
                spatialReference: config.SpatialReference
            },
            symbol: mySymbols.crosshairLineSymbol()
        });

        let rightGraphic = new Graphic({
            geometry: {
                type: 'polyline', // autocasts as new Polyline()
                spatialReference: config.SpatialReference
            },
            symbol: mySymbols.crosshairLineSymbol()
        });

        let upGraphic = new Graphic({
            geometry: {
                type: 'polyline', // autocasts as new Polyline()
                spatialReference: config.SpatialReference
            },
            symbol: mySymbols.crosshairLineSymbol()
        });

        let downGraphic = new Graphic({
            geometry: {
                type: 'polyline', // autocasts as new Polyline()
                spatialReference: config.SpatialReference
            },
            symbol: mySymbols.crosshairLineSymbol()
        });

        // down
        if (downAnimatedVert < areaExtent.ymin) {
            downGraphic.geometry.paths = [[(areaExtent.xmin + areaExtent.width / 2), downAnimatedVert], [(areaExtent.xmin + areaExtent.width / 2), viewExtent.ymin]];
        } else {
            downGraphic.geometry.paths = [[(areaExtent.xmin + areaExtent.width / 2), areaExtent.ymin], [(areaExtent.xmin + areaExtent.width / 2), minValue]];
        }

        // up
        if (upAnimatedVert > areaExtent.ymax) {
            upGraphic.geometry.paths = [[(areaExtent.xmin + areaExtent.width / 2), upAnimatedVert], [(areaExtent.xmin + areaExtent.width / 2), viewExtent.ymax]];
        } else {
            upGraphic.geometry.paths = [[(areaExtent.xmin + areaExtent.width / 2), areaExtent.ymax], [(areaExtent.xmin + areaExtent.width / 2), maxValue]];
        }

        // right
        if (rightAnimatedVert > areaExtent.xmax) {
            rightGraphic.geometry.paths = [[rightAnimatedVert, (areaExtent.ymin + areaExtent.height / 2)], [viewExtent.xmax, (areaExtent.ymin + areaExtent.height / 2)]];
        } else {
            rightGraphic.geometry.paths = [[areaExtent.xmax, (areaExtent.ymin + areaExtent.height / 2)], [maxValue, (areaExtent.ymin + areaExtent.height / 2)]];
        }

        // left
        if (leftAnimatedVert <= areaExtent.xmin) {
            leftGraphic.geometry.paths = [[leftAnimatedVert, (areaExtent.ymin + areaExtent.height / 2)], [viewExtent.xmin, (areaExtent.ymin + areaExtent.height / 2)]];
        } else {
            leftGraphic.geometry.paths = [[areaExtent.xmin, (areaExtent.ymin + areaExtent.height / 2)], [minValue, (areaExtent.ymin + areaExtent.height / 2)]];
        }

        animateLines.graphics.removeAll();
        animateLines.graphics.addMany([leftGraphic, rightGraphic, upGraphic, downGraphic]);
    }

    return {
        startAnimation: function (extent, vExtent, configInfo, animateLinesGraphicsLayer) {
            stopAnimation = false;
            animateLines = animateLinesGraphicsLayer;
            areaExtent = extent;
            viewExtent = vExtent;
            config = configInfo;
            currentFrame = 0;
            requestAnimationFrame(frame);
        },
        stopAnimation: function () {
            stopAnimation = true;
        }
    };
})