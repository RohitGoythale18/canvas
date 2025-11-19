'use client';
import { Tooltip, Button } from "@mui/material";
import RedoIcon from '@mui/icons-material/Redo';

interface RedoButtonProps {
    onClick?: () => void;
    active?: boolean;
}

const RedoButton = ({ onClick = () => {}, active = false }: RedoButtonProps) => {
    return (
        <Tooltip title="Redo" arrow>
            <Button
                variant={active ? "contained" : "outlined"}
                onClick={onClick}
                size="small"
            >
                <RedoIcon sx={{ fontSize: 20 }} />
            </Button>
        </Tooltip>
    );
};

export default RedoButton;
