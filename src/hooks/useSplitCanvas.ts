import { Command, UseSplitCanvasProps } from "@/types";

class SplitCanvasCommand implements Command {
    constructor(
        private before: string,
        private after: string,
        private setSplitMode: React.Dispatch<React.SetStateAction<string>>
    ) { }

    execute() {
        this.setSplitMode(this.after);
    }

    undo() {
        this.setSplitMode(this.before);
    }
}

export const useSplitCanvas = ({ splitMode, setSplitMode, executeCommand, }: UseSplitCanvasProps) => {

    const changeSplitMode = (mode: string) => {
        if (mode === splitMode) return;

        executeCommand(
            new SplitCanvasCommand(
                splitMode,
                mode,
                setSplitMode
            )
        );
    };

    return {
        changeSplitMode,
    };
};
