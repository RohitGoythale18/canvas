'use client';
import { useState } from "react";
import { ShapeButtonProps, ShapeCategory } from "@/types";
import Image from "next/image";

import { Menu, Box, Tabs, Tab, Tooltip, Button } from "@mui/material";
import ShapesIcon from "@mui/icons-material/Category";

const shapeCategories: ShapeCategory[] = [
    {
        category: "Basic Shapes",
        shapes: [
            { name: "Rectangle", file: "RectangleShape.tsx" },
            { name: "Square", file: "SquareShape.tsx" },
            { name: "Circle", file: "CircleShape.tsx" },
            { name: "Ellipse / Oval", file: "EllipseShape.tsx" },
            { name: "Line", file: "LineShape.tsx" },
            { name: "Triangle", file: "TriangleShape.tsx" },
            { name: "Right Triangle", file: "RightTriangleShape.tsx" },
            { name: "Polygon", file: "PolygonShape.tsx" },
            { name: "Diamond / Rhombus", file: "DiamondShape.tsx" },
            { name: "Trapezoid", file: "TrapezoidShape.tsx" },
            { name: "Parallelogram", file: "ParallelogramShape.tsx" },
            { name: "Pentagon", file: "PentagonShape.tsx" },
            { name: "Hexagon", file: "HexagonShape.tsx" },
            { name: "Octagon", file: "OctagonShape.tsx" },
            { name: "Star", file: "StarShape.tsx" },
        ],
    },
    {
        category: "Flowchart Shapes",
        shapes: [
            { name: "Terminator (Start/End)", file: "TerminatorShape.tsx" },
            { name: "Process", file: "ProcessShape.tsx" },
            { name: "Decision", file: "DecisionShape.tsx" },
            { name: "Input / Output", file: "InputOutputShape.tsx" },
            { name: "Preparation", file: "PreparationShape.tsx" },
            { name: "Connector", file: "ConnectorShape.tsx" },
            { name: "Document", file: "DocumentShape.tsx" },
            { name: "Delay", file: "DelayShape.tsx" },
            { name: "Manual Input", file: "ManualInputShape.tsx" },
            { name: "Database", file: "DatabaseShape.tsx" },
        ],
    },
    {
        category: "Arrows/Connectors",
        shapes: [
            { name: "Arrow", file: "ArrowShape.tsx" },
            { name: "Double Arrow", file: "DoubleArrowShape.tsx" },
            { name: "Curved Arrow", file: "CurvedArrowShape.tsx" },
            { name: "Split Arrow", file: "SplitArrowShape.tsx" },
            { name: "Dashed Connector", file: "DashedConnectorShape.tsx" },
        ],
    },
    {
        category: "Symbolic Shapes",
        shapes: [
            { name: "Star (5-point)", file: "Star5Shape.tsx" },
            { name: "Star (6-point)", file: "Star6Shape.tsx" },
            { name: "Burst / Explosion", file: "BurstShape.tsx" },
            { name: "Heart", file: "HeartShape.tsx" },
            { name: "Cloud", file: "CloudShape.tsx" },
            { name: "Banner", file: "BannerShape.tsx" },
            { name: "Badge", file: "BadgeShape.tsx" },
            { name: "Speech Bubble", file: "SpeechBubbleShape.tsx" },
            { name: "Callout", file: "CalloutShape.tsx" },
        ],
    },
    {
        category: "3D Shapes",
        shapes: [
            { name: "Arc", file: "ArcShape.tsx" },
            { name: "Sector", file: "SectorShape.tsx" },
            { name: "Chord", file: "ChordShape.tsx" },
            { name: "Crescent", file: "CrescentShape.tsx" },
            { name: "Ring / Donut", file: "RingShape.tsx" },
            { name: "Cube (3D)", file: "CubeShape.tsx" },
            { name: "Cylinder", file: "CylinderShape.tsx" },
            { name: "Cone", file: "ConeShape.tsx" },
            { name: "Pyramid", file: "PyramidShape.tsx" },
            { name: "Sphere", file: "SphereShape.tsx" },
        ],
    },
    {
        category: "Utility Shapes",
        shapes: [
            { name: "Frame", file: "FrameShape.tsx" },
            { name: "Divider Line", file: "DividerShape.tsx" },
            { name: "Checkbox", file: "CheckboxShape.tsx" },
            { name: "Radio Button", file: "RadioButtonShape.tsx" },
            { name: "Button Shape", file: "ButtonShape.tsx" },
            { name: "Tab Shape", file: "TabShape.tsx" },
            { name: "Card", file: "CardShape.tsx" },
            { name: "Timeline Node", file: "TimelineNodeShape.tsx" },
        ],
    },
];

