import { Command, UseBgColorProps } from "@/types";
import * as Y from "yjs";

class BgColorCommand implements Command {
    constructor(
        private before: Record<string, string | { start: string; end: string }>,
        private after: Record<string, string | { start: string; end: string }>,
        private setBg: React.Dispatch<
            React.SetStateAction<Record<string, string | { start: string; end: string }>>
        >,
        private yConfig?: Y.Map<any>
    ) { }

    execute() {
        if (this.yConfig) {
            this.yConfig.set('backgroundColor', this.after);
        } else {
            this.setBg(this.after);
        }
    }

    undo() {
        if (this.yConfig) {
            this.yConfig.set('backgroundColor', this.before);
        } else {
            this.setBg(this.before);
        }
    }
}

export const useBgColor = ({ background, setBackground, executeCommand, yConfig }: UseBgColorProps) => {

    const changeBgColor = (
        color: { type: 'solid' | 'gradient'; value: string | { start: string; end: string } },
        panelId: string = 'default'
    ) => {
        const before = { ...background };

        const after = {
            ...background,
            [panelId]: color.value,
        };

        executeCommand(
            new BgColorCommand(before, after, setBackground, yConfig)
        );
    };

    return { changeBgColor };
};
