// Symbols

define([], function () {
    return {
        crosshairLineSymbol: function () {
            return {
                type: 'simple-line',
                color: [226, 226, 226],
                width: 1
            }
        },

        crosshairSquareSymbol: function () {
            return {
                type: 'simple-fill',
                color: [150, 150, 255, 0.2],
                outline: {
                    color: [226, 226, 226],
                    width: 1
                }
            }
        },

        crosshairCornerPointsSymbol: function () {
            return {
                style: 'square',
                size: 6,
                type: 'simple-marker',
                color: [255, 255, 255],
                outline: {
                    color: [255, 255, 255],
                    width: 0
                }
            };
        }
    };
})