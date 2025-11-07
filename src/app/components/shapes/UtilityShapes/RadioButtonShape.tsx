export const createRadioButtonShape = (): SVGElement => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "30");
    svg.setAttribute("height", "30");
    svg.setAttribute("viewBox", "0 0 30 30");

    // Outer circle
    const outerCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    outerCircle.setAttribute("cx", "15");
    outerCircle.setAttribute("cy", "15");
    outerCircle.setAttribute("r", "10");
    outerCircle.setAttribute("fill", "#fff");
    outerCircle.setAttribute("stroke", "#000");
    outerCircle.setAttribute("stroke-width", "2");

    // Inner dot
    const innerCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    innerCircle.setAttribute("cx", "15");
    innerCircle.setAttribute("cy", "15");
    innerCircle.setAttribute("r", "5");
    innerCircle.setAttribute("fill", "#000");

    svg.appendChild(outerCircle);
    svg.appendChild(innerCircle);

    return svg;
};
