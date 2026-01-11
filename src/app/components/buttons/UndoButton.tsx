'use client';
import { Tooltip, Button } from "@mui/material";
import UndoIcon from '@mui/icons-material/Undo';
import { UndoButtonProps } from "@/types";

const UndoButton = ({ onUndo, onClick = () => {}, active = false }: UndoButtonProps) => {
    return (
        <Tooltip title="Undo" arrow>
            <Button
                variant={active ? "contained" : "outlined"}
                onClick={onUndo ?? onClick}
                size="small"
            >
                <UndoIcon sx={{ fontSize: 20 }} />
            </Button>
        </Tooltip>
    );
};

export default UndoButton;
