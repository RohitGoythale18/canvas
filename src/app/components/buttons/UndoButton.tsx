'use client';
import { Tooltip, Button } from "@mui/material";
import UndoIcon from '@mui/icons-material/Undo';

interface UndoButtonProps {
    onClick?: () => void;
    active?: boolean;
}

const UndoButton = ({ onClick = () => {}, active = false }: UndoButtonProps) => {
    return (
        <Tooltip title="Undo" arrow>
            <Button
                variant={active ? "contained" : "outlined"}
                onClick={onClick}
                size="small"
            >
                <UndoIcon sx={{ fontSize: 20 }} />
            </Button>
        </Tooltip>
    );
};

export default UndoButton;
