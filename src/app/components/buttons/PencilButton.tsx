'use client';
import { Tooltip, Button } from "@mui/material";
import ModeIcon from "@mui/icons-material/Mode";

interface PencilButtonProps {
    active?: boolean;
    onToggle?: (enabled: boolean) => void;
}

const PencilButton = ({ active = false, onToggle }: PencilButtonProps) => {
    const handleClick = () => {
        const newState = !active;
        onToggle?.(newState);
    };

    return (
        <Tooltip title="Pencil Tool" arrow>
            <Button
                variant={active ? "contained" : "outlined"}
                onClick={handleClick}
                size="small"
            >
                <ModeIcon sx={{ fontSize: 20 }} />
            </Button>
        </Tooltip>
    );
};

export default PencilButton;
