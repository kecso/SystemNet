/*globals define, _*/
/*jshint browser: true, camelcase: false*/

/**
 * @author rkereskenyi / https://github.com/rkereskenyi
 */

define([
    'js/Decorators/DecoratorBase',
    './DiagramDesigner/SystemNetPlaceDecorator.DiagramDesignerWidget',
    './PartBrowser/SystemNetPlaceDecorator.PartBrowserWidget'
], function (DecoratorBase, SystemNetPlaceDecoratorDiagramDesignerWidget, SystemNetPlaceDecoratorPartBrowserWidget) {

    'use strict';

    var SystemNetPlaceDecorator,
        __parent__ = DecoratorBase,
        __parent_proto__ = DecoratorBase.prototype,
        DECORATOR_ID = 'SystemNetPlaceDecorator';

    SystemNetPlaceDecorator = function (params) {
        var opts = _.extend({loggerName: this.DECORATORID}, params);

        __parent__.apply(this, [opts]);

        this.logger.debug('SystemNetPlaceDecorator ctor');
    };

    _.extend(SystemNetPlaceDecorator.prototype, __parent_proto__);
    SystemNetPlaceDecorator.prototype.DECORATORID = DECORATOR_ID;

    /*********************** OVERRIDE DecoratorBase MEMBERS **************************/

    SystemNetPlaceDecorator.prototype.initializeSupportedWidgetMap = function () {
        this.supportedWidgetMap = {
            DiagramDesigner: SystemNetPlaceDecoratorDiagramDesignerWidget,
            PartBrowser: SystemNetPlaceDecoratorPartBrowserWidget
        };
    };

    return SystemNetPlaceDecorator;
});