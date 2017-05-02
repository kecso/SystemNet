/*globals define*/
/*jshint node:true, browser:true*/

/**
 * Generated by PluginGenerator 1.7.0 from webgme on Wed Apr 26 2017 00:05:04 GMT-0500 (Central Daylight Time).
 * A plugin that inherits from the PluginBase. To see source code documentation about available
 * properties and methods visit %host%/docs/source/PluginBase.html.
 */

define([
    'plugin/PluginConfig',
    'text!./metadata.json',
    'plugin/PluginBase',
    'q',
    'common/util/ejs',
    'text!./nuxmv.ejs',
    'common/util/guid'
], function (PluginConfig,
             pluginMetadata,
             PluginBase,
             Q,
             ejs,
             NuXmv,
             GUID) {
    'use strict';

    pluginMetadata = JSON.parse(pluginMetadata);

    function getTypeName(core, node) {
        return core.getAttribute(core.getBaseType(node), 'name');
    }

    /**
     * Initializes a new instance of SystemNetVerifier.
     * @class
     * @augments {PluginBase}
     * @classdesc This class represents the plugin SystemNetVerifier.
     * @constructor
     */
    var SystemNetVerifier = function () {
        // Call base class' constructor.
        PluginBase.call(this);
        this.pluginMetadata = pluginMetadata;
    };

    /**
     * Metadata associated with the plugin. Contains id, name, version, description, icon, configStructue etc.
     * This is also available at the instance at this.pluginMetadata.
     * @type {object}
     */
    SystemNetVerifier.metadata = pluginMetadata;

    // Prototypical inheritance from PluginBase.
    SystemNetVerifier.prototype = Object.create(PluginBase.prototype);
    SystemNetVerifier.prototype.constructor = SystemNetVerifier;

    /**
     * Main function for the plugin to execute. This will perform the execution.
     * Notes:
     * - Always log with the provided logger.[error,warning,info,debug].
     * - Do NOT put any user interaction logic UI, etc. inside this method.
     * - callback always has to be called even if error happened.
     *
     * @param {function(string, plugin.PluginResult)} callback - the result callback
     */
    SystemNetVerifier.prototype.main = function (callback) {
        // Use self to access core, project, result, logger etc from PluginBase.
        // These are all instantiated at this point.
        var self = this,
            currentConfig = self.getCurrentConfig(),
            nuxmvInput,
            nuxmvResult,
            parsedResult,
            artifact,
            filesToAdd = {};

        self._nodes = {};
        self.getDataModel(self.activeNode)
            .then(function (model) {
                var modelName = self.core.getAttribute(self.activeNode, 'name'),
                    htmlResult;

                model.safety = currentConfig.safety;
                model.infinite = currentConfig.infinite;
                model.balanced = currentConfig.balanced;

                nuxmvInput = ejs.render(NuXmv, model);

                self.result.setSuccess(true);
                nuxmvResult = self.checkNuxmv(nuxmvInput);
                parsedResult = self.parseResult(nuxmvResult, model);
                htmlResult = self.getHtmlResult(parsedResult);

                artifact = self.blobClient.createArtifact(modelName + '_check');
                filesToAdd[modelName + '.smv'] = nuxmvInput;
                filesToAdd[modelName + '.res'] = nuxmvResult;
                filesToAdd[modelName + '_parsed.res'] = JSON.stringify(parsedResult, null, 2);

                if (nuxmvResult !== null) {
                    // self.createMessage(self.activeNode, 'The parsed output:' + JSON.stringify(parsedResult, null, 2));
                    self.createMessage(self.activeNode, htmlResult);
                }
                return artifact.addFiles(filesToAdd);
            })
            .then(function (hashes) {
                self.logger.info('Files (metadata) have hashes: ' + hashes.toString());
                return artifact.save();
            })
            .then(function (artifactHash) {
                self.logger.info('Artifact (metadata) has hash: ' + artifactHash);
                self.result.setSuccess(true);
                self.result.addArtifact(artifactHash);
                callback(null, self.result);
            })
            .catch(function (err) {
                // Result success is false at invocation.
                callback(err, self.result);
            });
    };

    SystemNetVerifier.prototype.getDataModel = function (systemNetNode) {
        var nodes = this._nodes,
            core = this.core,
            model = {
                places: [],
                transitions: [],
                transitionDefs: [],
                capacities: [],
                initial: []
            },
            deferred = Q.defer();

        if (getTypeName(core, systemNetNode) !== 'SystemNet') {
            deferred.reject(new Error('Only SystemNets are allowed'));
            return;
        }

        nodes[core.getPath(systemNetNode)] = systemNetNode;
        core.loadChildren(systemNetNode)
            .then(function (children) {
                var i, j,
                    edges = [],
                    type;

                for (i = 0; i < children.length; i += 1) {
                    nodes[core.getPath(children[i])] = children[i];
                    type = getTypeName(core, children[i]);
                    switch (type) {
                        case 'Place':
                            model.places.push(core.getPath(children[i]));
                            model.capacities.push(core.getAttribute(children[i], 'capacity'));
                            model.initial.push(core.getAttribute(children[i], 'initialMarking'));
                            break;
                        case 'Transition':
                            model.transitions.push(core.getPath(children[i]));
                            break;
                        case 'P2T':
                            edges.push({
                                place: core.getPointerPath(children[i], 'src'),
                                transition: core.getPointerPath(children[i], 'dst'),
                                weight: core.getAttribute(children[i], 'weight'),
                                in: true
                            });
                            break;
                        case 'T2P':
                            edges.push({
                                transition: core.getPointerPath(children[i], 'src'),
                                place: core.getPointerPath(children[i], 'dst'),
                                weight: core.getAttribute(children[i], 'weight'),
                                in: false
                            });
                    }
                }

                for (j = 0; j < model.transitions.length; j += 1) {
                    model.transitionDefs.push([]);
                    for (i = 0; i < model.places.length; i += 1) {
                        model.transitionDefs[j].push([0, 0]);
                    }
                }

                for (i = 0; i < edges.length; i += 1) {
                    j = edges[i].in ? 0 : 1;
                    model.transitionDefs[model.transitions.indexOf(edges[i].transition)][model.places.indexOf(edges[i].place)][j] = edges[i].weight;
                }

                deferred.resolve(model);
            });

        return deferred.promise;
    };

    SystemNetVerifier.prototype.checkNuxmv = function (nuxmv) {
        var self = this,
            fs = require('fs'),
            exec = require('child_process').execSync,
            response = null,
            fileName = GUID() + '.smv';

        fs.writeFileSync(fileName, nuxmv, 'utf8');

        try {
            response = exec('nuxmv ' + fileName, {encoding: 'utf8'});
        } catch (e) {
            console.log(e);
            self.result.setSucess(false);
            self.createMessage(null, e);
        }

        fs.unlinkSync(fileName);
        return response;
    };

    SystemNetVerifier.prototype.parseResult = function (result, dataModel) {
        var parsedResult = {
                safety: true,
                infinite: true,
                balanced: true,
                counterTraces: {
                    safety: {
                        has: false,
                        fireSequence: [],
                        loopStart: null
                    },
                    infinite: {
                        has: false,
                        fireSequence: [],
                        loopStart: null
                    },
                    balanced: {
                        has: false,
                        fireSequence: [],
                        loopStart: null
                    }
                }
            },
            lines = result.split('\n'),
            i, j,
            key,
            trace = {},
            fireables = [],
            fire = null,
            state = 'base',
            core = this.core,
            nodes = this._nodes;

        for (i = 0; i < lines.length; i += 1) {
            if (lines[i].indexOf('***') === 0) {
                continue;
            }

            if (lines[i].indexOf('-- specification') === 0) {
                state = 'base';
                if (lines[i].indexOf('safety') > 0) {
                    key = 'safety';
                } else if (lines[i].indexOf('infinite') > 0) {
                    key = 'infinite';
                } else {
                    key = 'balanced'
                }

                if (lines[i].indexOf('is true') > 0) {
                    parsedResult[key] = parsedResult[key] && true;
                } else {
                    parsedResult[key] = false;
                    if (parsedResult.counterTraces[key].has === false) {
                        trace = parsedResult.counterTraces[key];
                        trace.has = true;
                        state = 'trace';
                        fireables = [];
                        for (j = 0; j < dataModel.transitions.length; j += 1) {
                            fireables.push = false;
                        }
                    }
                }
            } else if (state === 'trace') {
                if (lines[i].indexOf('->') > 0 && lines[i].indexOf('<-') > 0) {
                    //new state le us check if we fired something
                    if (fire !== null && fireables[fire]) {
                        key = dataModel.transitions[fire];
                        trace.fireSequence.push(core.getAttribute(nodes[key], 'name') + '(' + key + ')');
                    }
                } else if (lines[i].indexOf('-- Loop starts here') > 0) {
                    trace.loopStart = trace.fireSequence.length;
                } else if (lines[i].indexOf('fire = ') > 0) {
                    // console.log('fire: ',(/fire = ([0-9]+)/g).exec(lines[i])[1]);
                    fire = Number((/fire = ([0-9]+)/g).exec(lines[i])[1]);
                } else if (lines[i].indexOf('fireable') > 0) {
                    // console.log('fireable: ',(/fireable([0-9]+)/g).exec(lines[i])[1]);
                    key = Number((/fireable([0-9]+)/g).exec(lines[i])[1]);
                    if (lines[i].indexOf('TRUE') > 0) {
                        fireables[key] = true;
                    } else {
                        fireables[key] = false;
                    }
                }
            }
        }

        return parsedResult;
    };

    SystemNetVerifier.prototype.getHtmlResult = function (parsedResult) {
        var htmlResult = '',
            config = this.getCurrentConfig(),
            redBold = '<span style="color:red; font-weight:bold">',
            greenBold = '<span style="color:red; font-weight:bold">',
            printTrace = function (trace) {
                var i;

                if (trace.has !== true) {
                    return;
                }

                htmlResult += '<h5>';
                if (trace.loopStart === 0) {
                    htmlResult += '<b>[</b> ';
                }else {
                    htmlResult += '  ';
                }
                htmlResult += trace.fireSequence[0];
                for (i = 0; i < trace.fireSequence.length; i += 1) {
                    htmlResult += ',<br/>';
                    if (trace.loopStart === i) {
                        htmlResult += '<b>[</b> ';
                    } else {
                        htmlResult += '  ';
                    }
                    htmlResult += trace.fireSequence[i];
                }

                if (typeof trace.loopStart === 'number') {
                    if(trace.loopStart < trace.fireSequence.length){
                        htmlResult += '<b>]+</b>';
                    } else {
                        htmlResult += '<b>+</b>';
                    }
                }
                htmlResult += '</h5>';
            };

        if (config.safety === true) {
            htmlResult += '<h4>Safety check: ';
            if (parsedResult.safety === true) {
                htmlResult += greenBold + 'success</span></h4>';
            } else {
                htmlResult += redBold + 'fail</span></h4>';
                printTrace(parsedResult.counterTraces.safety);
            }
        }

        if (config.infinite === true) {
            htmlResult += '<h4>Infinite execution check: ';
            if (parsedResult.infinite === true) {
                htmlResult += greenBold + 'success</span></h4>';
            } else {
                htmlResult += greenBold + 'fail</span></h4>';
                printTrace(parsedResult.counterTraces.infinite);
            }
        }

        if (config.balanced === true) {
            htmlResult += '<h4>Balance check: ';
            if (parsedResult.balanced === true) {
                htmlResult += greenBold + 'success</span></h4>';
            } else {
                htmlResult += greenBold + 'fail</span></h4>';
                printTrace(parsedResult.counterTraces.balanced);
            }
        }

        return htmlResult;
    };
    return SystemNetVerifier;
});
