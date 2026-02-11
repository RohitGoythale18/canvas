import { Command, UseSplitCanvasProps } from "@/types";
import * as Y from "yjs";

class SplitCanvasCommand implements Command {
    constructor(
        private before: string,
        private after: string,
        private setSplitMode: React.Dispatch<React.SetStateAction<string>>,
        private yConfig?: Y.Map<any>
    ) { }

    execute() {
        if (this.yConfig) {
            this.yConfig.set('splitMode', this.after);
        } else {
            this.setSplitMode(this.after);
        }
    }

    undo() {
        if (this.yConfig) {
            this.yConfig.set('splitMode', this.before);
        } else {
            this.setSplitMode(this.before);
        }
    }
}

export const useSplitCanvas = ({ splitMode, setSplitMode, executeCommand, yConfig }: UseSplitCanvasProps) => {

    const changeSplitMode = (mode: string) => {
        if (mode === splitMode) return;

        executeCommand(
            new SplitCanvasCommand(
                splitMode,
                mode,
                setSplitMode,
                yConfig
            )
        );
    };

    return {
        changeSplitMode,
    };
};
