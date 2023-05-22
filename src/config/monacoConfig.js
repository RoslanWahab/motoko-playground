import { configure } from "motoko/contrib/monaco";
import prettier from "prettier";

const errorCodes = require("motoko/contrib/generated/errorCodes.json");

export const configureMonaco = (monaco) => {
  configure(monaco, {
    snippets: true,
  });

  // Asynchronously load WASM
  import("prettier-plugin-motoko/lib/environments/web")
    .then((motokoPlugin) => {
      monaco.languages.registerDocumentFormattingEditProvider("motoko", {
        provideDocumentFormattingEdits(model, options, token) {
          const source = model.getValue();
          const formatted = prettier.format(source, {
            plugins: [motokoPlugin],
            filepath: "*.mo",
          });
          return [
            {
              range: model.getFullModelRange(),
              text: formatted,
            },
          ];
        },
      });
    })
    .catch((err) => console.error(err));

  monaco.languages.registerHoverProvider("motoko", {
    provideHover(_model, position) {
      for (const diag of monaco.editor.getModelMarkers()) {
        const range = new monaco.Range(
          diag.startLineNumber,
          diag.startColumn,
          diag.endLineNumber,
          diag.endColumn
        );
        const explanation = errorCodes[diag.code];
        if (explanation && range.containsPosition(position)) {
          return {
            range,
            contents: [
              {
                value: explanation,
              },
            ],
          };
        }
      }
    },
  });
};
