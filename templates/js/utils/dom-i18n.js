;(function(){
    function getI18n(containerId, defaults = {}) {
        const el = document.getElementById(containerId);
        if (!el) return { ...defaults };
        const out = { ...defaults };
        const ds = el.dataset || {};
        for (const key in ds) {
            if (Object.prototype.hasOwnProperty.call(ds, key)) {
                out[key.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = ds[key];
            }
        }
        return out;
    }
    window.__getI18n = getI18n;
})();
