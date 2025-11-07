export const createDatabaseShape = (): SVGElement => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "100");
    svg.setAttribute("height", "60");

    const ellipse1 = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
    ellipse1.setAttribute("cx", "50");
    ellipse1.setAttribute("cy", "20");
    ellipse1.setAttribute("rx", "40");
    ellipse1.setAttribute("ry", "15");
    ellipse1.setAttribute("fill", "#FFFFFF");
    ellipse1.setAttribute("stroke", "#000000");
    ellipse1.setAttribute("stroke-width", "2");

    const ellipse2 = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
    ellipse2.setAttribute("cx", "50");
    ellipse2.setAttribute("cy", "40");
    ellipse2.setAttribute("rx", "40");
    ellipse2.setAttribute("ry", "15");
    ellipse2.setAttribute("fill", "#FFFFFF");
    ellipse2.setAttribute("stroke", "#000000");
    ellipse2.setAttribute("stroke-width", "2");

    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", "10");
    line.setAttribute("y1", "20");
    line.setAttribute("x2", "90");
    line.setAttribute("y2", "20");
    line.setAttribute("stroke", "#000000");
    line.setAttribute("stroke-width", "2");

    svg.appendChild(ellipse1);
    svg.appendChild(ellipse2);
    svg.appendChild(line);

    return svg;
};
