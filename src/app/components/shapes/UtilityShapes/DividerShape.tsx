export const createDividerShape = (): SVGElement => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "100");
    svg.setAttribute("height", "10");
    svg.setAttribute("viewBox", "0 0 100 10");

    // Divider line
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", "0");
    line.setAttribute("y1", "5");
    line.setAttribute("x2", "100");
    line.setAttribute("y2", "5");
    line.setAttribute("stroke", "#ccc");
    line.setAttribute("stroke-width", "2");

    svg.appendChild(line);

    return svg;
};
