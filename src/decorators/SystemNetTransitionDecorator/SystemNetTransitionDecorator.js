/*globals define, _*/
/*jshint browser: true, camelcase: false*/

/**
 * @author rkereskenyi / https://github.com/rkereskenyi
 */

define([
    'js/Decorators/DecoratorBase',
    './DiagramDesigner/SystemNetTransitionDecorator.DiagramDesignerWidget',
    './PartBrowser/SystemNetTransitionDecorator.PartBrowserWidget'
], function (DecoratorBase, SystemNetTransitionDecoratorDiagramDesignerWidget, SystemNetTransitionDecoratorPartBrowserWidget) {

    'use strict';

    var SystemNetTransitionDecorator,
        __parent__ = DecoratorBase,
        __parent_proto__ = DecoratorBase.prototype,
        DECORATOR_ID = 'SystemNetTransitionDecorator';

    SystemNetTransitionDecorator = function (params) {
        var opts = _.extend({loggerName: this.DECORATORID}, params);

        __parent__.apply(this, [opts]);

        this.logger.debug('SystemNetTransitionDecorator ctor');
    };

    _.extend(SystemNetTransitionDecorator.prototype, __parent_proto__);
    SystemNetTransitionDecorator.prototype.DECORATORID = DECORATOR_ID;

    /*********************** OVERRIDE DecoratorBase MEMBERS **************************/

    SystemNetTransitionDecorator.prototype.initializeSupportedWidgetMap = function () {
        this.supportedWidgetMap = {
            DiagramDesigner: SystemNetTransitionDecoratorDiagramDesignerWidget,
            PartBrowser: SystemNetTransitionDecoratorPartBrowserWidget
        };
    };

    return SystemNetTransitionDecorator;
});