'use client';
import { NewCanvasButtonProps } from "@/types";

import { Button, Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

const NewCanvasButton = ({ onNewCanvas }: NewCanvasButtonProps) => {
    return (
        <Tooltip title="New Canvas" arrow>
            <Button
                variant="contained"
                onClick={onNewCanvas}
                size="small"
            >
                <AddIcon sx={{ fontSize: 20 }} />
            </Button>
        </Tooltip>
    );
};

export default NewCanvasButton;
