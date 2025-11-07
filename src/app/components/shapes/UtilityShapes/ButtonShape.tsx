export const createButtonShape = (): SVGElement => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "100");
    svg.setAttribute("height", "40");
    svg.setAttribute("viewBox", "0 0 100 40");

    // Button background
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", "5");
    rect.setAttribute("y", "5");
    rect.setAttribute("width", "90");
    rect.setAttribute("height", "30");
    rect.setAttribute("rx", "5");
    rect.setAttribute("ry", "5");
    rect.setAttribute("fill", "#007bff");
    rect.setAttribute("stroke", "#0056b3");
    rect.setAttribute("stroke-width", "1");

    // Button text
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", "50");
    text.setAttribute("y", "25");
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("fill", "#fff");
    text.setAttribute("font-size", "12");
    text.setAttribute("font-family", "Arial, sans-serif");
    text.textContent = "Button";

    svg.appendChild(rect);
    svg.appendChild(text);

    return svg;
};
