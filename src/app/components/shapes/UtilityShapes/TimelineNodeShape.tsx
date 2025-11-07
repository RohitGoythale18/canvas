export const createTimelineNodeShape = (): SVGElement => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "100");
    svg.setAttribute("height", "50");
    svg.setAttribute("viewBox", "0 0 100 50");

    // Timeline line
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", "0");
    line.setAttribute("y1", "25");
    line.setAttribute("x2", "100");
    line.setAttribute("y2", "25");
    line.setAttribute("stroke", "#ccc");
    line.setAttribute("stroke-width", "2");

    // Node circle
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", "50");
    circle.setAttribute("cy", "25");
    circle.setAttribute("r", "10");
    circle.setAttribute("fill", "#007bff");
    circle.setAttribute("stroke", "#0056b3");
    circle.setAttribute("stroke-width", "2");

    // Node text
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", "50");
    text.setAttribute("y", "30");
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("fill", "#fff");
    text.setAttribute("font-size", "10");
    text.setAttribute("font-family", "Arial, sans-serif");
    text.textContent = "1";

    svg.appendChild(line);
    svg.appendChild(circle);
    svg.appendChild(text);

    return svg;
};
