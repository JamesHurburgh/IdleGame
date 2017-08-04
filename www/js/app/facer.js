define([],
    function facer() {

        return {

            initialise : function(){
                sha1 = function(inputString){
                    // TODO implement
                    return [0,1,2,3,4,5,6,7,0,1,2,3,4,5,6,7,0,1,2,3];
                };
                // TODO get input string from url
                var inputString = "Bob";

                var sha1 = sha1(inputString);

                var testSet = {
                    name : "test",
                    resolvePartById : function(id, sha1){
                        return this.parts[id].resolve(sha1);
                    },
                    resolvePartByName : function(partName, sha1){
                        this.parts.forEach(function(part) {
                            if(part.name == partName){
                                return part.resolve(sha1);
                            }
                        }, this);
                    },
                    parts : [
                        { id: 1, output: true, resolve: function (sha1){ return sha1[this.id]; } },
                        { id: 2, output: true, resolve: function (sha1){ return sha1[this.id]; } },
                        { id: 3, output: true, resolve: function (sha1){ return sha1[this.id]; } },
                        { id: 4, output: true, resolve: function (sha1){ return sha1[this.id]; } },
                        { id: 5, output: true, resolve: function (sha1){ return sha1[this.id]; } },
                        { id: 6, output: true, resolve: function (sha1){ return sha1[this.id]; } },
                        { id: 7, output: true, resolve: function (sha1){ return sha1[this.id]; } },
                        { id: 8, output: true, resolve: function (sha1){ return sha1[this.id]; } },
                        { id: 9, output: true, resolve: function (sha1){ return sha1[this.id]; } },
                        { id: 10, output: true, resolve: function (sha1){ return sha1[this.id]; } },
                        { id: 11, output: true, resolve: function (sha1){ return sha1[this.id]; } },
                        { id: 12, output: true, resolve: function (sha1){ return sha1[this.id]; } },
                        { id: 13, output: true, resolve: function (sha1){ return sha1[this.id]; } },
                        { id: 14, output: true, resolve: function (sha1){ return sha1[this.id]; } },
                        { id: 15, output: true, resolve: function (sha1){ return sha1[this.id]; } },
                        { id: 16, output: true, resolve: function (sha1){ return sha1[this.id]; } },
                        { id: 17, output: true, resolve: function (sha1){ return sha1[this.id]; } },
                        { id: 18, output: true, resolve: function (sha1){ return sha1[this.id]; } },
                        { id: 19, output: true, resolve: function (sha1){ return sha1[this.id]; } },
                        { id: 20, output: true, resolve: function (sha1){ return sha1[this.id]; } },
                    ]
                };

                var output = "";
                testSet.parts.forEach(function(part){
                    output += part.resolve(sha1);
                });
                return "Sha1  : " + sha1 + "Output: " + output;
            }
        };
    }
);