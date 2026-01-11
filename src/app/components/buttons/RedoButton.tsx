'use client';
import { Tooltip, Button } from "@mui/material";
import RedoIcon from '@mui/icons-material/Redo';
import { RedoButtonProps } from "@/types";

const RedoButton = ({ onRedo, onClick = () => {}, active = false }: RedoButtonProps) => {
    return (
        <Tooltip title="Redo" arrow>
            <Button
                variant={active ? "contained" : "outlined"}
                onClick={onRedo ?? onClick}
                size="small"
            >
                <RedoIcon sx={{ fontSize: 20 }} />
            </Button>
        </Tooltip>
    );
};

export default RedoButton;
