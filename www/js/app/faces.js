define(['app/facer'],
    function faces(facer) {


        var svgLineSet = { name: "svgLineSet", parts: [] };
        for (var i = 0; i < 20; i++) {
            svgLineSet.parts.push({
                id: i,
                output: true,
                resolve: function(sha1) {
                    return '<line id="svg_1" y2="540" x2="320" y1="100" x1="320" stroke-width="5" stroke="#000000" fill="none" transform="rotate(' + (360 * (256 / sha1[this.id])) + ' 320,320) "/>';

                }
            });
        }

        var colouredSvgLineSet = { name: "colouredSvgLineSet", parts: [] };
        for (var i = 0; i < 20; i++) {
            colouredSvgLineSet.parts.push({
                id: i,
                output: false,
                resolve: function(sha1) {
                    return sha1[this.id];
                }
            });
        }
        for (var i = 0; i < 20; i += 4) {
            colouredSvgLineSet.parts.push({
                id: i,
                output: true,
                resolve: function(sha1) {
                    var colour = "rgb(" + sha1[this.id + 1] + ", " + sha1[this.id + 2] + ", " + sha1[this.id + 3] + ")";
                    return '<line id="svg_1" y2="540" x2="320" y1="100" x1="320" stroke-width="5" stroke="' + colour + '" fill="none" transform="rotate(' + (360 * (256 / sha1[this.id])) + ' 320,320) "/>';

                }
            });
        }
        var eyeColourList = [
            '#7FFFD4',
            '#0000FF',
            '#00FFFF',
            '#FFD700',

            '#F8F8FF',
            '#8FBC8F',
            '#808080',
            '#8A2BE2',

            '#90EE90',
            '#87CEEB',
            '#6495ED',
            '#006400',

            '#B8860B',
            '#CD853F',
            '#DA70D6',
            '#F08080'
        ];

        var skinColourList = [
            '#FFDFC4',
            '#F0D5BE',
            '#E1B899',
            '#E5C298',
            '#FFDCB2',
            '#E5A073',
            '#DB9065',
            '#CE967C',
            '#C67856',
            '#BA6C49',
            '#A57257',
            '#B97C6D',
            '#A8756C',
            '#AD6452',
            '#5C3836',
            '#A3866A',
        ];
        var hairColourList = [
            '#090806',
            '#71635A',
            '#FFF5E1',
            '#E6CEA8',
            '#E5C8A8',
            '#DEBC99',
            '#B89778',
            '#A56B46',
            '#B55239',
            '#8D4A43',
            '#91553D',
            '#533D32',
            '#3B3024',
            '#554838',
            '#4E433F',
            '#6A4E42',
        ];

        var faceSet = {
            name: "faceSet",
            parts: [{
                id: 0,
                output: false,
                resolve: function(sha1) { return null; }
            }, {
                id: 1,
                output: false,
                resolve: function(sha1) { return null; }
            }, {
                id: 3,
                output: true,
                resolve: function(sha1) {
                    var skinColour = skinColourList[Math.floor(sha1[0] / 16)];
                    var leftEar = '<ellipse transform="rotate(-10 150,310)" ry="41" rx="26" id="svg_2" cy="310" cx="150" stroke-linecap="null" stroke-linejoin="null" stroke-dasharray="null" stroke-width="5" stroke="#000000" fill="' + skinColour + '"/>';
                    var rightEar = '<ellipse transform="rotate(10 490,310)" ry="41" rx="26" id="svg_2" cy="310" cx="490" stroke-linecap="null" stroke-linejoin="null" stroke-dasharray="null" stroke-width="5" stroke="#000000" fill="' + skinColour + '"/>';
                    return leftEar + rightEar;

                }
            }, {
                id: 4,
                output: true,
                resolve: function(sha1) {
                    var skinColour = skinColourList[Math.floor(sha1[0] / 16)];
                    var head = '<ellipse fill="' + skinColour + '" stroke-width="5" cx="320" cy="320" id="svg_1" rx="160" ry="160" stroke="#000000"/>';
                    return head;

                }
            }, {
                id: 5,
                output: true,
                resolve: function(sha1) {
                    var hairColour = hairColourList[Math.floor(sha1[0] % 16)];
                    var frontHair = '<path d="m164.00002,254.75002c0,0 314.25001,1.5 314.25001,1.5c0,0 -12,-42 -39.75,-70.5c-27,-28.734 -68,-39 -97,-41.75002c-28.34377,-1 -48,-4 -82.5,4.5c-34.03908,8.67576 -49.56248,26.19924 -66.24998,47.00002c-16.6875,20.80078 -28.5,59.25 -28.5,59.25z" stroke-linecap="null" stroke-linejoin="null" stroke-dasharray="null" stroke-width="5" stroke="#000000" fill="' + hairColour + '"/>';
                    return frontHair;

                }
            }, {
                id: 8,
                output: true,
                resolve: function(sha1) {
                    var mouthPathsList = ["m244,400c1,0 4,9 13,15c9,6 35,15 59,15c24,0 40,-6 48,-14c8,-8 10,-17 10,-17"];
                    var path = mouthPathsList[Math.floor(sha1[this.id] % mouthPathsList.length)];
                    var mouth = '<path d="m244,400c1,0 4,9 13,15c9,6 35,15 59,15c24,0 40,-6 48,-14c8,-8 10,-17 10,-17" stroke-linecap="null" stroke-linejoin="null" stroke-dasharray="null" stroke-width="5" stroke="#000000" fill="none"/>';
                    return mouth;

                }
            }, {
                id: 9,
                output: true,
                resolve: function(sha1) {
                    var nosePathsList = [
                        'm310,340c0,0 0,20 0,20c0,0 20,0 20,0c0,0 0,-20 0,-20',
                        'm310,340c0,0 0,30 0,30c0,0 20,0 20,0c0,0 0,-30 0,-30',
                        'm310,340c0,0 0,40 0,40c0,0 20,0 20,0c0,0 0,-40 0,-40',
                        'm310,340c0,0 0,50 0,50c0,0 20,0 20,0c0,0 0,-50 0,-50',
                        
                        'm310,340c0,0 -10,20 -10,20c0,0 40,0 40,0c0,0 -10,-20 -10,-20',
                        'm310,340c0,0 -10,30 -10,30c0,0 40,0 40,0c0,0 -10,-30 -10,-30',
                        'm310,340c0,0 -10,40 -10,40c0,0 40,0 40,0c0,0 -10,-40 -10,-40',
                        'm310,340c0,0 -10,50 -10,50c0,0 40,0 40,0c0,0 -10,-50 -10,-50',
                        
                        'm310,340c0,0 -10,20 -10,20c0,0 10,10 10,10c0,0 20,0 20,0c0,0 10,-10 10,-10c0,0 -10,-20 -10,-20',
                        'm310,340c0,0 -10,30 -10,30c0,0 10,10 10,10c0,0 20,0 20,0c0,0 10,-10 10,-10c0,0 -10,-30 -10,-30',
                        'm310,340c0,0 -10,40 -10,40c0,0 10,10 10,10c0,0 20,0 20,0c0,0 10,-10 10,-10c0,0 -10,-40 -10,-40',
                        'm310,340c0,0 -10,50 -10,50c0,0 10,10 10,10c0,0 20,0 20,0c0,0 10,-10 10,-10c0,0 -10,-50 -10,-50',

                        'm310,340c0,0 0,10 0,10c0,0 -10,20 -10,20c0,0 10,10 10,10c0,0 20,0 20,0c0,0 10,-10 10,-10c0,0 -10,-20 -10,-20c0,0 0,-10 0,-10',
                        'm310,340c0,0 0,10 0,10c0,0 -10,30 -10,30c0,0 10,10 10,10c0,0 20,0 20,0c0,0 10,-10 10,-10c0,0 -10,-30 -10,-30c0,0 0,-10 0,-10',
                        'm310,340c0,0 0,10 0,10c0,0 -10,40 -10,40c0,0 10,10 10,10c0,0 20,0 20,0c0,0 10,-10 10,-10c0,0 -10,-40 -10,-40c0,0 0,-10 0,-10',
                        'm310,340c0,0 0,10 0,10c0,0 -10,50 -10,50c0,0 10,10 10,10c0,0 20,0 20,0c0,0 10,-10 10,-10c0,0 -10,-50 -10,-50c0,0 0,-10 0,-10',
                        
                        ];
                    var path = nosePathsList[Math.floor(sha1[this.id] % nosePathsList.length)];
                    
                    var nose = '<path d="'+path+'" stroke-linecap="null" stroke-linejoin="null" stroke-dasharray="null" stroke-width="5" stroke="#000000" fill="none"/>';
                    return nose;

                }
            }, {
                id: 10,
                output: true,
                resolve: function(sha1) {
                    var eyeColour = eyeColourList[Math.floor(sha1[1] % 16)];
                    var temp1 = sha1[this.id] % 16;
                    var eyeVar2 = Math.floor(sha1[this.id] / 16);
                    var spread = (temp1 % 4) * 10 + 40;
                    var height = (Math.floor(temp1 / 4) - 2) * 10;
                    var leftEye = '<ellipse ry="14" rx="14" cy="'+(320+height)+'" cx="'+(320-spread)+'" stroke-linecap="null" stroke-linejoin="null" stroke-dasharray="null" stroke-width="5" stroke="#000000" fill="' + eyeColour + '"/>';
                    var rightEye = '<ellipse ry="14" rx="14" cy="'+(320+height)+'" cx="'+(320+spread)+'" stroke-linecap="null" stroke-linejoin="null" stroke-dasharray="null" stroke-width="5" stroke="#000000" fill="' + eyeColour + '"/>';
                    return leftEye + rightEye;
                }
            }, ]


        };
        for (var i = 1; i < 20; i++) {
            svgLineSet.parts.push({
                id: 2,
                output: true,
                resolve: function(sha1) {
                    return '<line id="svg_1" y2="540" x2="320" y1="100" x1="320" stroke-width="5" stroke="#000000" fill="none" transform="rotate(' + (360 * (256 / sha1[this.id])) + ' 320,320) "/>';

                }
            });
        }



        var htmlImgSet = {
            name: "htmlImgSet",
            parts: [],
            attributes: ""
        };
        for (var i = 0; i < 20; i++) {
            htmlImgSet.parts.push({
                id: i,
                output: true,
                resolve: function(sha1) {
                    var imgPath = "./img/faceParts/" + this.id + "/" + sha1[this.id] + ".png";
                    return '<img src="' + imgPath + '" width="32px" style="position: absolute; left: 0px; top: 0px;"/>';

                }
            });
        }

        facer.loadCustomSet(faceSet);
        facer.loadCustomSet(colouredSvgLineSet);
        facer.loadCustomSet(svgLineSet);
        facer.loadCustomSet(htmlImgSet);
        facer.useSet("htmlImgSet");

        faceOf = function(input){
            
            facer.useSet("faceSet");
            return '<svg width="128" height="128" viewBox="0 0 640 640"  xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg">' +
                facer.resolveInput(input) +
                '</svg>';
        }
    }
);
