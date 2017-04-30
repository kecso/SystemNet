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
    'text!../DiagramDesigner/SystemNetPlaceDecorator.DiagramDesignerWidget.html',
    'text!systemnetBase/svgs/place.svg',
    'css!../DiagramDesigner/SystemNetPlaceDecorator.DiagramDesignerWidget.css',
    'css!./SystemNetPlaceDecorator.PartBrowserWidget.css'
], function (CONSTANTS,
             nodePropertyNames,
             PartBrowserWidgetDecoratorBase,
             DiagramDesignerWidgetConstants,
             SystemNetPlaceDecoratorDiagramDesignerWidgetTemplate,
             PlaceSvgTemplate) {

    'use strict';

    var SystemNetPlaceDecoratorPartBrowserWidget,
        __parent__ = PartBrowserWidgetDecoratorBase,
        DECORATOR_ID = 'SystemNetPlaceDecoratorPartBrowserWidget';

    SystemNetPlaceDecoratorPartBrowserWidget = function (options) {
        var opts = _.extend({}, options);

        __parent__.apply(this, [opts]);

        this.logger.debug('SystemNetPlaceDecoratorPartBrowserWidget ctor');
    };

    _.extend(SystemNetPlaceDecoratorPartBrowserWidget.prototype, __parent__.prototype);
    SystemNetPlaceDecoratorPartBrowserWidget.prototype.DECORATORID = DECORATOR_ID;

    /*********************** OVERRIDE DiagramDesignerWidgetDecoratorBase MEMBERS **************************/

    SystemNetPlaceDecoratorPartBrowserWidget.prototype.$DOMBase = (function () {
        var el = $(SystemNetPlaceDecoratorDiagramDesignerWidgetTemplate);
        el.append(PlaceSvgTemplate);
        //use the same HTML template as the SystemNetPlaceDecorator.DiagramDesignerWidget
        //but remove the connector DOM elements since they are not needed in the PartBrowser
        el.find('.' + DiagramDesignerWidgetConstants.CONNECTOR_CLASS).remove();
        return el;
    })();

    SystemNetPlaceDecoratorPartBrowserWidget.prototype.beforeAppend = function () {
        this.$el = this.$DOMBase.clone();

        //find name placeholder
        this.skinParts.$name = this.$el.find('#name')[0];
        this.skinParts.$token = this.$el.find('#token')[0];
        this.skinParts.$capacity = this.$el.find('#capacity')[0];

        this._renderContent();
    };

    SystemNetPlaceDecoratorPartBrowserWidget.prototype.afterAppend = function () {
    };

    SystemNetPlaceDecoratorPartBrowserWidget.prototype._renderContent = function () {
        var client = this._control._client,
            nodeObj = client.getNode(this._metaInfo[CONSTANTS.GME_ID]);

        //render GME-ID in the DOM, for debugging
        if (DEBUG) {
            this.$el.attr({'data-id': this._metaInfo[CONSTANTS.GME_ID]});
        }

        if (nodeObj) {
            this.skinParts.$name.innerHTML = nodeObj.getAttribute(nodePropertyNames.Attributes.name) || '';
            this.skinParts.$token.innerHTML = nodeObj.getAttribute('initialMarking') || '0';
            this.skinParts.$capacity.innerHTML = nodeObj.getAttribute('capacity') || '0';
        }
    };

    SystemNetPlaceDecoratorPartBrowserWidget.prototype.update = function () {
        this._renderContent();
    };

    return SystemNetPlaceDecoratorPartBrowserWidget;
});