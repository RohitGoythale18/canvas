export const createTabShape = (): SVGElement => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "80");
    svg.setAttribute("height", "40");
    svg.setAttribute("viewBox", "0 0 80 40");

    // Tab shape using path
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M10 30 Q10 10 30 10 L50 10 Q60 10 60 20 L60 30 Z");
    path.setAttribute("fill", "#f0f0f0");
    path.setAttribute("stroke", "#ccc");
    path.setAttribute("stroke-width", "1");

    // Tab text
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", "40");
    text.setAttribute("y", "25");
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("fill", "#333");
    text.setAttribute("font-size", "10");
    text.setAttribute("font-family", "Arial, sans-serif");
    text.textContent = "Tab";

    svg.appendChild(path);
    svg.appendChild(text);

    return svg;
};
