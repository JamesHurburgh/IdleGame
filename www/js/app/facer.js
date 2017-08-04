define(['sha1.min'],
    function facer(sha1) {

        return {

            initialise: function(inputString) {
                // TODO get input string from url

                var hashedInput = sha1.array(inputString);

                var facer = {
                    customSets: {},
                    set: [],
                    resolvePartById: function(id, sha1) {
                        return this.set.parts[id].resolve(sha1);
                    },
                    resolvePartByName: function(partName, sha1) {
                        this.set.parts.forEach(function(part) {
                            if (part.name == partName) {
                                return part.resolve(sha1);
                            }
                        }, this);
                    },
                    resolveHash: function(hash, seperator) {
                        if (!seperator || seperator === undefined) {
                            seperator = "";
                        }
                        var output = [];
                        this.set.parts.forEach(function(part) {
                            if (part.output) {
                                output.push(part.resolve(hash));
                            }
                        });
                        return output.join(seperator);
                    },
                    loadCustomSet: function(customSet) {
                        customSets[customSet.name] = customSet;
                    },
                    useSet: function(setName) {
                        switch (setName) {
                            case "int":
                                this.set = { name: "int", parts: [] };
                                for (var i = 0; i < 20; i++) {
                                    this.set.parts.push({ id: i, output: true, resolve: function(sha1) { return sha1[this.id]; } });
                                }
                                break;
                            case "bin":
                                this.set = { name: "bin", parts: [] };
                                for (var b = 0; b < 20; b++) {
                                    this.set.parts.push({
                                        id: b,
                                        output: true,
                                        resolve: function(sha1) {
                                            var value = sha1[this.id].toString(2);
                                            return "00000000".substr(value.length) + value;
                                        }
                                    });
                                }
                                break;
                            case "hex":
                                this.set = { name: "hex", parts: [] };
                                for (var h = 0; h < 20; h++) {
                                    this.set.parts.push({ id: h, output: true, resolve: function(sha1) { return ("0" + (Number(sha1[this.id]).toString(16))).slice(-2).toUpperCase(); } });
                                }
                                break;
                            default:
                                if (!customSets[setName] || customSets[setName] === undefined) {
                                    throw new Exception("Set '" + setName + "' not loaded.");
                                }
                                this.set = customSets[setName];
                        }
                    },
                };

                facer.useSet("bin");

                return "Sha1  : " + sha1.array(inputString) + "\r\nOutput: " + facer.resolveHash(hashedInput);
            }
        };
    }
);