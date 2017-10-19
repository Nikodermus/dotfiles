(function () {
    window.GITHISTORY = {};
    let clipboard;
    function initializeClipboard() {
        $('a.clipboard-link').addClass('hidden');
        clipboard = new Clipboard('.btn.clipboard');
        clipboard.on('success', onCopied);
    }
    function onCopied(e) {
        let prevLabel = $(e.trigger).attr('aria-label');
        $(e.trigger).attr('aria-label', 'Copied');
        setTimeout(function () { $(e.trigger).attr('aria-label', prevLabel); }, 1000);
        e.clearSelection();
    }
    $(document).ready(() => {
        initializeClipboard();
        window.GITHISTORY.generateSVG();
        window.GITHISTORY.initializeDetailsView();
    });
})();
//# sourceMappingURL=proxy.js.map