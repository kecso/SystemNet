/*globals define, _, $*/
/*jshint browser: true, camelcase: false*/

/**
 * @author rkereskenyi / https://github.com/rkereskenyi
 */

define([
    'js/Constants',
    'js/NodePropertyNames',
    'js/Widgets/DiagramDesigner/DiagramDesignerWidget.DecoratorBase',
    'text!./SystemNetPlaceDecorator.DiagramDesignerWidget.html',
    'text!systemnetBase/svgs/place.svg',
    'css!./SystemNetPlaceDecorator.DiagramDesignerWidget.css'
], function (CONSTANTS,
             nodePropertyNames,
             DiagramDesignerWidgetDecoratorBase,
             SystemNetPlaceDecoratorTemplate,
             PlaceSvgTemplate) {

    'use strict';

    var SystemNetPlaceDecorator,
        __parent__ = DiagramDesignerWidgetDecoratorBase,
        __parent_proto__ = DiagramDesignerWidgetDecoratorBase.prototype,
        DECORATOR_ID = 'SystemNetPlaceDecorator';

    SystemNetPlaceDecorator = function (options) {
        var opts = _.extend({}, options);

        __parent__.apply(this, [opts]);

        this.name = '';

        this.logger.debug('SystemNetPlaceDecorator ctor');
    };

    _.extend(SystemNetPlaceDecorator.prototype, __parent_proto__);
    SystemNetPlaceDecorator.prototype.DECORATORID = DECORATOR_ID;

    /*********************** OVERRIDE DiagramDesignerWidgetDecoratorBase MEMBERS **************************/

    SystemNetPlaceDecorator.prototype.$DOMBase = $(SystemNetPlaceDecoratorTemplate).append(PlaceSvgTemplate);
    // SystemNetPlaceDecorator.prototype.$DOMBase.find("svg")[0].addClass("connector bottom top");

    SystemNetPlaceDecorator.prototype.on_addTo = function () {
        var self = this;

        this._renderContent();

        // set title editable on double-click
        // this.skinParts.$name.on('dblclick.editOnDblClick', null, function (event) {
        //     if (self.hostDesignerItem.canvas.getIsReadOnlyMode() !== true) {
        //         $(this).editInPlace({
        //             class: '',
        //             onChange: function (oldValue, newValue) {
        //                 self._onNodeTitleChanged(oldValue, newValue);
        //             }
        //         });
        //     }
        //     event.stopPropagation();
        //     event.preventDefault();
        // });

        //let the parent decorator class do its job first
        __parent_proto__.on_addTo.apply(this, arguments);
    };

    SystemNetPlaceDecorator.prototype._renderContent = function () {
        var client = this._control._client,
            nodeObj = client.getNode(this._metaInfo[CONSTANTS.GME_ID]);

        //render GME-ID in the DOM, for debugging
        this.$el.attr({'data-id': this._metaInfo[CONSTANTS.GME_ID]});

        if (nodeObj) {
            this.name = nodeObj.getAttribute(nodePropertyNames.Attributes.name) || '';
            this.token = nodeObj.getAttribute('initialMarking') || 0;
            this.capacity = nodeObj.getAttribute('capacity') || 1;
        }

        this.skinParts.$name = this.$el.find('#name')[0];
        this.skinParts.$name.innerHTML = this.name;

        this.skinParts.$token = this.$el.find('#token')[0];
        this.skinParts.$token.innerHTML = this.token;

        this.skinParts.$capacity = this.$el.find('#capacity')[0];
        this.skinParts.$capacity.innerHTML = this.capacity;
    };

    SystemNetPlaceDecorator.prototype.update = function () {
        this._renderContent();
    };

    SystemNetPlaceDecorator.prototype.getConnectionAreas = function (id /*, isEnd, connectionMetaInfo*/) {
        var result = [],
            edge = 10,
            LEN = 20;

        //by default return the bounding box edge's midpoints

        if (id === undefined || id === this.hostDesignerItem.id) {
            //NORTH
            result.push({
                id: '0',
                x1: edge,
                y1: 0,
                x2: this.hostDesignerItem.getWidth() - edge,
                y2: 0,
                angle1: 270,
                angle2: 270,
                len: LEN
            });

            //EAST
            result.push({
                id: '1',
                x1: this.hostDesignerItem.getWidth(),
                y1: edge,
                x2: this.hostDesignerItem.getWidth(),
                y2: this.hostDesignerItem.getHeight() - edge,
                angle1: 0,
                angle2: 0,
                len: LEN
            });

            //SOUTH
            result.push({
                id: '2',
                x1: edge,
                y1: this.hostDesignerItem.getHeight(),
                x2: this.hostDesignerItem.getWidth() - edge,
                y2: this.hostDesignerItem.getHeight(),
                angle1: 90,
                angle2: 90,
                len: LEN
            });

            //WEST
            result.push({
                id: '3',
                x1: 0,
                y1: edge,
                x2: 0,
                y2: this.hostDesignerItem.getHeight() - edge,
                angle1: 180,
                angle2: 180,
                len: LEN
            });
        }

        return result;
    };

    /**************** EDIT NODE TITLE ************************/

    // SystemNetPlaceDecorator.prototype._onNodeTitleChanged = function (oldValue, newValue) {
    //     var client = this._control._client;
    //
    //     client.setAttribute(this._metaInfo[CONSTANTS.GME_ID], nodePropertyNames.Attributes.name, newValue);
    // };

    /**************** END OF - EDIT NODE TITLE ************************/

    SystemNetPlaceDecorator.prototype.doSearch = function (searchDesc) {
        var searchText = searchDesc.toString();
        if (this.name && this.name.toLowerCase().indexOf(searchText.toLowerCase()) !== -1) {
            return true;
        }

        return false;
    };

    return SystemNetPlaceDecorator;
});