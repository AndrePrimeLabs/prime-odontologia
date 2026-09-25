"use strict";

(function () {
    var _wp = wp,
        _wp$serverSideRender = _wp.serverSideRender,
        createElement = wp.element.createElement,
        ServerSideRender = _wp$serverSideRender === void 0 ? wp.components.ServerSideRender : _wp$serverSideRender,
        _ref = wp.blockEditor || wp.editor,
        InspectorControls = _ref.InspectorControls,
        useBlockProps = _ref.useBlockProps,
        _wp$components = wp.components,
        TextareaControl = _wp$components.TextareaControl,
        Button = _wp$components.Button,
        PanelBody = _wp$components.PanelBody,
        Placeholder = _wp$components.Placeholder,
        registerBlockType = wp.blocks.registerBlockType;

    // Locate the WP 7.0 block editor canvas iframe. Returns null if the
    // iframe doesn't exist yet or its contentDocument isn't reachable.
    function getEditorIframe() {
        var selectors = [
            'iframe[name="editor-canvas"]',
            'iframe.edit-post-visual-editor__content-area',
            'iframe.editor-canvas'
        ];
        for (var i = 0; i < selectors.length; i++) {
            var el = document.querySelector(selectors[i]);
            if (el && el.contentDocument && el.contentDocument.head) {
                return el;
            }
        }
        return null;
    }

    // Inject sbi-scripts.min.js (and its config + jQuery if needed) into the
    // editor iframe's <head>, so window.sbi_init exists inside the iframe
    // and can find the feed DOM that ServerSideRender mounts there.
    var iframeAssetsPromise = null;
    function ensureIframeFeedAssets() {
        if (iframeAssetsPromise) {
            return iframeAssetsPromise;
        }
        iframeAssetsPromise = new Promise(function (resolve, reject) {
            var attempts = 0;
            var tryInject = function () {
                attempts++;
                var iframe = getEditorIframe();
                if (!iframe) {
                    if (attempts > 40) {
                        reject(new Error('sbi: editor iframe not found'));
                        return;
                    }
                    setTimeout(tryInject, 250);
                    return;
                }
                var doc = iframe.contentDocument;
                if (doc.documentElement.getAttribute('data-sbi-feed-assets-injected')) {
                    resolve(iframe);
                    return;
                }
                doc.documentElement.setAttribute('data-sbi-feed-assets-injected', '1');

                var config = doc.createElement('script');
                config.textContent =
                    'window.sb_instagram_js_options = ' + JSON.stringify(sbi_block_editor.sbInstagramJsOptions || {}) + ';' +
                    'window.sbiTranslations = ' + JSON.stringify(sbi_block_editor.sbiTranslations || {}) + ';';
                doc.head.appendChild(config);

                var loadScript = function (src) {
                    return new Promise(function (res, rej) {
                        var s = doc.createElement('script');
                        s.src = src;
                        s.onload = function () { res(); };
                        s.onerror = function () { rej(new Error('sbi: failed to load ' + src)); };
                        doc.head.appendChild(s);
                    });
                };

                var chain = Promise.resolve();
                if (!iframe.contentWindow.jQuery && sbi_block_editor.jqueryUrl) {
                    chain = chain.then(function () { return loadScript(sbi_block_editor.jqueryUrl); });
                }
                if (sbi_block_editor.iframeScriptUrl) {
                    chain = chain.then(function () { return loadScript(sbi_block_editor.iframeScriptUrl); });
                }
                chain.then(function () { resolve(iframe); }, reject);
            };
            tryInject();
        });
        return iframeAssetsPromise;
    }

    // Call sbi_init() inside the iframe (WP 7.0+) or in the outer scope as a
    // fallback for pre-iframe editors.
    function triggerSbiInit() {
        var iframe = getEditorIframe();
        if (iframe && iframe.contentWindow && typeof iframe.contentWindow.sbi_init === 'function') {
            try { iframe.contentWindow.sbi_init(); } catch (e) {}
            return;
        }
        if (!iframe && typeof sbi_init !== 'undefined') {
            try { sbi_init(); } catch (e) {}
        }
    }

    var sbiIcon = createElement('svg', {
        width: 20,
        height: 20,
        viewBox: '0 0 448 512',
        className: 'dashicon'
    }, createElement('path', {
        fill: 'currentColor',
        d: 'M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z'
    }));

    registerBlockType('sbi/sbi-feed-block', {
        apiVersion: 3,
        title: 'Instagram Feed',
        icon: sbiIcon,
        category: 'widgets',
        attributes: {
            noNewChanges: {
                type: 'boolean',
            },
            shortcodeSettings: {
                type: 'string',
            }
        },
        edit: function edit(props) {
            var blockProps = typeof useBlockProps === 'function' ? useBlockProps() : {};
            var _props = props,
                setAttributes = _props.setAttributes,
                _props$attributes = _props.attributes,
                _props$attributes$sho = _props$attributes.shortcodeSettings,
                shortcodeSettings = _props$attributes$sho === void 0 ? sbi_block_editor.shortcodeSettings : _props$attributes$sho,
                _props$attributes$cli = _props$attributes.noNewChanges,
                noNewChanges = _props$attributes$cli === void 0 ? true : _props$attributes$cli;

            function setState(shortcodeSettingsContent) {
                setAttributes({
                    noNewChanges: false,
                    shortcodeSettings: shortcodeSettingsContent
                })
            }

            function previewClick(content) {
                setAttributes({
                    noNewChanges: true,
                })
            }

            function afterRender() {
                // Inject sbi-scripts into the WP 7.0 iframe (no-op once injected),
                // then poll-trigger sbi_init in iframe scope. ServerSideRender
                // doesn't expose an onload callback, so we retry on intervals.
                ensureIframeFeedAssets().catch(function () {});
                setTimeout(triggerSbiInit, 1000);
                setTimeout(triggerSbiInit, 2000);
                setTimeout(triggerSbiInit, 3000);
                setTimeout(triggerSbiInit, 5000);
                setTimeout(triggerSbiInit, 10000);
            }

            var jsx = [React.createElement(InspectorControls, {
                key: "sbi-gutenberg-setting-selector-inspector-controls"
            }, React.createElement(PanelBody, {
                title: sbi_block_editor.i18n.addSettings
            }, React.createElement(TextareaControl, {
                key: "sbi-gutenberg-settings",
                className: "sbi-gutenberg-settings",
                label: sbi_block_editor.i18n.shortcodeSettings,
                help: sbi_block_editor.i18n.example + ": 'feed=1'",
                value: shortcodeSettings,
                onChange: setState
            }), React.createElement(Button, {
                key: "sbi-gutenberg-preview",
                className: "sbi-gutenberg-preview",
                onClick: previewClick,
                isDefault: true
            }, sbi_block_editor.i18n.preview)))];

            if (noNewChanges) {
                afterRender();
                jsx.push(React.createElement(ServerSideRender, {
                    key: "instagram-feeds/instagram-feeds",
                    block: "sbi/sbi-feed-block",
                    attributes: props.attributes,
                }));
            } else {
                props.attributes.noNewChanges = false;
                jsx.push(React.createElement(Placeholder, {
                    key: "sbi-gutenberg-setting-selector-select-wrap",
                    className: "sbi-gutenberg-setting-selector-select-wrap"
                }, React.createElement(Button, {
                    key: "sbi-gutenberg-preview",
                    className: "sbi-gutenberg-preview",
                    onClick: previewClick,
                    isDefault: true
                }, sbi_block_editor.i18n.preview)));
            }

            return createElement('div', blockProps, jsx);
        },
        save: function save() {
            return null;
        }
    });
})();