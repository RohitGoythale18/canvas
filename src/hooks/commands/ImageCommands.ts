import { Command, Shape } from '@/types';
import * as Y from 'yjs';

export class ApplyImageCommand implements Command {
    constructor(
        private before: Shape[],
        private after: Shape[],
        private setShapes: React.Dispatch<React.SetStateAction<Shape[]>>,
        private yShapes?: Y.Map<Shape>
    ) { }

    execute() {
        if (this.yShapes) {
            this.yShapes.doc?.transact(() => {
                this.after.forEach(s => {
                    const { imageElement: _, ...rest } = s as any;
                    this.yShapes?.set(s.id, { ...rest, selected: false });
                });
            });
        } else {
            this.setShapes(this.after);
        }
    }

    undo() {
        if (this.yShapes) {
            this.yShapes.doc?.transact(() => {
                this.before.forEach(s => {
                    const { imageElement: _, ...rest } = s as any;
                    this.yShapes?.set(s.id, rest);
                });
            });
        } else {
            this.setShapes(this.before);
        }
    }
}
