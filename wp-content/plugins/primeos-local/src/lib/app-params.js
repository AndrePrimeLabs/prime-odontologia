const isNode = typeof window === 'undefined';
const windowObj = isNode ? { localStorage: new Map() } : window;
const storage = windowObj.localStorage;
const FALLBACK_APP_ID = 'com.primeodontologia.os';

const toSnakeCase = (str) => {
	return str.replace(/([A-Z])/g, '_$1').toLowerCase();
}

const hasUnresolvedTemplate = (value) => {
	if (typeof value !== 'string') return false;
	const normalized = value.trim().toLowerCase();
	return (
		normalized.includes('${{') ||
		normalized.includes('}}') ||
		normalized.includes('{{') ||
		normalized.includes('%7b%7b') ||
		normalized.includes('secrets.')
	);
}

const isValidParamValue = (value, paramName) => {
	if (value === undefined || value === null) return false;
	if (typeof value !== 'string') return true;

	const normalized = value.trim().toLowerCase();
	if (!normalized || normalized === 'null' || normalized === 'undefined') {
		return false;
	}

	if (hasUnresolvedTemplate(value)) {
		return false;
	}

	if (paramName === 'app_id' && /\s/.test(value)) {
		return false;
	}

	return true;
}

const getFirstValidValue = (paramName, ...values) => {
	for (const value of values) {
		if (isValidParamValue(value, paramName)) return value;
	}
	return null;
}

const getAppParamValue = (paramName, { defaultValue = undefined, removeFromUrl = false } = {}) => {
	if (isNode) {
		return isValidParamValue(defaultValue, paramName) ? defaultValue : null;
	}
	const storageKey = `primeos_${toSnakeCase(paramName)}`;
	const urlParams = new URLSearchParams(window.location.search);
	const searchParam = urlParams.get(paramName);
	if (removeFromUrl) {
		urlParams.delete(paramName);
		const newUrl = `${window.location.pathname}${urlParams.toString() ? `?${urlParams.toString()}` : ""
			}${window.location.hash}`;
		window.history.replaceState({}, document.title, newUrl);
	}
	if (isValidParamValue(searchParam, paramName)) {
		storage.setItem(storageKey, searchParam);
		return searchParam;
	}
	if (searchParam !== null) {
		storage.removeItem(storageKey);
	}
	if (isValidParamValue(defaultValue, paramName)) {
		storage.setItem(storageKey, defaultValue);
		return defaultValue;
	}
	const storedValue = storage.getItem(storageKey);
	if (isValidParamValue(storedValue, paramName)) {
		return storedValue;
	}
	if (storedValue !== null) {
		storage.removeItem(storageKey);
	}
	return null;
}

const getAppParams = () => {
    if (getAppParamValue("clear_access_token") === 'true') {
        storage.removeItem('primeos_access_token');
        storage.removeItem('token');
    }

    const defaultAppId = getFirstValidValue(
        'app_id',
        import.meta.env.VITE_PRIMEOS_APP_ID,
        import.meta.env.VITE_APP_ID,
        FALLBACK_APP_ID
    ) || FALLBACK_APP_ID;

    return {
        appId: getAppParamValue("app_id", { defaultValue: defaultAppId }),
        token: getAppParamValue("access_token", { removeFromUrl: true }),
        fromUrl: getAppParamValue("from_url", { defaultValue: window.location.href }),
        functionsVersion: getAppParamValue("functions_version", { defaultValue: import.meta.env.VITE_PRIMEOS_FUNCTIONS_VERSION }),
        appBaseUrl: getAppParamValue("app_base_url", {
            defaultValue: getFirstValidValue('app_base_url', import.meta.env.VITE_PRIMEOS_APP_BASE_URL, window.location.origin)
        }),
    }
}


export const appParams = {
	...getAppParams()
}
