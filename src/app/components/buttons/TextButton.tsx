'use client';
import { Tooltip, Button } from "@mui/material";
import RttIcon from '@mui/icons-material/Rtt';

interface TextButtonProps {
    active?: boolean;
    onToggle?: (enabled: boolean) => void;
}

const TextButton = ({ active = false, onToggle }: TextButtonProps) => {
    const handleClick = () => {
        const newState = !active;
        onToggle?.(newState);
    };

    return (
        <Tooltip title="Text Tool" arrow>
            <Button
                variant={active ? "contained" : "outlined"}
                onClick={handleClick}
                size="small"
            >
                <RttIcon sx={{ fontSize: 20 }} />
            </Button>
        </Tooltip>
    );
};

export default TextButton;
