/*globals define, _, DEBUG, $*/
/*jshint browser: true*/

/**
 * @author rkereskenyi / https://github.com/rkereskenyi
 */


define([
    'js/Constants',
    'js/NodePropertyNames',
    'js/Widgets/PartBrowser/PartBrowserWidget.DecoratorBase',
    'js/Widgets/DiagramDesigner/DiagramDesignerWidget.Constants',
    'text!../DiagramDesigner/SystemNetTransitionDecorator.DiagramDesignerWidget.html',
    'css!../DiagramDesigner/SystemNetTransitionDecorator.DiagramDesignerWidget.css',
    'css!./SystemNetTransitionDecorator.PartBrowserWidget.css'
], function (CONSTANTS,
             nodePropertyNames,
             PartBrowserWidgetDecoratorBase,
             DiagramDesignerWidgetConstants,
             SystemNetTransitionDecoratorDiagramDesignerWidgetTemplate) {

    'use strict';

    var SystemNetTransitionDecoratorPartBrowserWidget,
        __parent__ = PartBrowserWidgetDecoratorBase,
        DECORATOR_ID = 'SystemNetTransitionDecoratorPartBrowserWidget';

    SystemNetTransitionDecoratorPartBrowserWidget = function (options) {
        var opts = _.extend({}, options);

        __parent__.apply(this, [opts]);

        this.logger.debug('SystemNetTransitionDecoratorPartBrowserWidget ctor');
    };

    _.extend(SystemNetTransitionDecoratorPartBrowserWidget.prototype, __parent__.prototype);
    SystemNetTransitionDecoratorPartBrowserWidget.prototype.DECORATORID = DECORATOR_ID;

    /*********************** OVERRIDE DiagramDesignerWidgetDecoratorBase MEMBERS **************************/

    SystemNetTransitionDecoratorPartBrowserWidget.prototype.$DOMBase = (function () {
        var el = $(SystemNetTransitionDecoratorDiagramDesignerWidgetTemplate);
        //use the same HTML template as the SystemNetTransitionDecorator.DiagramDesignerWidget
        //but remove the connector DOM elements since they are not needed in the PartBrowser
        el.find('.' + DiagramDesignerWidgetConstants.CONNECTOR_CLASS).remove();
        return el;
    })();

    SystemNetTransitionDecoratorPartBrowserWidget.prototype.beforeAppend = function () {
        this.$el = this.$DOMBase.clone();

        //find name placeholder
        this.skinParts.$name = this.$el.find('.name');

        this._renderContent();
    };

    SystemNetTransitionDecoratorPartBrowserWidget.prototype.afterAppend = function () {
    };

    SystemNetTransitionDecoratorPartBrowserWidget.prototype._renderContent = function () {
        var client = this._control._client,
            nodeObj = client.getNode(this._metaInfo[CONSTANTS.GME_ID]);

        //render GME-ID in the DOM, for debugging
        if (DEBUG) {
            this.$el.attr({'data-id': this._metaInfo[CONSTANTS.GME_ID]});
        }

        if (nodeObj) {
            this.skinParts.$name.text(nodeObj.getAttribute(nodePropertyNames.Attributes.name) || '');
        }
    };

    SystemNetTransitionDecoratorPartBrowserWidget.prototype.update = function () {
        this._renderContent();
    };

    return SystemNetTransitionDecoratorPartBrowserWidget;
});