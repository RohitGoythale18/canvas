export const createCurvedArrowShape = (): SVGElement => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "100");
    svg.setAttribute("height", "100");
    svg.setAttribute("viewBox", "0 0 100 100");

    // Curved path
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M10 80 Q50 20 90 80");
    path.setAttribute("stroke", "#000");
    path.setAttribute("stroke-width", "4");
    path.setAttribute("fill", "none");

    // Arrowhead
    const arrowhead = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    arrowhead.setAttribute("points", "90,80 80,70 80,90");
    arrowhead.setAttribute("fill", "#000");

    svg.appendChild(path);
    svg.appendChild(arrowhead);

    return svg;
};
