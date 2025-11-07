export const createBentArrowShape = (): SVGElement => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "100");
    svg.setAttribute("height", "100");
    svg.setAttribute("viewBox", "0 0 100 100");

    // Bent arrow path
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M10 50 L50 50 L50 20 L80 50 L50 80 L50 50");
    path.setAttribute("stroke", "#000");
    path.setAttribute("stroke-width", "4");
    path.setAttribute("fill", "none");

    // Arrowhead
    const arrowhead = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    arrowhead.setAttribute("points", "80,50 70,40 70,60");
    arrowhead.setAttribute("fill", "#000");

    svg.appendChild(path);
    svg.appendChild(arrowhead);

    return svg;
};
