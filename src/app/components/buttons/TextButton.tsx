'use client';
import { TextButtonProps } from "@/types";

import { Tooltip, Button } from "@mui/material";
import RttIcon from '@mui/icons-material/Rtt';

const TextButton = ({ active = false, onToggle }: TextButtonProps) => {
    const handleClick = () => {
        const newState = !active;
        onToggle?.(newState);
    };

    return (
        <Tooltip title="Textbox" arrow>
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
