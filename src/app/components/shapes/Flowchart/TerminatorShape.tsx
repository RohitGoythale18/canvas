export const createTerminatorShape = (): SVGElement => {
    const shapeElement = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    shapeElement.setAttribute("x", "0");
    shapeElement.setAttribute("y", "0");
    shapeElement.setAttribute("width", "100");
    shapeElement.setAttribute("height", "60");
    shapeElement.setAttribute("rx", "30");
    shapeElement.setAttribute("fill", "#FFFFFF");
    shapeElement.setAttribute("stroke", "#000000");
    shapeElement.setAttribute("stroke-width", "2");
    return shapeElement;
};
