export const createDocumentShape = (): SVGElement => {
    const shapeElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
    shapeElement.setAttribute("d", "M0 0 L100 0 L100 80 L50 100 L0 80 Z");
    shapeElement.setAttribute("fill", "#FFFFFF");
    shapeElement.setAttribute("stroke", "#000000");
    shapeElement.setAttribute("stroke-width", "2");
    return shapeElement;
};
