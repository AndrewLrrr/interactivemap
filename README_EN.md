##1. Introduction:
InteractiveMap - jQuery plugin that allows for the conclusion of active regions on the document with the ability to set the color, border and background transparency.
Basic data for the plug-in can be transmitted in the form of a standard JavaScript object, and in the format JSON, the last plug-in allows you to synchronize
web-server-side applications and realize the dynamic addition of elements.

##2. Features:
- Conclusion of the active regions in the images and any block page elements;
- The ability to dynamically change the basic settings via the plug-in JSON;
- Easy synchronization with AJAX;
- Ability to set the transparency of the active regions, and set the color by an alias;
- Ample opportunities to configure the active regions;
- Support for user-defined functions.

##3. Demo:
http://larin-dev.ru/projects/interactive-map/
http://larin-dev.ru/projects/railwagon/

##4. Basic use:
The plug-in can be applied to any block elements and images on the page.
If the item is not an image in order to plug-in correctly identified the location of the active regions, the element for which it is invoked is to have a relative position.
If the item is an image, the output of the active regions occur immediately after loading the image.

To connect a plug-in, use the following code:

```
$("#yourId").interactiveMap({
        coordsObj: { "item1" : "top": "52", "left": "396", "height" : "31", "width" : "31",  “item2”:  "top": "52", "left": "539", "height" : "93", "width" : "86" },
        dataObj: {“item1”: “some data to item 1”, “item2”: “some data to item 2” },
        setQueue: true,
        onClick: someFunction,
});});
```

##5. Options:
coordsObj - Object or JSON containing coordinates elements. The coordinates can be specified in CSS-form, using {top: 100, left: 100, width: 100, height: 100}, and the form of coordinates points {x1, y1, x2, y2}.

dataObj - Object or JSON containing the data of elements. To these were tied in the correct order, the keys dataObj must fully comply with keys coordsObj

showOptionsObj - Object or JSON containing additional options for active regions. It may contain the following keys:
  1. activeItem - highlight the active area immediately after the page will be loaded (activeItem: coordsObj.key)
  2. activeItemSort - highlights the active region at the beginning (first) or at the end load (last). If not specified, it will be highlighted in sequence (activeItemSort: "last | first")
  3. Also you can redefined properties "fillColor", "hoverFillColor", "staticFillColor" for each of the active region (coordsObj.key: {"hoverFillColor": "blue"})

strokeColor - A string that prepended the color of the border. Can be HEX, RGB or alias. Default: #ffffff

strokeWidth - A number that prepended the thickness of the border. Default: 2

strokeType - A number that prepended the type of border. Can be one of dotted, solid, double or dashed. Default: solid

fadeTime - A number that prepended the time of occurrence. Default: 500

showBorder - If set to true the border will be displayed. Default: true

fillColor - A string that prepended the background color of the active regions. Can be HEX, RGB or alias. Default: #ffffff

fillOpacity - A double that prepended the transparency of the background of the active regions. Can be between 0 or 1. Default: 0.5

hoverFillColor - A string that prepended the background color of the hover active regions. Can be HEX, RGB or alias. Default: red

hoverFillOpacity - A double that prepended the transparency of the background hover active regions. Can be between 0 or 1. Default: 0.5

staticFillColor - A string that prepended the background color of the highlight active region. Default: #green

staticFillOpacity - A double that prepended the transparency of the background the highlight active region. Can be between 0 or Default: 0.5

setStatic - If set to true active region will be highlighted after click. Default: true

hideStatic - If set to true highlighted will be remove after click on the same active region. Default: false

setQueue - If set to true active regions will be show up in queue. Default: false

setPause- If set to true set pauses equal fadeTime at the beginning of the withdrawal of active regions in the queue. Default: false

enableClose - If set to true allows you to delete active regions manually. Default: false

setStaticClose - If set to true leaves a close button for a highlight element. Default: true

onClick - Callback function called when active region clicks

onClose - Callback function called when active region closes

onStaticClick - Callback function called when highlight region clicks

onMouseOut - Callback function called when active region mouse out

onMouseOver - Callback function called when active region mouse on

onRender - Callback function called when active regions render

onRemove - Callback function called when active regions remove

##6. API-methods:
createItems() - Creates a visible objects of map after plugin initialization

createOne(coords, data, options) - Takes a Object or JSON of coordinates, information and additional options for active regions and displays them on the screen.

removeItems() - Removes all active regions

removeOne(className) - Removes the active region by the name of the class
