'use client';
import { useState } from "react";
import { Menu, Box, Tabs, Tab, Tooltip, Button } from "@mui/material";
import ShapesIcon from "@mui/icons-material/Category";
import Image from "next/image";

interface ShapeButtonProps {
    onShapeSelect?: (shape: string) => void;
}

interface ShapeCategory {
    category: string;
    shapes: { name: string; file: string }[];
}

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
    rectangle: "/shapeIcons/rectangle.png",
    square: "/shapeIcons/square.png",
    circle: "/shapeIcons/circle.png",
    ellipseoval: "/shapeIcons/ellipse.png",
    line: "/shapeIcons/line.png",
    triangle: "/shapeIcons/triangle.png",
    righttriangle: "/shapeIcons/rightTriangle.png",
    polygon: "/shapeIcons/polygon.png",
    diamond: "/shapeIcons/rhombus.png",
    trapezoid: "/shapeIcons/trapezoid.png",
    parallelogram: "/shapeIcons/parallelogram.png",
    pentagon: "/shapeIcons/pentagon.png",
    hexagon: "/shapeIcons/hexagon.png",
    octagon: "/shapeIcons/octagon.png",
    star: "/shapeIcons/star.png",

    terminator: "/shapeIcons/startend.png",
    process: "/shapeIcons/process.png",
    decision: "/shapeIcons/decision.png",
    inputoutput: "/shapeIcons/inputOutput.png",
    preparation: "/shapeIcons/preparation.png",
    connector: "/shapeIcons/circle.png",
    document: "/shapeIcons/document.png",
    delay: "/shapeIcons/delay.png",
    manualinput: "/shapeIcons/manualInput.png",
    database: "/shapeIcons/database.png",

    arrow: "/shapeIcons/arrow.png",
    doublearrow: "/shapeIcons/doubleArrow.png",
    curvedarrow: "/shapeIcons/curvedArrow.png",
    splitarrow: "/shapeIcons/splitArrow.png",
    dashedconnector: "/shapeIcons/dashedLine.png",
    dashedline: "/shapeIcons/dashedLine.png",

    star5point: "/shapeIcons/star.png",
    star6point: "/shapeIcons/star6.png",
    burstexplosion: "/shapeIcons/burst.png",
    heart: "/shapeIcons/heart.png",
    cloud: "/shapeIcons/cloud.png",
    banner: "/shapeIcons/banner.png",
    badge: "/shapeIcons/badge.png",
    speechbubble: "/shapeIcons/speechBubble.png",
    callout: "/shapeIcons/callout.png",

    arc: "/shapeIcons/arc.png",
    sector: "/shapeIcons/sector.png",
    chord: "/shapeIcons/chord.png",
    crescent: "/shapeIcons/crescent.png",
    ringdonut: "/shapeIcons/ring.png",
    cube3d: "/shapeIcons/cube.png",
    cylinder: "/shapeIcons/cylinder.png",
    cone: "/shapeIcons/cone.png",
    pyramid: "/shapeIcons/pyramid.png",
    sphere: "/shapeIcons/sphere.png",

    frame: "/shapeIcons/frame.png",
    dividerline: "/shapeIcons/dividerLine.png",
    checkbox: "/shapeIcons/checkbox.png",
    radiobutton: "/shapeIcons/radioButton.png",
    buttonshape: "/shapeIcons/buttonShape.png",
    tabshape: "/shapeIcons/tabShape.png",
    card: "/shapeIcons/card.png",
    timelinenode: "/shapeIcons/timelineNode.png",
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
    return `/shapeIcons/${lowerFirst}.png`;
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
                        width: { xs: "95vw", sm: 700, md: 270 },
                        maxHeight: "70vh",
                        overflow: "hidden",
                        p: 0,
                    },
                }}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                transformOrigin={{ vertical: "top", horizontal: "left" }}
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
                                sx={{ color: "black", textTransform: "none", minWidth: "auto", fontSize: "0.8rem", p: 0 }}
                            />
                        ))}
                    </Tabs>
                </Box>

                <Box sx={{ p: 1, overflowY: "auto", maxHeight: "60vh" }}>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, justifyContent: "center" }}>
                        {shapeCategories[selectedCategory].shapes.map((shape, idx) => {
                            const iconPath = iconPathFromFile(shape.file);

                            return (
                                <Tooltip key={idx} title={shape.name} arrow>
                                    <Box
                                        onClick={() => handleShapeSelect(shape.name)}
                                        sx={{
                                            flex: "0 0 50%",
                                            "@media (min-width:600px)": { flex: "0 0 33.33%" },
                                            "@media (min-width:900px)": { flex: "0 0 25%" },
                                            "@media (min-width:1200px)": { flex: "0 0 16.67%" },
                                            cursor: "pointer",
                                            borderRadius: 1,
                                            textAlign: "center",
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: 30,
                                                height: 30,
                                                border: "1px solid #555",
                                                borderRadius: 1,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                mb: 1,
                                                px: 1,
                                            }}
                                        >
                                            <Image
                                                src={iconPath}
                                                alt={shape.name}
                                                width={20}
                                                height={20}
                                                style={{ objectFit: "contain", display: "block" }}
                                            />
                                        </Box>
                                    </Box>
                                </Tooltip>
                            );
                        })}
                    </Box>
                </Box>
            </Menu>
        </>
    );
}
