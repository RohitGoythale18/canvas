export const createConnectorShape = (): SVGElement => {
    const shapeElement = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    shapeElement.setAttribute("cx", "50");
    shapeElement.setAttribute("cy", "50");
    shapeElement.setAttribute("r", "20");
    shapeElement.setAttribute("fill", "#FFFFFF");
    shapeElement.setAttribute("stroke", "#000000");
    shapeElement.setAttribute("stroke-width", "2");
    return shapeElement;
};
