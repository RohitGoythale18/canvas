export const createFrameShape = (): SVGElement => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "100");
    svg.setAttribute("height", "60");
    svg.setAttribute("viewBox", "0 0 100 60");

    // Outer frame
    const outerRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    outerRect.setAttribute("x", "0");
    outerRect.setAttribute("y", "0");
    outerRect.setAttribute("width", "100");
    outerRect.setAttribute("height", "60");
    outerRect.setAttribute("fill", "none");
    outerRect.setAttribute("stroke", "#000");
    outerRect.setAttribute("stroke-width", "3");

    // Inner frame
    const innerRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    innerRect.setAttribute("x", "10");
    innerRect.setAttribute("y", "10");
    innerRect.setAttribute("width", "80");
    innerRect.setAttribute("height", "40");
    innerRect.setAttribute("fill", "none");
    innerRect.setAttribute("stroke", "#000");
    innerRect.setAttribute("stroke-width", "1");

    svg.appendChild(outerRect);
    svg.appendChild(innerRect);

    return svg;
};
