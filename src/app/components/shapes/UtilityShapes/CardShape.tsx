export const createCardShape = (): SVGElement => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "100");
    svg.setAttribute("height", "60");
    svg.setAttribute("viewBox", "0 0 100 60");

    // Card background
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", "5");
    rect.setAttribute("y", "5");
    rect.setAttribute("width", "90");
    rect.setAttribute("height", "50");
    rect.setAttribute("rx", "5");
    rect.setAttribute("ry", "5");
    rect.setAttribute("fill", "#fff");
    rect.setAttribute("stroke", "#ccc");
    rect.setAttribute("stroke-width", "1");

    // Card title
    const title = document.createElementNS("http://www.w3.org/2000/svg", "text");
    title.setAttribute("x", "50");
    title.setAttribute("y", "20");
    title.setAttribute("text-anchor", "middle");
    title.setAttribute("fill", "#333");
    title.setAttribute("font-size", "10");
    title.setAttribute("font-family", "Arial, sans-serif");
    title.setAttribute("font-weight", "bold");
    title.textContent = "Card Title";

    // Card content
    const content = document.createElementNS("http://www.w3.org/2000/svg", "text");
    content.setAttribute("x", "50");
    content.setAttribute("y", "35");
    content.setAttribute("text-anchor", "middle");
    content.setAttribute("fill", "#666");
    content.setAttribute("font-size", "8");
    content.setAttribute("font-family", "Arial, sans-serif");
    content.textContent = "Card content";

    svg.appendChild(rect);
    svg.appendChild(title);
    svg.appendChild(content);

    return svg;
};
