export const createDecisionShape = (): SVGElement => {
    const shapeElement = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    shapeElement.setAttribute("points", "50,0 100,50 50,100 0,50");
    shapeElement.setAttribute("fill", "#FFFFFF");
    shapeElement.setAttribute("stroke", "#000000");
    shapeElement.setAttribute("stroke-width", "2");
    return shapeElement;
};
