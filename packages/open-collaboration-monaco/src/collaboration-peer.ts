// ******************************************************************************
// Copyright 2024 TypeFox GmbH
// This program and the accompanying materials are made available under the
// terms of the MIT License, which is available in the project root.
// ******************************************************************************

import * as types from '@hereugo/open-collaboration-protocol';
import * as awarenessProtocol from 'y-protocols/awareness';

type PeerDecorationOptions = {
    selectionClassName: string;
    cursorClassName: string;
    cursorInvertedClassName: string;
    tagVisibleClassName: string;
};

export class DisposablePeer {

    readonly peer: types.Peer;
    color: string | undefined;

    private yjsAwareness: awarenessProtocol.Awareness;

    readonly decoration: PeerDecorationOptions;

    get clientId(): number | undefined {
        const states = this.yjsAwareness.getStates() as Map<number, types.ClientAwareness>;
        for (const [clientID, state] of states.entries()) {
            if (state.peer === this.peer.id) {
                return clientID;
            }
        }
        return undefined;
    }

    get lastUpdated(): number | undefined {
        const clientId = this.clientId;
        if (clientId !== undefined) {
            const meta = this.yjsAwareness.meta.get(clientId);
            if (meta) {
                return meta.lastUpdated;
            }
        }
        return undefined;
    }

    constructor(yAwareness: awarenessProtocol.Awareness, peer: types.Peer) {
        this.peer = peer;
        this.yjsAwareness = yAwareness;
        this.decoration = this.createDecorations();
    }

    private createDecorations(): PeerDecorationOptions {
        const color = createColor();
        const colorCss = typeof color === 'string' ? color : `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
        this.color = colorCss;
        const className = `peer-${this.peer.id}`;
        const cursorClassName = `${className}-cursor`;
        const cursorInvertedClassName = `${className}-cursor-inverted`;
        const selectionClassName = `${className}-selection`;
        const tagVisibleClassName = `${className}-tag-visible`;
        const cursorCss = `.${cursorClassName} {
            background-color: ${colorCss} !important;
            border-color: ${colorCss} !important;
            position: absolute;
            border-right: solid 2px;
            border-top: solid 2px;
            border-bottom: solid 2px;
            height: 100%;
            box-sizing: border-box;
        }`;
        generateCSS(cursorCss);
        const cursorAfterCss = `.${cursorClassName}::after {
            content: "${this.peer.name}";
            position: absolute;
            transform: translateY(-100%) translateY(2px);
            padding: 0 4px;
            border-radius: 4px 4px 4px 0px;
            background-color: ${colorCss};
            opacity: 0;
            transition: opacity 160ms ease, transform 160ms ease;
            pointer-events: auto;
            white-space: nowrap;
        }`;
        generateCSS(cursorAfterCss);
        const cursorAfterVisibleCss = `.${cursorClassName}.${tagVisibleClassName}::after,
        .${cursorClassName}:hover::after {
            opacity: 1;
            transform: translateY(-100%) translateY(0px);
        }`;
        generateCSS(cursorAfterVisibleCss);
        const cursorAfterInvertedCss = `.${cursorClassName}.${cursorInvertedClassName}::after {
            transform: translateY(100%) translateY(-2px);
            margin-top: -2px;
            border-radius: 0px 4px 4px 4px;
            z-index: 1;
        }`;
        generateCSS(cursorAfterInvertedCss);
        const cursorAfterInvertedVisibleCss = `.${cursorClassName}.${cursorInvertedClassName}.${tagVisibleClassName}::after,
        .${cursorClassName}.${cursorInvertedClassName}:hover::after {
            opacity: 1;
            transform: translateY(100%) translateY(0px);
        }`;
        generateCSS(cursorAfterInvertedVisibleCss);
        const selectionCss = `.${selectionClassName} {
            background: ${colorCss} !important;
            opacity: 0.25;
        }`;
        generateCSS(selectionCss);
        return {
            cursorClassName,
            cursorInvertedClassName,
            selectionClassName,
            tagVisibleClassName
        };
    }

}

let colorIndex = 0;
const defaultColors: Array<[number, number, number] | string> = [
    '#8AB4F8',
    '#81C995',
    '#FDD663',
    '#F28B82',
    '#C58AF9',
    '#9AD0F5',
    '#A7F3D0',
    '#FFD6A5',
    '#FFB3C1',
    '#B9F6CA'
];

const knownColors = new Set<string>();
function createColor(): [number, number, number] | string {
    if (colorIndex < defaultColors.length) {
        return defaultColors[colorIndex++];
    }
    const o = Math.round, r = Math.random, s = 255;
    let color: [number, number, number];
    do {
        color = [o(r() * s), o(r() * s), o(r() * s)];
    } while (knownColors.has(JSON.stringify(color)));
    knownColors.add(JSON.stringify(color));
    return color;
}

function generateCSS(cssText: string) {
    const style: HTMLStyleElement = document.createElement('style');
    style.textContent = cssText;
    document.head.appendChild(style);
}
