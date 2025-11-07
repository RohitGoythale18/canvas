export const createDelayShape = (): SVGElement => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "100");
    svg.setAttribute("height", "60");

    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", "10");
    rect.setAttribute("y", "20");
    rect.setAttribute("width", "60");
    rect.setAttribute("height", "40");
    rect.setAttribute("fill", "#FFFFFF");
    rect.setAttribute("stroke", "#000000");
    rect.setAttribute("stroke-width", "2");

    const line1 = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line1.setAttribute("x1", "70");
    line1.setAttribute("y1", "20");
    line1.setAttribute("x2", "80");
    line1.setAttribute("y2", "10");
    line1.setAttribute("stroke", "#000000");
    line1.setAttribute("stroke-width", "2");

    const line2 = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line2.setAttribute("x1", "80");
    line2.setAttribute("y1", "10");
    line2.setAttribute("x2", "90");
    line2.setAttribute("y2", "20");
    line2.setAttribute("stroke", "#000000");
    line2.setAttribute("stroke-width", "2");

    svg.appendChild(rect);
    svg.appendChild(line1);
    svg.appendChild(line2);

    return svg;
};
