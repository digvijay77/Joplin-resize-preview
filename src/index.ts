import joplin from 'api';
import { ContentScriptType } from 'api/types';

joplin.plugins.register({
  onStart: async function() {
        console.info('Resizable Panes plugin started!');

        // Register the content script and stylesheet
        await joplin.contentScripts.register(
            ContentScriptType.CodeMirrorPlugin, // This type targets the editor area
            'resizable-panes-script',
            'webview-scripts/resizable.js'
        );

        // await joplin.contentScripts.register(
        //     ContentScriptType.CodeMirrorPlugin,
        //     'resizable-panes-style',
        //     'webview-scripts/style.css'
        // );
    },
});