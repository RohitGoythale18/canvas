'use client';
import { Button, Tooltip } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { ClearImageButtonProps } from "@/types";

export default function ClearImageButton({ onClearImage, disabled }: ClearImageButtonProps) {
    const handleClick = () => {
        const confirmDelete = window.confirm(
            "Remove the image or delete the selected shape?"
        );

        if (confirmDelete) {
            onClearImage?.();
        }
    };

    return (
        <Tooltip title="Clear Image / Delete Shape" arrow>
            <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={handleClick}
                disabled={disabled}
            >
                <DeleteIcon sx={{ fontSize: 20 }} />
            </Button>
        </Tooltip>
    );
}
