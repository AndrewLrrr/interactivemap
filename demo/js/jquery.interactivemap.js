/*=============================
 jQuery.interactiveMap.js
 Copyright (c) 2015 Andrew Larin
 Author: Andrew Larin
 Version: 0.6
 =============================*/
//Плагин для реализации вывода активных областей на документе с возможностью задавать цвет, границу и прозрачность фона

(function($) {

    'use strict';

    $.fn.interactiveMap = function(options) {

        var settings = $.extend({
            coordsObj: {}, //Координаты объектов
            dataObj: {}, //Данные для объектов
            showOptionsObj: {}, //Опции вывода изображений
            strokeColor: '#ffffff', //Цвет границы
            strokeWidth: 2, //Толщина границы
            fadeTime: 500, //Время появления
            showBorder: true, //Показывать границу
            fillColor: '#ffffff', //Цвет активных областей
            fillOpacity: 0.5, //Прозрачность фона активных областей
            hoverFillColor: 'red', //Цвет при наведении
            hoverFillOpacity: 0.5, //Прозрачность фона при наведении
            staticFillColor: 'green', //Цвет статики
            staticFillOpacity: 0.5, //Прозрачность фона статики
            setClick: true, //Устанавливать статический фон при нажатии
            setQueue: true, //Последовательный вывод элементов
            setPause: true, //Устанавливает паузу равную fadeTime при выводе элементов в очереди
            onClick: null, //Пользовательское действие на click
            onMouseOut: null, //Пользовательское действие на mouseout
            onMouseOver: null, //Пользовательское действие на mouseover
            onRender: null, //Пользовательское действие после рендеринга всех объектов
            onRemove: null //Пользовательское действие после удаления всех объектов
        }, options);

        settings.position = 'absolute';
        settings.cursor = 'pointer';
        settings.strokeType = 'solid';
        settings.zIndex = 8000; //Z-index активных областей
        settings.hoverZIndex = 6000; //Z-index активных областей при наведении
        settings.borderZIndex = 7000; //Z-index элементов границы областей при наведении
        settings.staticZIndex = 9000; //Z-index статичного элемента
        settings.itemName = 'active_region'; //Класс добавляемых элементов
        settings.itemBorderName = 'active_border'; //Класс определяющий границы элементов
        settings.itemStaticName = 'active_static_hover'; //Класс выделеных элементов
        settings.itemHoverName = 'active_hover'; //Класс фона при наведении

        var _el = $(this); //Основной элемент привязки плагина
        var _itemsScope = []; //Массив хранит сгенерированные объекты карты
        var _renderObj = {}; //Объект содержит методы ренеринга элементов карты
        var _itemsShowed = false; //Флаг для ограничения провторного вывода изображений в FireFox
        var _anchor = null; //Флаг активного элемента

        //Объект элемента карты
        var MapObject = function(opt) {

            this.id = opt.id;
            this.type = opt.type;
            this.name = opt.name;
            this.value = opt.value;
            this.position = settings.position;
            this.cursor = settings.cursor;
            this.top = opt.top;
            this.left = opt.left;
            this.width = opt.width;
            this.height = opt.height;
            this.zIndex = opt.zIndex;
            this.display = opt.display;
            this.border = settings.strokeWidth + 'px ' + settings.strokeType + ' ' + settings.strokeColor;

            this.fillColor = opt.fillColor;
            this.fillOpacity = opt.fillOpacity;
            this.hoverFillColor = opt.hoverFillColor;
            this.staticFillColor = opt.staticFillColor;
            this.hoverFillOpacity = opt.hoverFillOpacity;
            this.staticFillOpacity = opt.staticFillOpacity;

            this.isActive = opt.isActive;

            this.click = (opt.click) ? opt.click : null;
            this.mouseover = (opt.mouseover) ? opt.mouseover : null;
            this.mouseout = (opt.mouseout) ? opt.mouseout : null;
		};

        //Генерирует объект по заданым параметрам
        var _createObject = function(name, coords, data, actions) {

            var optObj = {};

            var mutableProps = ["fillColor", "hoverFillColor", "staticFillColor"];
            var enableCoords = ["top", "left", "height", "width"];

            if(typeof coords === "object") {
                $.each(coords, function(coordName, coordVal) {
                    if(enableCoords.indexOf(coordName) > -1) {
                        optObj[coordName] = coordVal;
                    }
                    else {
                        throw "Property " + coordName + " isn't allow for plugin";
                    }
                });
            }
            else {
                var coordsArr = coords.split(',');
                var x1 = coordsArr[0], y1 = coordsArr[1], x2 = coordsArr[2], y2 = coordsArr[3];

                //Выставляем координаты с поправками на границы элементов
                optObj.top = parseFloat(y1) + settings.strokeWidth + 'px';
                optObj.left = parseFloat(x1) + settings.strokeWidth + 'px';
                optObj.width = parseFloat((x2 - x1)) - (settings.strokeWidth * 2) + 'px';
                optObj.height = parseFloat((y2 - y1)) - (settings.strokeWidth * 2) + 'px';
            }


            if(parseFloat(optObj.width) <= 0) {
                throw "Incorrect parameters for width calculation - " + name;
            }
            else if(parseFloat(optObj.height) <= 0) {
                throw "Incorrect parameters for height calculation - " + name;
            }

            optObj.id = "im" + Math.round(Math.random() * 10000);
            optObj.type = "base";
            optObj.name = name;
            optObj.value = data;
            optObj.zIndex = settings.zIndex;
            optObj.bgColor = settings.fillColor;
            optObj.display = "none";
            optObj.isActive = false;
            optObj.fillColor = settings.fillColor;
            optObj.fillOpacity = settings.fillOpacity;
            optObj.hoverFillColor = settings.hoverFillColor;
            optObj.hoverFillOpacity = settings.hoverFillOpacity;
            optObj.staticFillColor = settings.staticFillColor;
            optObj.staticFillOpacity = settings.staticFillOpacity;


            //Если установлены дополнительные настройки вывода элементов, то перезаписываем их
            if (settings.showOptionsObj.hasOwnProperty(name)) {

                var addOptions = _createDataObj(settings.showOptionsObj[name], "addOptions " + name);

                $.each(addOptions, function(prop, val) {
                    if(mutableProps.indexOf(prop) > -1) {
                        optObj[prop] = val;
                    }
                });
            }

            //Если необходимо выделить активный элемент при загрузке, то скрываем его фон и устанавливаем флаг активности
            if (settings.showOptionsObj.hasOwnProperty("activeItem") && settings.showOptionsObj["activeItem"] === name) {
                optObj.isActive = true;
                optObj.fillOpacity = 0;
            }

            if(!$.isEmptyObject(actions)) {
                $.each(actions, function(name, fn) {
                    optObj[name] = fn;
                });
            }

            return new MapObject(optObj);
        };

        //Генерирует новый static-DIV, проверяет на наличие других static-DIV и удаляет дубли
        var _onClick = function() {

            if($.isFunction(settings.onClick)) {
                settings.onClick.call(this);
            }

            if(!settings.setClick) {
                return false;
            }

            var objId = $(this).attr("id");
            
            //Ищем уже созданный static-DIV внутри заданного элемента
            var staticFill = _el.find("." + settings.itemStaticName);

            if(staticFill.length > 0) {
                var staticId = staticFill.data("id");
                _setOpacity(staticId, settings.fillOpacity, objId, "0", methods.removeOne.bind(this, settings.itemStaticName));
            }

            var render = _searchAndRenderObj(objId, "static");

            if(render) {
                _showOne(settings.itemStaticName, 0, _setOpacity.bind(this, objId, "0", objId));
            }

            methods.removeOne(settings.itemHoverName);
        };

        //Генерирует новый hover-DIV
        var _mouseOver = function() {
            var objId = $(this).attr("id");

            if($.isFunction(settings.mouseOver)) {
                settings.mouseOver.call(this);
            }

            var render = _searchAndRenderObj(objId, "hover");

            if(render) {
                _showOne(settings.itemHoverName, 0, _setOpacity.bind(this, objId, "0", false));
            }
        };

        //Удаляет hover-DIV
        var _mouseOut = function() {
            var objId = $(this).attr("id");

            if($.isFunction(settings.mouseOut)) {
                settings.mouseOut.call(this);
            }

            _setOpacity(objId, settings.fillOpacity, false, "0", methods.removeOne.bind(this, settings.itemHoverName));
        };

        //Возвращает объект пользовательских функций элементов карты
        var _itemsActions = function() {
            return {
                click: _onClick,
                mouseover: _mouseOver,
                mouseout: _mouseOut
            }
        };

        //Проверяет основной элемент плагина на наличие изображения
        var _checkImg = function() {
            var img = $(_el).find("img");

            if(img.length > 0) {
                return img;
            }

            return false;
        };

        //Если задан параметр fadeTime, то выводит элементы карты с задержкой
        var _showItems = function() {

            _itemsShowed = true;

            var fadeTime = parseInt(settings.fadeTime);
            var count = (settings.setPause) ? 1 : 0;
            var promises = [];

            //Если задан параметр setQueue, то элементы выводятся в порядке очереди
            if(!settings.setQueue) {
                $.each(_itemsScope, function(key, item) {
                    var query = "." + item.id;

                    promises.push($(query).fadeIn(fadeTime).promise());
                });
            }
            else {
                $.each(_itemsScope, function(key, item) {
                    var id = item.id;

                    promises.push(_showByOne.call(this, id, fadeTime, count));

                    count++;
                });
            }
            
            if($.isFunction(settings.onRender)) {
                $.when.apply(this, promises).done(settings.onRender);
            }
        };

        //Показывает сгенерированный DIV в соответствии с параметром fadeTime
        var _showByOne = function(id, time, count) {
            
            var self = null;

            var dfd = new $.Deferred();

            setTimeout(function() {

                var search = $("." + id);

                var deferred = search.fadeIn(time, function() { self = search; } ).promise();

                $.when(deferred).done(function() {
                    return dfd.resolve.apply(self);
                });
            }, time * count);

            return dfd.promise();
        };

        //Изменяет прозрачность активного элемента через свойство opacity
        var _setOpacity = function(id, value, item, fadeTime, callback) {

            callback = callback || function() {};

            var time = 0;

            if(typeof fadeTime !== "undefined" && parseFloat(fadeTime) > 0) {
                time = fadeTime;
            }

            //Устанавливаем флаг, для того, чтобы при выборе элемента не было наложения фона
            if(typeof item !== "undefined" && item !== false) {
                _anchor = item;
            }

            if (_anchor != id) {
                $("#" + id).fadeTo(time, value, callback);
            }
        };

        //Выводит на экран один элемент по заданному классу
        var _showOne = function(className, fadeTime, callback) {

            callback = callback || function() {};

            var time = 0;

            if(typeof fadeTime !== "undefined" && parseFloat(fadeTime) > 0) {
                time = fadeTime;
            }

            $("." + className).fadeIn(time, callback);
        };

        //Ищет в массиве объект по Id, если находит, то рендерит его
        var _searchAndRenderObj = function(objId, type) {

            var curItem = $.grep(_itemsScope, function(e){ return e.id == objId; });

            if(curItem.length == 1) {
                _renderObj.renderObject(curItem[0], type);
                return curItem[0];
            }

            return false;
        };

        //Рендерим сгенерированные элементы
        var _renderItems = function() {
            $.each(_itemsScope, function(key, item) {
                _renderOne(item);
            });

            return true;
        };

        //Рендерит один сгенерированный элемент
        var _renderOne = function(item) {

            _renderObj.renderObject(item, item.type);

            if(settings.showBorder && item.type === "base") {
                _renderObj.renderObject(item, "border");
            }

            if(item.isActive) {
                _renderObj.renderObject(item, "static");
            }

            return true;
        };

        //Создает объекты на основе JSON
        var _createDataObj = function(data, name) {

            if(typeof data === "undefined") {
                throw "You should pass first parameter " + name + " as Object or JSON";
            }

            try {
                if (typeof data === 'object') {
                    return data;
                }
                else if (typeof data === 'string') {
                    return JSON.parse(data);
                }
                else {
                    return false;
                }
            } catch(e) {
                console.log("Incorrect data type in " + name + ". Error - " + e.message);
                return false;
            }
        };

        //Сортировка активного элемента
        var _sortItems = function() {

            var activeIndex = null;
            var activeSort = null;
            var placeIndex = null;

            $.each(_itemsScope, function(index, obj) {
                if(obj.isActive) {
                    activeIndex = index;
                }
            });

            if(settings.showOptionsObj.hasOwnProperty("activeItemSort")) {
                activeSort = settings.showOptionsObj["activeItemSort"];

                if(activeSort === "first") {
                    placeIndex = 0;
                }
                else if(activeSort === "last") {
                    placeIndex = _itemsScope.length;
                }

                //Если задан параметр activeItemSort, то помещаем выбраный элемент в начало или конец массива
                if(activeIndex !== null && placeIndex !== null) {
                    _itemsScope.splice(placeIndex, 0, _itemsScope.splice(activeIndex, 1)[0]);
                }
            }
        };

        //Создаем фабрику рендеринга, чтобы обеспечить единую область видимости для всех методов
        var _renderMethods = function() {

            var renderObj = {

                //Рендерит базовый DIV из заданного объекта
                renderObject: function (item, type) {

                    this.newItem = document.createElement('DIV');
                    this.item = item;

                    this.defaultStyle = {
                        display: item.display,
                        position: item.position,
                        cursor: item.cursor,
                        top: item.top,
                        left: item.left,
                        width: item.width,
                        height: item.height,
                        border: item.border
                    };

                    if (type === "base") {
                        renderObj.renderBaseObj.call(this);
                    }
                    else if(type === "border") {
                        renderObj.renderBorderObj.call(this);
                    }
                    else if (type === "hover") {
                        renderObj.renderHoverObj.call(this);
                    }
                    else if (type === "static") {
                        renderObj.renderStaticObj.call(this);
                    }

                    $(this.newItem).css(this.defaultStyle);

                    _el.append(this.newItem);
                },

                //Генерирует основной DIV на странице и его методы
                renderBaseObj: function () {

                    this.newItem.id = this.item.id;
                    this.newItem.className = settings.itemName + " " + this.item.id; //Добавляем id, чтобы можно было задействовать метод removeOne
                    this.defaultStyle.zIndex = this.item.zIndex;

                    this.defaultStyle.backgroundColor = this.item.fillColor;
                    this.defaultStyle.opacity = this.item.fillOpacity;

                    $(this.newItem).bind("click", this.item.click);
                    $(this.newItem).bind("mouseover", this.item.mouseover);
                    $(this.newItem).bind("mouseout", this.item.mouseout);

                    $(this.newItem).attr("data-name", this.item.name);
                    $(this.newItem).attr("data-value", this.item.value);
                },

                //Генерирует DIV границ активных элементов
                renderBorderObj: function () {

                    this.newItem.className = settings.itemBorderName + " " + this.item.id;

                    this.defaultStyle.zIndex = settings.borderZIndex;
                },

                //Генерирует DIV при наведении
                renderHoverObj: function () {

                    this.newItem.className = settings.itemHoverName + " " + this.item.id;
                    this.defaultStyle.zIndex = settings.hoverZIndex;

                    this.defaultStyle.backgroundColor = this.item.hoverFillColor;
                    this.defaultStyle.opacity = this.item.hoverFillOpacity;

                    $(this.newItem).attr("data-id", this.item.id);
                },

                //Генерирует статический DIV
                renderStaticObj : function () {

                    this.newItem.className = settings.itemStaticName + " " + this.item.id;
                    this.defaultStyle.zIndex = settings.staticZIndex;

                    this.defaultStyle.backgroundColor = this.item.staticFillColor;
                    this.defaultStyle.opacity = this.item.staticFillOpacity;

                    $(this.newItem).attr("data-id", this.item.id);
                }
            };

            return renderObj;
        };

        var methods = {

            //Точка входа, генерирует объекты карты
            createItems: function () {

                settings.coordsObj = _createDataObj(settings.coordsObj, "coordsObj");
                settings.dataObj = _createDataObj(settings.dataObj, "dataObj");
                settings.showOptionsObj = _createDataObj(settings.showOptionsObj, "showOptionsObj");

                if (!settings.coordsObj || !settings.dataObj || !settings.showOptionsObj) {
                    return false;
                }

                $.each(settings.coordsObj, function (key, coords) {

                    settings.zIndex++;

                    var data = (settings.dataObj.hasOwnProperty(key)) ? settings.dataObj[key] : "";

                    _itemsScope.push(_createObject(key, coords, data, _itemsActions()));
                });

                //Если нет необходимости выводить границы, то выставляем этот параметр в 0
                if(!settings.showBorder) {
                    settings.strokeWidth = 0;
                }

                //Устанавливаем объекту _renderObj основные методы ренедеринга
                _renderObj = _renderMethods();

                //Сортируем массив по заданным параметрам
                _sortItems();

                //Проверяем на наличие изображения внутри контейнера
                var _img = _checkImg();

                //Если изображение есть, то ждем пока оно загрузится, в противном случае, грузим сгенерированные DIV сразу
                if (_img) {
                    //Добавляем к изображению рандомный параметр, чтобы сработало load в IE
                    var image = $(_img).attr("src", function(i, val) {
                        return val + "?" + new Date().getTime();
                    });
                    $(image).bind({
                        load: function () {

                            //Запрещаем повторный вызов для FF29
                            if(_itemsShowed) {
                                return false;
                            }

                            var render = _renderItems();

                            if (render) {
                                _showItems();
                            }
                        },
                        error: function () {
                            throw "Image wasn't loaded";
                        }
                    });
                }
                else {
                    var render = _renderItems();

                    if (render) {
                        _showItems();
                    }
                }
            },

            //Генерирует один активный объект карты
            createOne: function (coords, data, showOpt) {

                var coordsObj = {}, dataObj = {}, settingsObj = {};

                coordsObj = _createDataObj(coords, "coords");
                dataObj = _createDataObj(data, "data");
                settingsObj = _createDataObj(showOpt, "showOpt");

                if (!coordsObj || !dataObj || !settingsObj) {
                    return false;
                }

                //Ограничиваем цикл одной итерацией
                var checkLoop = 0;

                $.each(coordsObj, function (key, coords) {

                    if (checkLoop >= 1) {
                        return false;
                    }

                    settings.zIndex++;

                    var data = (dataObj.hasOwnProperty(key)) ? dataObj[key] : "";

                    var itemObject = _createObject(key, coords, data, _itemsActions());

                    _itemsScope.push(itemObject);

                    var render = _renderOne(itemObject);

                    if (render) {
                        _showOne(itemObject.id, settings.fadeTime);
                    }

                    checkLoop++;
                });
            },

            //Удаляет все элементы
            removeItems: function () {
                _el.find("." + settings.itemName).remove();
                _el.find("." + settings.itemBorderName).remove();
                _el.find("." + settings.itemHoverName).remove();
                _el.find("." + settings.itemStaticName).remove();

                _itemsScope.length = 0;

                if ($.isFunction(settings.onRemove)) {
                    settings.onRemove.call(_el);
                }
            },

            //Удаляет заданный DIV
            removeOne: function (className) {
                _el.find("." + className).remove();
            }
        };

        return methods;
    }

}(jQuery));