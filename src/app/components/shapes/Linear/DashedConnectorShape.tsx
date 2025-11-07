export const createDashedConnectorShape = (): SVGElement => {
    const shapeElement = document.createElementNS("http://www.w3.org/2000/svg", "line");
    shapeElement.setAttribute("x1", "10");
    shapeElement.setAttribute("y1", "50");
    shapeElement.setAttribute("x2", "90");
    shapeElement.setAttribute("y2", "50");
    shapeElement.setAttribute("stroke", "#000");
    shapeElement.setAttribute("stroke-width", "4");
    shapeElement.setAttribute("stroke-dasharray", "10,5");
    return shapeElement;
};
