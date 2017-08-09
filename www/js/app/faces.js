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
                    var temp1 = Math.floor(sha1[this.id] / 16);
                    var temp2 = sha1[this.id] % 16;
                    var earWidth = 20 + (10 * temp1 % 4);
                    var earHeight = 25 + (10 * Math.floor(temp1 / 4));
                    var leftEar = '<ellipse transform="rotate(-10 150,310)" ry="' + earHeight + '" rx="' + earWidth + '" id="svg_2" cy="310" cx="150" stroke-linecap="null" stroke-linejoin="null" stroke-dasharray="null" stroke-width="5" stroke="#000000" fill="' + skinColour + '"/>';
                    var rightEar = '<ellipse transform="rotate(10 490,310)" ry="' + earHeight + '" rx="' + earWidth + '" id="svg_2" cy="310" cx="490" stroke-linecap="null" stroke-linejoin="null" stroke-dasharray="null" stroke-width="5" stroke="#000000" fill="' + skinColour + '"/>';
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
                    var hairPathsList = [
                        ['m 162.31497,274 c 0,0 -2.88004,-19 9.60016,-64 12.48019,-45 48.96077,-112 48.96077,-112 0,0 -6.72011,22 -6.72011,47 0,24 24.00038,-46 24.00038,-46 0,0 -11.52018,99 0,75 11.52018,-24 24.00037,-75 24.00037,-75 0,0 -5.76009,90 3.84006,64 11.52019,-26 18.24029,-64 18.24029,-64 0,0 2.88005,84 9.60015,54 4.80008,-29 13.44021,-53 13.44021,-53 0,0 11.52018,77 16.32026,51 3.84006,-26 11.52018,-49 11.52018,-49 0,0 3.84006,82 12.4802,48 6.7201,-33 10.56016,-48 10.56016,-48 0,0 10.56017,93 19.20031,55 8.64013,-37 20.16031,-55 20.16031,-55 0,0 9.60015,109 26.88042,74 17.28028,-35 11.52019,-74 11.52019,-74 0,0 35.52055,68 41.28064,101 C 481.03998,235 482,275 482,275 482,275 430.57117,226.4684 322.76884,226.29321 214.96651,226.11802 162.31497,274 162.31497,274 Z'],
                        ['m164.00002,254.75002c0,0 314.25001,1.5 314.25001,1.5c0,0 -12,-42 -39.75,-70.5c-27,-28.734 -68,-39 -97,-41.75002c-28.34377,-1 -48,-4 -82.5,4.5c-34.03908,8.67576 -49.56248,26.19924 -66.24998,47.00002c-16.6875,20.80078 -28.5,59.25 -28.5,59.25z'],
                        [
                            'm 190.46127,258.63568 c 18.96743,0.76011 10.17347,-8.49347 59.30158,-46.26111 27.14445,-20.86751 13.1948,-31.8025 5.13393,-38.86876 -5.30793,-4.65299 -33.36612,-8.90885 -53.56917,10.66285 -20.20305,19.57171 -39.43237,59.87939 -35.12555,67.70057 5.19739,9.43846 11.54618,6.25698 24.25921,6.76645 z',
                            'm 450.2827,258.63568 c -18.96743,0.76011 -10.17347,-8.49347 -59.30158,-46.26111 -27.14445,-20.86751 -13.1948,-31.8025 -5.13393,-38.86876 5.30793,-4.65299 33.36612,-8.90885 53.56917,10.66285 20.20305,19.57171 39.43237,59.87939 35.12555,67.70057 -5.19739,9.43846 -11.54618,6.25698 -24.25921,6.76645 z'
                        ],
                        ['m 190.46127,258.63568 c 35.43159,-4.7964 51.95185,-8.82898 76.05659,-18.63568 8.55045,-3.47864 34.37653,-14.48487 69.19643,-15.17857 29.01553,-0.57807 51.33928,-11.16072 76.33928,5.80357 25,16.96428 12.17255,27.89636 38.22913,28.01068 26.05659,0.11432 30.48281,-5.23105 28.28873,-12.38568 -1.71126,-5.58023 -12.8903,-30.63517 -40.17857,-56.25 -21.94621,-20.60036 -29.46428,-32.58929 -55.35715,-27.23215 -18.09904,3.74463 -16.49947,12.70077 -30.80357,17.85714 -29.96198,10.80076 -36.16071,9.37501 -72.32142,0.44643 -11.25204,-2.77828 -19.36669,-12.50587 -32.14287,-12.94643 -25.89285,-0.89286 -43.43981,13.66589 -61.1607,37.5 -13.63643,18.34062 -30.35715,44.19644 -21.42858,49.10715 8.92857,4.91071 25.2827,3.90354 25.2827,3.90354 z'],
                        ['m 196.58931,243.58931 c 18.1373,-5.3779 -9.28182,-17.98904 70.37534,-32.23632 79.65716,-14.24729 204.58895,48.91489 204.58895,48.91489 0,0 -5.30357,-46.01786 -33.05357,-74.51786 -27,-28.734 -68,-39 -97,-41.75002 -28.34377,-1 -48,-4 -82.5,4.5 -34.03908,8.67576 -49.56248,26.19924 -66.24998,47.00002 -16.6875,20.80078 -28.05357,74.875 -28.05357,74.875 0,0 13.75552,-21.40781 31.89283,-26.78571 z']
                    ];
                    var paths = hairPathsList[Math.floor(sha1[this.id] % hairPathsList.length)];
                    var hairColour = hairColourList[Math.floor(sha1[0] % 16)];
                    var frontHair = "";
                    paths.forEach(function(path) {
                        frontHair += '<path d="' + path + '" stroke-linecap="null" stroke-linejoin="null" stroke-dasharray="null" stroke-width="5" stroke="#000000" fill="' + hairColour + '"/>';
                    }, this);
                    return frontHair;

                }
            }, {
                id: 8,
                output: true,
                resolve: function(sha1) {
                    var mouthPathsList = ["m260,400c0,0 130,0 130,0c0,0 -10,15 -10,15c0,0 -30,20 -30,20c0,0 -30,5 -30,5c0,0 -30,-5 -30,-5c0,0 -30,-20 -30,-20c0,0 -10,-15 -10,-15z"];
                    var path = mouthPathsList[Math.floor(sha1[this.id] % mouthPathsList.length)];
                    var mouth = '<path d="' + path + '" stroke-linecap="null" stroke-linejoin="null" stroke-dasharray="null" stroke-width="5" stroke="#000000" fill="#FFFFFF"/>';
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

                    var nose = '<path d="' + path + '" stroke-linecap="null" stroke-linejoin="null" stroke-dasharray="null" stroke-width="5" stroke="#000000" fill="none"/>';
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

                    var leftWhite = '<ellipse ry="20" rx="20" cy="' + (320 + height) + '" cx="' + (320 - spread) + '" stroke-linecap="null" stroke-linejoin="null" stroke-dasharray="null" stroke-width="5" stroke="#000000" fill="#FFFFFF" />';
                    var leftPupil = '<ellipse ry="7" rx="7" cy="' + (320 + height) + '" cx="' + (320 - spread) + '" stroke-linecap="null" stroke-linejoin="null" stroke-dasharray="null" stroke-width="5" stroke="none" fill="#000000" />';
                    var leftIris = '<ellipse ry="12" rx="12" cy="' + (320 + height) + '" cx="' + (320 - spread) + '" stroke-linecap="null" stroke-linejoin="null" stroke-dasharray="null" stroke-width="5" stroke="none" fill="' + eyeColour + '"/>';
                    var leftEye = leftWhite + leftIris + leftPupil;

                    var rightWhite = '<ellipse ry="20" rx="20" cy="' + (320 + height) + '" cx="' + (320 + spread) + '" stroke-linecap="null" stroke-linejoin="null" stroke-dasharray="null" stroke-width="5" stroke="#000000" fill="#FFFFFF" />';
                    var rightPupil = '<ellipse ry="7" rx="7" cy="' + (320 + height) + '" cx="' + (320 + spread) + '" stroke-linecap="null" stroke-linejoin="null" stroke-dasharray="null" stroke-width="5" stroke="none" fill="#000000" />';
                    var rightIris = '<ellipse ry="12" rx="12" cy="' + (320 + height) + '" cx="' + (320 + spread) + '" stroke-linecap="null" stroke-linejoin="null" stroke-dasharray="null" stroke-width="5" stroke="none" fill="' + eyeColour + '"/>';
                    var rightEye = rightWhite + rightIris + rightPupil;

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

        faceOf = function(input) {

            facer.useSet("faceSet");
            return '<svg width="128" height="128" viewBox="0 0 640 640"  xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg">' +
                facer.resolveInput(input) +
                '</svg>';
        }
    }
);