const ICON_MAP: Record<string, string> = {
    rectangle: "/shapeIcons/rectangle.svg",
    square: "/shapeIcons/square.svg",
    circle: "/shapeIcons/circle.svg",
    ellipseoval: "/shapeIcons/ellipse.svg",
    line: "/shapeIcons/line.svg",
    triangle: "/shapeIcons/triangle.svg",
    righttriangle: "/shapeIcons/rightTriangle.svg",
    polygon: "/shapeIcons/polygon.svg",
    diamond: "/shapeIcons/diamond.svg",
    trapezoid: "/shapeIcons/trapezoid.svg",
    parallelogram: "/shapeIcons/parallelogram.svg",
    pentagon: "/shapeIcons/pentagon.svg",
    hexagon: "/shapeIcons/hexagon.svg",
    octagon: "/shapeIcons/octagon.svg",
    star: "/shapeIcons/star.svg",

    terminator: "/shapeIcons/terminator.svg",
    process: "/shapeIcons/process.svg",
    decision: "/shapeIcons/decision.svg",
    inputoutput: "/shapeIcons/inputOutput.svg",
    preparation: "/shapeIcons/preparation.svg",
    connector: "/shapeIcons/circle.svg",
    document: "/shapeIcons/document.svg",
    delay: "/shapeIcons/delay.svg",
    manualinput: "/shapeIcons/manualInput.svg",
    database: "/shapeIcons/database.svg",

    arrow: "/shapeIcons/arrow.svg",
    doublearrow: "/shapeIcons/doubleArrow.svg",
    curvedarrow: "/shapeIcons/curvedArrow.svg",
    splitarrow: "/shapeIcons/splitArrow.svg",
    dashedconnector: "/shapeIcons/dashedconnector.svg",
    dashedline: "/shapeIcons/dashedLine.svg",

    star5point: "/shapeIcons/star.svg",
    star6point: "/shapeIcons/star6.svg",
    burstexplosion: "/shapeIcons/burst.svg",
    heart: "/shapeIcons/heart.svg",
    cloud: "/shapeIcons/cloud.svg",
    banner: "/shapeIcons/banner.svg",
    badge: "/shapeIcons/badge.svg",
    speechbubble: "/shapeIcons/speechBubble.svg",
    callout: "/shapeIcons/callout.svg",

    arc: "/shapeIcons/arc.svg",
    sector: "/shapeIcons/sector.svg",
    chord: "/shapeIcons/chord.svg",
    crescent: "/shapeIcons/crescent.svg",
    ringdonut: "/shapeIcons/ring.svg",
    cube3d: "/shapeIcons/cube.svg",
    cylinder: "/shapeIcons/cylinder.svg",
    cone: "/shapeIcons/cone.svg",
    pyramid: "/shapeIcons/pyramid.svg",
    sphere: "/shapeIcons/sphere.svg",

    frame: "/shapeIcons/frame.svg",
    dividerline: "/shapeIcons/dividerLine.svg",
    checkbox: "/shapeIcons/checkbox.svg",
    radiobutton: "/shapeIcons/radioButton.svg",
    buttonshape: "/shapeIcons/buttonShape.svg",
    tabshape: "/shapeIcons/tabShape.svg",
    card: "/shapeIcons/card.svg",
    timelinenode: "/shapeIcons/timelineNode.svg",
};

