'use client';
import { useState } from "react";
import { Drawer, Box, Tabs, Tab, Typography, Tooltip, Button } from "@mui/material";
import ShapesIcon from "@mui/icons-material/Category";

interface ShapeButtonProps {
    onShapeSelect?: (shape: string) => void;
}

interface ShapeCategory {
    category: string;
    shapes: { name: string; file: string }[];
}

const shapeCategories: ShapeCategory[] = [
    {
        category: "Basic Geometric Shapes",
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
        category: "Arrows & Connectors",
        shapes: [
            { name: "Arrow", file: "ArrowShape.tsx" },
            { name: "Double Arrow", file: "DoubleArrowShape.tsx" },
            { name: "Curved Arrow", file: "CurvedArrowShape.tsx" },
            { name: "Bent Arrow", file: "BentArrowShape.tsx" },
            { name: "Circular Arrow", file: "CircularArrowShape.tsx" },
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

export default function ShapeButton({ onShapeSelect }: ShapeButtonProps) {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(0);

    const handleShapeSelect = (shapeName: string) => {
        console.log(`Selected Shape: ${shapeName}`);
        onShapeSelect?.(shapeName);
        setDrawerOpen(false);
    };

    return (
        <>
            <Tooltip title="Shapes" arrow>
                <Button
                    onClick={() => setDrawerOpen(true)}
                    variant="outlined"
                    size="small"
                >
                    <ShapesIcon sx={{ fontSize: 20 }} />
                </Button>
            </Tooltip>

            <Drawer
                anchor="top"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                PaperProps={{
                    sx: {
                        backgroundColor: "#121212",
                        color: "white",
                        borderBottomLeftRadius: 12,
                        borderBottomRightRadius: 12,
                    },
                }}
            >
                {/* Category Tabs */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1, py: 2, borderBottom: 1, borderColor: "divider", bgcolor: "#1E1E1E" }}>
                    {/* Shapes Heading */}
                    <h2 className="text-3xl font-semibold text-white text-center">Add Shapes</h2>

                    <Tabs
                        value={selectedCategory}
                        onChange={(e, newVal) => setSelectedCategory(newVal)}
                        variant="scrollable"
                        scrollButtons="auto"
                        textColor="inherit"
                        indicatorColor="primary"
                    >
                        {shapeCategories.map((cat, index) => (
                            <Tab key={index} label={cat.category} />
                        ))}
                    </Tabs>
                </Box>

                {/* Shape Grid */}
                <Box sx={{ p: 3, height: "100%", overflowY: "auto" }}>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                        {shapeCategories[selectedCategory].shapes.map((shape, idx) => (
                            <Box
                                key={idx}
                                onClick={() => handleShapeSelect(shape.name)}
                                sx={{
                                    flex: '0 0 50%',
                                    '@media (min-width:600px)': { flex: '0 0 33.33%' },
                                    '@media (min-width:900px)': { flex: '0 0 25%' },
                                    '@media (min-width:1200px)': { flex: '0 0 16.67%' },
                                    p: 2,
                                    cursor: "pointer",
                                    borderRadius: 2,
                                    "&:hover": { backgroundColor: "#2A2A2A" },
                                    textAlign: "center",
                                }}
                            >
                                <Box
                                    sx={{
                                        height: 60,
                                        border: "1px solid #555",
                                        borderRadius: 2,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        mb: 1,
                                    }}
                                >
                                    {/* Placeholder for Shape Preview */}
                                    <Typography variant="h6">⬜</Typography>
                                </Box>
                                <Typography variant="body2" sx={{ color: "#ccc" }}>
                                    {shape.name}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                </Box>
            </Drawer>
        </>
    );
}
