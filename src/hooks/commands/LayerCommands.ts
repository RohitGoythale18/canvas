import { Command, Shape } from '@/types';

export class LayerCommand implements Command {
    constructor(
        private before: Shape[],
        private after: Shape[],
        private setShapes: React.Dispatch<React.SetStateAction<Shape[]>>
    ) { }

    execute() {
        this.setShapes(this.after);
    }

    undo() {
        this.setShapes(this.before);
    }
}
