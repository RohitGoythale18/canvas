'use client';
import { Button, Tooltip } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { ClearImageButtonProps } from "@/types";

export default function ClearImageButton({ onClearImage }: ClearImageButtonProps) {
    const handleClick = () => {
        const confirmDelete = window.confirm(
            "Remove the image from the selected shape?"
        );

        if (confirmDelete) {
            onClearImage?.();
        }
    };

    return (
        <Tooltip title="Clear Image" arrow>
            <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={handleClick}
            >
                <DeleteIcon sx={{ fontSize: 20 }} />
            </Button>
        </Tooltip>
    );
}
