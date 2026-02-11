import { Command, Shape } from "@/types";
import * as Y from "yjs";

export class ClearImageCommand implements Command {
    constructor(
        private before: Shape[],
        private after: Shape[],
        private setShapes: React.Dispatch<React.SetStateAction<Shape[]>>,
        private yShapes?: Y.Map<Shape>
    ) { }

    execute() {
        if (this.yShapes) {
            this.yShapes.doc?.transact(() => {
                const afterIds = new Set(this.after.map(s => s.id));
                this.before.forEach(s => {
                    if (!afterIds.has(s.id)) {
                        this.yShapes?.delete(s.id);
                    }
                });
                this.after.forEach(s => this.yShapes?.set(s.id, s));
            });
        } else {
            this.setShapes(this.after);
        }
    }

    undo() {
        if (this.yShapes) {
            this.yShapes.doc?.transact(() => {
                this.before.forEach(s => this.yShapes?.set(s.id, s));
            });
        } else {
            this.setShapes(this.before);
        }
    }
}
