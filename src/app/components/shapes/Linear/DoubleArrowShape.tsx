export const createDoubleArrowShape = (): SVGElement => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "100");
    svg.setAttribute("height", "100");
    svg.setAttribute("viewBox", "0 0 100 100");

    // Arrow shaft
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", "10");
    line.setAttribute("y1", "50");
    line.setAttribute("x2", "90");
    line.setAttribute("y2", "50");
    line.setAttribute("stroke", "#000");
    line.setAttribute("stroke-width", "4");

    // Left arrowhead
    const leftArrowhead = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    leftArrowhead.setAttribute("points", "10,50 20,40 20,60");
    leftArrowhead.setAttribute("fill", "#000");

    // Right arrowhead
    const rightArrowhead = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    rightArrowhead.setAttribute("points", "90,50 80,40 80,60");
    rightArrowhead.setAttribute("fill", "#000");

    svg.appendChild(line);
    svg.appendChild(leftArrowhead);
    svg.appendChild(rightArrowhead);

    return svg;
};
