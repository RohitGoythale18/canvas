export const createCircularArrowShape = (): SVGElement => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "100");
    svg.setAttribute("height", "100");
    svg.setAttribute("viewBox", "0 0 100 100");

    // Circular path
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", "50");
    circle.setAttribute("cy", "50");
    circle.setAttribute("r", "30");
    circle.setAttribute("stroke", "#000");
    circle.setAttribute("stroke-width", "4");
    circle.setAttribute("fill", "none");

    // Arrowhead on the circle
    const arrowhead = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    arrowhead.setAttribute("points", "80,50 70,45 70,55");
    arrowhead.setAttribute("fill", "#000");

    svg.appendChild(circle);
    svg.appendChild(arrowhead);

    return svg;
};
