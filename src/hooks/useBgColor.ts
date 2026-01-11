import { Command, UseBgColorProps } from "@/types";

class BgColorCommand implements Command {
    constructor(
        private before: Record<string, string | { start: string; end: string }>,
        private after: Record<string, string | { start: string; end: string }>,
        private setBg: React.Dispatch<
            React.SetStateAction<Record<string, string | { start: string; end: string }>>
        >
    ) { }

    execute() {
        this.setBg(this.after);
    }

    undo() {
        this.setBg(this.before);
    }
}

export const useBgColor = ({ background, setBackground, executeCommand, }: UseBgColorProps) => {

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
            new BgColorCommand(before, after, setBackground)
        );
    };

    return { changeBgColor };
};
