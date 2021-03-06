##1. Введение:
InteractiveMap –jQuery плагин, который позволяет реализовать вывод активных областей на документе с возможностью задавать цвет, границу и прозрачность фона.
Основные данные для плагина можно передавать как в виде стандартного JavaScript объекта, так и в формате JSON, последнее позволяет синхронизировать плагин с
серверной частью web-приложения и реализовать динамическое добавление элементов.

##2. Возможности:
- Вывод активных областей на изображениях и любых блочных элементах страницы;
- Возможности динамически изменять основные настройки плагина через JSON;
- Простая синхронизация с AJAX;
- Возможность задавать прозрачность активных областей и задавать цвет через псевдонимы;
- Широкие возможности по настройке активных областей;
- Поддержка пользовательских функций.

##3. Демо:
http://larin-dev.ru/projects/interactive-map/
http://larin-dev.ru/projects/railwagon/

##4. Базовое использование:
Плагин можно применять к любым блочным элементам и изображениям на странице.
Если элемент не является изображением, для того чтобы плагин правильно определил координаты активных областей, элемент для которого он вызывается должен иметь позицию relative.
Если элемент является изображением, то вывод активных областей произойдет сразу после загрузки изображения.

Для подключения плагина используйте следующий код:

```
$("#yourId").interactiveMap({
        coordsObj: { "item1" : "top": "52", "left": "396", "height" : "31", "width" : "31",  “item2”:  "top": "52", "left": "539", "height" : "93", "width" : "86" },
        dataObj: {“item1”: “some data to item 1”, “item2”: “some data to item 2” },
        setQueue: true,
        onClick: someFunction,
});});
```

##5. Опции:
**coordsObj** - Объект или JSON с координатами элементов. Координаты могут быть заданы как в CSS-виде, с помощью { top: 100, left: 100, width: 100, height: 100 }, так и виде точек-координат {x1, y1, x2, y2}.

**dataObj** - Объект или JSON содержащий данные элементов. Для того, чтобы данные привязывались в правильном порядке, ключи dataObj должны полностью соответствовать ключам coordsObj.

**showOptionsObj** - Опции вывода активных областей. Может содержать следующие ключи:

1. activeItem: "ключ coordsObj" – Выделять активную область сразу после загрузки страницы;
2. activeItemSort : "last|first" – Выделяет активную область с помощью статического фона в начале (first) или в конце загрузки (last). Если параметр не задан, то будет выводиться в порядке очереди;
3. Также в данном объекте можно переопределить свойства "fillColor", "hoverFillColor", "staticFillColor" для каждой активной области:  "ключ coordsObj": { "hoverFillColor" : "blue" }.

**strokeColor** - Цвет границы.

**strokeWidth** - Толщина границы.

**strokeType** - Тип границы.

**fadeTime** - Время появления.

**showBorder** - Показывать границу.

**fillColor** - Цвет фона  активных областей.

**fillOpacity** - Прозрачность фона активных областей.

**hoverFillColor** - Цвет при наведении.

**hoverFillOpacity** - Прозрачность фона при наведении.

**staticFillColor** - Цвет фона статики.

**staticFillOpacity** - Прозрачность фона статики.

**setStati**c - Устанавливать статический фон при нажатии.

**hideStatic** - Позволяет удалять статический фон при нажатии.

**setQueue** - Последовательный вывод элементов.

**setPause** - Устанавливает паузу равную fadeTime при начале вывода элементов в очереди.

**enableClose** - Дает возможность удалять элементы вручную.

**setStaticClose** - Оставляет close кнопку для статического элемента.

**onClick** - Пользовательское действие на click.

**onClose** - Пользовательское действие на событие close.

**onStaticClick** - Пользовательсткое действие при нажатии по статическому элементу.

**onMouseOut** - Пользовательское действие на mouseout.

**onMouseOver** - Пользовательское действие на mouseover.

**onRender** - Пользовательское действие после рендеринга всех объектов.

**onRemove** - Пользовательское действие после удаления всех объектов.

##6. API-методы
**createItems()** - Создает видимые объекты карты после инициализации плагина.

**createOne(coords, data, options)** - Принимает объект или JSON с координатами, информацией и дополнительными опциями активной области и выводит ее на экран.

**removeItems()** - Удаляет все активные области.

**removeOne(className)** - Удаляет активную область по имени класса.

