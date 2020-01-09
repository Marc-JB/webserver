export class PageBuilder {
    static createPage(title: string, body: string = "", colorPrimary: string = "blue", colorSecondary: string = "red") {
        return createSimpleWebPage(title, body, colorPrimary, colorSecondary)
    }

    static createCodeBlock(title: string, code: string) {
        return createHtmlCodeblock(title, code)
    }
}

const htmlCodeElementStyling = `
<style>
@font-face {
    font-family: 'Cascadia Code';
    src: local('Cascadia Code'), url(https://github.com/microsoft/cascadia-code/releases/download/v1911.21/Cascadia.ttf) format('ttf');
}

pre {
    margin: 0 0 1em;
    padding: .5em 1em;
    overflow-x: auto;
}

pre code, pre .line-number {
    font-family: 'Cascadia Code', monospace;
    display:block;
}

pre .line-number {
    float: left;
    margin: 0 1em 0 -1em;
    border-right: 1px solid;
    text-align: right;
}

pre .line-number span {
    display: block;
    padding: 0 .5em 0 1em;
}

pre .cl {
    display: block;
    clear: both;
}
</style>
<script>
function onload() {
    var pre = document.getElementsByTagName('pre'), pl = pre.length;
    for (var i = 0; i < pl; i++) {
        pre[i].innerHTML = '<span class="line-number"></span>' + pre[i].innerHTML + '<span class="cl"></span>';
        var num = pre[i].innerHTML.split(/\\n/).length;
        for (var j = 0; j < num; j++) {
            var line_num = pre[i].getElementsByTagName('span')[0];
            line_num.innerHTML += '<span>' + (j + 1) + '</span>';
        }
    }
}
</script>
`.trim()

const createSimpleWebPage = (title: string, body: string, colorPrimary: string, colorSecondary: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>${title}</title>

    <link rel="stylesheet" href="https://code.getmdl.io/1.3.0/material.${colorPrimary}-${colorSecondary}.min.css" />
    <script defer src="https://code.getmdl.io/1.3.0/material.min.js"></script>

    <link href="https://fonts.googleapis.com/css?family=Roboto:300,400,500&display=swap" rel="stylesheet">
    ${body.includes("material-icons") ? "<link href=\"https://fonts.googleapis.com/icon?family=Material+Icons&display=swap\" rel=\"stylesheet\">" : ""}
    ${body.includes("<code>") ? htmlCodeElementStyling : ""}

    <style>
        @media screen and (max-width: 1024px) {
            .mdl-layout__header-row { padding: 0 16px; }
        }

        .mdl-layout__header-row { padding: 0 40px; }
        body { background-color: #FAFAFA; }
        .page-content { padding: 16px; margin: 0 auto; max-width: 720px; }
        .mdl-card__supporting-text { width: 100%; box-sizing: border-box; }
    </style>
</head>
<body onload="onload()">
    <div class="mdl-layout mdl-js-layout mdl-layout--fixed-header">
        <header class="mdl-layout__header">
            <div class="mdl-layout__header-row">
                <span class="mdl-layout-title">${title}</span>
            </div>
        </header>
        <main class="mdl-layout__content">
            <div class="page-content">${body}</div>
        </main>
    </div>
</body>
</html>
`.trim()

const createHtmlCodeblock = (title: string, code: string) => `
<br>
<div class="mdl-card mdl-shadow--2dp" style="width: 100%;">
    <div class="mdl-card__title">
        <h2 class="mdl-card__title-text">${title}</h2>
    </div>
    <div class="mdl-card__supporting-text">
        <pre><code>${code}</code></pre>
    </div>
</div>
<br>
`.trim()
