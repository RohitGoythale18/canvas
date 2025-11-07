export const createSplitArrowShape = (): SVGElement => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "100");
    svg.setAttribute("height", "100");
    svg.setAttribute("viewBox", "0 0 100 100");

    // Main shaft
    const mainLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
    mainLine.setAttribute("x1", "10");
    mainLine.setAttribute("y1", "50");
    mainLine.setAttribute("x2", "50");
    mainLine.setAttribute("y2", "50");
    mainLine.setAttribute("stroke", "#000");
    mainLine.setAttribute("stroke-width", "4");

    // Split lines
    const splitLine1 = document.createElementNS("http://www.w3.org/2000/svg", "line");
    splitLine1.setAttribute("x1", "50");
    splitLine1.setAttribute("y1", "50");
    splitLine1.setAttribute("x2", "80");
    splitLine1.setAttribute("y2", "30");
    splitLine1.setAttribute("stroke", "#000");
    splitLine1.setAttribute("stroke-width", "4");

    const splitLine2 = document.createElementNS("http://www.w3.org/2000/svg", "line");
    splitLine2.setAttribute("x1", "50");
    splitLine2.setAttribute("y1", "50");
    splitLine2.setAttribute("x2", "80");
    splitLine2.setAttribute("y2", "70");
    splitLine2.setAttribute("stroke", "#000");
    splitLine2.setAttribute("stroke-width", "4");

    // Arrowheads
    const arrowhead1 = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    arrowhead1.setAttribute("points", "80,30 70,25 70,35");
    arrowhead1.setAttribute("fill", "#000");

    const arrowhead2 = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    arrowhead2.setAttribute("points", "80,70 70,65 70,75");
    arrowhead2.setAttribute("fill", "#000");

    svg.appendChild(mainLine);
    svg.appendChild(splitLine1);
    svg.appendChild(splitLine2);
    svg.appendChild(arrowhead1);
    svg.appendChild(arrowhead2);

    return svg;
};
