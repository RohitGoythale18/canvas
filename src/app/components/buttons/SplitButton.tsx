'use client';
import { useState } from "react";
import { Button, Menu as MuiMenu, MenuItem, Tooltip } from "@mui/material";
import CallSplitIcon from '@mui/icons-material/CallSplit';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { SplitButtonProps } from "@/types";

const SplitButton = ({ onSplitSelect }: SplitButtonProps) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleSelect = (mode: string) => {
        if (onSplitSelect) onSplitSelect(mode);
        handleClose();
    };

    return (
        <>
            <Tooltip title="Split Canvas" arrow>
                <Button
                    variant="outlined"
                    endIcon={<ArrowDropDownIcon />}
                    onClick={handleOpen}
                    size="small"
                >
                    <CallSplitIcon sx={{ fontSize: 20 }} />
                </Button>
            </Tooltip>

            <MuiMenu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
            >
                <MenuItem onClick={() => handleSelect("2-way")}>
                    2-Way Split (Side by Side)
                </MenuItem>
                <MenuItem onClick={() => handleSelect("3-way-left")}>
                    3-Way Split (Left + Right Stack)
                </MenuItem>
                <MenuItem onClick={() => handleSelect("3-way-right")}>
                    3-Way Split (Right + Left Stack)
                </MenuItem>
                <MenuItem onClick={() => handleSelect("4-way")}>
                    4-Way Split (Grid)
                </MenuItem>
            </MuiMenu>
        </>
    );
};

export default SplitButton;
