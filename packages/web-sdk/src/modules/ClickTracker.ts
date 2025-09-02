// src/modules/ClickTracker.ts
import { BaseModule } from './BaseModule';

export class ClickTracker extends BaseModule {
    public init(): void {
        this.addListener(document, 'click', this.handleClick.bind(this));
    }

    private handleClick(event: Event): void {
        const target = event.target as HTMLElement;
        this.eventManager.dispatch('click', {
            tag: target.tagName,
            id: target.id,
            class: target.className,
        });
    }
}