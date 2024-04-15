import Binding from '../services/binding';
import UiFrame from '../services/ui-frame';
import FrameBridgeClient from '../services/frame-bridge-client';
import { fetchLocalization } from '../services/localization-fetcher';

export default class NotificationController {
    public onClose?: () => void;

    private readonly _context: Binding;
    private readonly _frame: UiFrame;
    private _client?: FrameBridgeClient;

    constructor(context: Binding) {
        this._context = context;
        this._frame = new UiFrame(
            async (lang) => `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <title>asbplayer</title>
        </head>
        <body>
        <div id="root" style="width:100%;height:100vh;"></div>
        <script type="application/json" id="loc">${JSON.stringify(await fetchLocalization(lang))}</script>
        <script src="${chrome.runtime.getURL('./notification-ui.js')}"></script>
        </body>
    </html>`
        );
    }

    get showing() {
        return !this._frame.hidden;
    }

    hide() {
        this._frame.hide();
    }

    async show(titleLocKey: string, messageLocKey: string) {
        this._frame.language = await this._context.settings.getSingle('language');
        const isNewClient = await this._frame.bind();
        this._client = await this._frame.client();

        if (isNewClient) {
            this._client.onMessage((message) => {
                if (message.command === 'close') {
                    this._context.subtitleController.forceHideSubtitles = false;
                    this._context.mobileVideoOverlayController.forceHide = false;
                    this._context.controlsController.show();
                    this._frame.hide();
                    this.onClose?.();
                }
            });
        }

        this._frame.show();
        this._client.updateState({
            themeType: await this._context.settings.getSingle('themeType'),
            titleLocKey,
            messageLocKey,
        });
        this._context.pause();
    }

    unbind() {
        this._frame?.unbind();
    }
}