/* normalize helper */
function normalizeKey(s: string) {
    return s.replace(/\W+/g, '').toLowerCase();
}

function iconPathFromFile(fileName: string): string {
    const noExt = fileName.replace(/\.(tsx|ts|jsx|js)$/, '');
    const base = noExt.replace(/Shape$/i, '');
    const normalized = normalizeKey(base);

    // direct map matches
    if (ICON_MAP[normalized]) return ICON_MAP[normalized];

    // try trimmed (remove trailing numbers)
    const trimmed = normalized.replace(/\d+$/, '');
    if (ICON_MAP[trimmed]) return ICON_MAP[trimmed];

    // fallback to computed path inside /public/shapeIcons
    const lowerFirst = base.charAt(0).toLowerCase() + base.slice(1);
    return `/shapeIcons/${lowerFirst}.svg`;
}

export default function ShapeButton({ onShapeSelect }: ShapeButtonProps) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedCategory, setSelectedCategory] = useState(0);

    const open = Boolean(anchorEl);

    const handleOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
    const handleClose = () => setAnchorEl(null);

    const handleShapeSelect = (shapeName: string) => {
        onShapeSelect?.(shapeName);
        handleClose();
    };

    return (
        <>
            <Tooltip title="Shapes" arrow>
                <Button onClick={handleOpen} variant="outlined" size="small">
                    <ShapesIcon sx={{ fontSize: 20 }} />
                </Button>
            </Tooltip>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                PaperProps={{
                    sx: {
                        color: "white",
                        borderRadius: 1,
                        width: { xs: 320, sm: 320, md: 320 },
                        maxHeight: "70vh",
                        overflow: "hidden",
                        p: 0,
                    },
                }}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                transformOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1, color: "black", borderBottom: 1, borderColor: "divider", p: 0 }}>
                    <Tabs
                        value={selectedCategory}
                        onChange={(e, newVal) => setSelectedCategory(newVal)}
                        variant="scrollable"
                        scrollButtons="auto"
                        textColor="inherit"
                        indicatorColor="primary"
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            minHeight: 0,
                            height: 30,
                            "& .MuiTab-root": { mr: 2 },
                        }}
                    >
                        {shapeCategories.map((cat, index) => (
                            <Tab
                                key={index}
                                label={cat.category}
                                sx={{ color: "black", textTransform: "none", minWidth: "auto", fontSize: "0.9rem", p: 0 }}
                            />
                        ))}
                    </Tabs>
                </Box>

                <Box sx={{ p: 1, overflowY: "auto", maxHeight: "60vh", display: "flex", flexWrap: "wrap", gap: 1, justifyContent: "start" }}>
                    {shapeCategories[selectedCategory].shapes.map((shape, idx) => {
                        const iconPath = iconPathFromFile(shape.file);

                        return (
                            <Tooltip key={idx} title={shape.name} arrow>
                                <Box
                                    onClick={() => handleShapeSelect(shape.name)}
                                    sx={{
                                        cursor: "pointer",
                                        borderRadius: 1,
                                        textAlign: "center",
                                        px: 0.5,
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 35,
                                            height: 35,
                                            border: "1px solid #555",
                                            borderRadius: 1,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            mb: 1,
                                            px: "5px",
                                        }}
                                    >
                                        <Image
                                            src={iconPath}
                                            alt={shape.name}
                                            width={200}
                                            height={200}
                                            style={{ objectFit: "contain", display: "block" }}
                                        />
                                    </Box>
                                </Box>
                            </Tooltip>
                        );
                    })}
                </Box>
            </Menu>
        </>
    );
}
