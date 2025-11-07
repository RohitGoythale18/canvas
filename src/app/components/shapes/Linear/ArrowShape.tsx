export const createArrowShape = (): SVGElement => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "100");
    svg.setAttribute("height", "100");
    svg.setAttribute("viewBox", "0 0 100 100");

    // Arrow shaft
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", "10");
    line.setAttribute("y1", "50");
    line.setAttribute("x2", "80");
    line.setAttribute("y2", "50");
    line.setAttribute("stroke", "#000");
    line.setAttribute("stroke-width", "4");

    // Arrowhead
    const arrowhead = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    arrowhead.setAttribute("points", "80,50 70,40 70,60");
    arrowhead.setAttribute("fill", "#000");

    svg.appendChild(line);
    svg.appendChild(arrowhead);

    return svg;
};
