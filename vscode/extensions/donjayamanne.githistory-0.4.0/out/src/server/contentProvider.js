"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const querystring = require("query-string");
const types_1 = require("../common/types");
class ContentProvider {
    constructor(serviceContainer) {
        this.serviceContainer = serviceContainer;
    }
    provideTextDocumentContent(uri, _token) {
        const query = querystring.parse(uri.query.toString());
        const port = parseInt(query.port.toString(), 10);
        const id = query.id;
        const branchName = query.branchName ? decodeURIComponent(query.branchName) : '';
        const branchSelection = parseInt(query.branchSelection.toString(), 10);
        const locale = decodeURIComponent(query.locale.toString());
        const file = decodeURIComponent(query.file.toString());
        return this.generateResultsView(port, id, branchName, branchSelection, locale, file);
    }
    generateResultsView(port, id, branchName, branchSelection, locale, file) {
        // Fix for issue #669 "Results Panel not Refreshing Automatically" - always include a unique time
        // so that the content returned is different. Otherwise VSCode will not refresh the document since it
        // thinks that there is nothing to be updated.
        // this.provided = true;
        const timeNow = ''; // new Date().getTime();
        const queryArgs = [
            `id=${id}`,
            `branchName=${encodeURIComponent(branchName)}`,
            `file=${encodeURIComponent(file)}`,
            'theme=',
            `branchSelection=${branchSelection}`,
            `locale=${encodeURIComponent(locale)}`
        ];
        // tslint:disable-next-line:no-http-string
        const uri = `http://localhost:${port}/?_&${queryArgs.join('&')}`;
        this.serviceContainer.getAll(types_1.ILogService).forEach(logger => {
            logger.log(`Server running on ${uri}`);
        });
        return `
                    <!DOCTYPE html>
                    <head><style type="text/css"> html, body{ height:100%; width:100%; overflow:hidden; padding:0;margin:0; } </style>
                    <titleCan I give a title</title>
                    <script type="text/javascript">
                        function start(){
                            // We need a unique value so html is reloaded
                            var color = '';
                            var fontFamily = '';
                            var fontSize = '';
                            var theme = '';
                            var fontWeight = '';
                            try {
                                computedStyle = window.getComputedStyle(document.body);
                                color = computedStyle.color + '';
                                backgroundColor = computedStyle.backgroundColor + '';
                                fontFamily = computedStyle.fontFamily;
                                fontSize = computedStyle.fontSize;
                                fontWeight = computedStyle.fontWeight;
                                theme = document.body.className;
                            }
                            catch(ex){
                            }
                            var queryArgs = [
                                            'id=${id}',
                                            'branchName=${encodeURIComponent(branchName)}',
                                            'file=${encodeURIComponent(file)}',
                                            'branchSelection=${branchSelection}',
                                            'theme=' + theme,
                                            'color=' + encodeURIComponent(color),
                                            'backgroundColor=' + encodeURIComponent(backgroundColor),
                                            'fontFamily=' + encodeURIComponent(fontFamily),
                                            'fontWeight=' + encodeURIComponent(fontWeight),
                                            'fontSize=' + encodeURIComponent(fontSize),
                                            'locale=${encodeURIComponent(locale)}'
                                        ];
                            document.getElementById('myframe').src = 'http://localhost:${port}/?_=${timeNow}&' + queryArgs.join('&');
                        }
                    </script>
                    </head>
                    <body onload="start()">
                    <iframe id="myframe" frameborder="0" style="border: 0px solid transparent;height:100%;width:100%;" src="" seamless></iframe>
                    </body></html>`;
    }
}
exports.ContentProvider = ContentProvider;
//# sourceMappingURL=contentProvider.js.map