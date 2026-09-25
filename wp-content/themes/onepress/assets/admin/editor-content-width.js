/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "@wordpress/data"
/*!******************************!*\
  !*** external ["wp","data"] ***!
  \******************************/
(module) {

module.exports = window["wp"]["data"];

/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		if (!(moduleId in __webpack_modules__)) {
/******/ 			delete __webpack_module_cache__[moduleId];
/******/ 			var e = new Error("Cannot find module '" + moduleId + "'");
/******/ 			e.code = 'MODULE_NOT_FOUND';
/******/ 			throw e;
/******/ 		}
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!*******************************************!*\
  !*** ./src/admin/editor-content-width.js ***!
  \*******************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/data */ "@wordpress/data");
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_data__WEBPACK_IMPORTED_MODULE_0__);
/**
 * Live-update `--wp--style--global--content-size` in the editor iframe
 * when the user switches the page template via the sidebar.
 *
 * Mirrors the PHP priority chain (`inc/extras.php`):
 *   1. Page template (`onepress_get_layout_for_post_id`)
 *   2. Single Layout Sidebar mod (`single_layout`, posts only)
 *   3. Site Layout mod (`onepress_layout`)
 * + `single_layout_content_width` user override (posts only).
 *
 * Inputs are PHP-resolved once at editor load and serialized into the
 * `window.onepressEditorContentWidth` global via `wp_localize_script`.
 * This file does pure dictionary lookups — no extra fetches.
 *
 * Always SETS an inline style on the iframe's `<html>` element (no remove
 * branch): inline-style specificity beats the PHP-injected
 * `<style>:root{…}</style>` rule, so the value here wins regardless of
 * what PHP emitted at load time.
 *
 * @since 2.4.1
 * @package OnePress
 */


(function () {
  const config = window.onepressEditorContentWidth;
  if (!config || !config.postType) {
    return;
  }

  /**
   * Resolve the layout slug from current template.
   *
   * @param {string} template Page template slug, or empty for default.
   * @return {string} `'no-sidebar' | 'left-sidebar' | 'right-sidebar' | 'stretched'`
   */
  function resolveLayout(template) {
    // 1) Page template — pages only.
    if (config.postType === 'page' && template && config.templateMap[template]) {
      return config.templateMap[template];
    }
    // 2) Single Layout Sidebar — posts only.
    if (config.postType === 'post' && config.singleLayout && config.singleLayout !== 'default') {
      return config.singleLayout;
    }
    // 3) Site Layout fallback.
    return config.siteLayout || 'right-sidebar';
  }

  /**
   * Resolve the CSS value (with unit) from a layout.
   *
   * @param {string} layout One of the resolved layout slugs.
   * @return {string} CSS value: `'790px'` | `'1110px'` | `'100vw'` | user-px.
   */
  function resolveValue(layout) {
    // `stretched` template → bleed to viewport edge.
    if (layout === 'stretched') {
      return '100vw';
    }
    // User override (posts only) — wins over base. Posts can't be on
    // a stretched template so this never collides with `100vw`.
    if (config.postType === 'post' && config.singleContentWidth > 0) {
      return config.singleContentWidth + 'px';
    }
    const hasSidebar = layout === 'left-sidebar' || layout === 'right-sidebar';
    const base = hasSidebar ? config.sidebarBase : config.noSidebarBase;
    return base + 'px';
  }

  /**
   * Find the editor canvas iframe and set the inline CSS variable on its
   * `<html>` element.
   *
   * @param {string} value CSS value with unit.
   */
  function applyValue(value) {
    const iframe = document.querySelector('iframe[name="editor-canvas"]');
    if (!iframe || !iframe.contentDocument) {
      return;
    }
    iframe.contentDocument.documentElement.style.setProperty('--wp--style--global--content-size', value);
  }
  let lastTemplate = null;
  let initialized = false;
  (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_0__.subscribe)(function () {
    const editor = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_0__.select)('core/editor');
    if (!editor || !editor.getEditedPostAttribute) {
      return;
    }
    const template = editor.getEditedPostAttribute('template') || '';
    if (initialized && template === lastTemplate) {
      return;
    }
    lastTemplate = template;
    initialized = true;
    applyValue(resolveValue(resolveLayout(template)));
  });
})();
})();

/******/ })()
;
//# sourceMappingURL=editor-content-width.js.map