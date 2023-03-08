import FrameBridgeClient, { FetchOptions } from './FrameBridgeClient';

export default class UiFrame {
    readonly frame: HTMLIFrameElement;
    private readonly _client: FrameBridgeClient;
    private readonly _html: string;

    constructor(html: string, fetchOptions?: FetchOptions) {
        this.frame = document.createElement('iframe');
        this.frame.className = 'asbplayer-ui-frame';
        this._client = new FrameBridgeClient(this.frame, fetchOptions);
        this._html = html;
    }

    async bind() {
        document.body.appendChild(this.frame);
        const doc = this.frame.contentDocument!;
        doc.open();
        doc.write(this._html);
        doc.close();
        await this._client.bind();
    }

    async client() {
        await this._client.bind();
        return this._client;
    }

    get hidden() {
        return this.frame.classList.contains('asbplayer-hide');
    }

    show() {
        this.frame.classList.remove('asbplayer-hide');
    }

    hide() {
        this.frame.classList.add('asbplayer-hide');
    }

    unbind() {
        this._client.unbind();
        this.frame.remove();
    }
}