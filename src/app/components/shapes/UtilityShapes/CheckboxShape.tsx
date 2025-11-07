export const createCheckboxShape = (): SVGElement => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "30");
    svg.setAttribute("height", "30");
    svg.setAttribute("viewBox", "0 0 30 30");

    // Checkbox square
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", "5");
    rect.setAttribute("y", "5");
    rect.setAttribute("width", "20");
    rect.setAttribute("height", "20");
    rect.setAttribute("fill", "#fff");
    rect.setAttribute("stroke", "#000");
    rect.setAttribute("stroke-width", "2");

    // Checkmark
    const check = document.createElementNS("http://www.w3.org/2000/svg", "path");
    check.setAttribute("d", "M8 15 L12 19 L22 9");
    check.setAttribute("stroke", "#000");
    check.setAttribute("stroke-width", "2");
    check.setAttribute("fill", "none");

    svg.appendChild(rect);
    svg.appendChild(check);

    return svg;
};
