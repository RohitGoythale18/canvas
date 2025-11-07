export const createManualInputShape = (): SVGElement => {
    const shapeElement = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    shapeElement.setAttribute("points", "0,30 80,0 100,30 80,60 0,60");
    shapeElement.setAttribute("fill", "#FFFFFF");
    shapeElement.setAttribute("stroke", "#000000");
    shapeElement.setAttribute("stroke-width", "2");
    return shapeElement;
};
