import {
  window,
  TextEditor,
  commands,
  Range,
  Position,
  TextDocument,
  Selection
} from 'vscode'
import decorate from '../utils/decorate'
import { getRulerByLevel } from '../utils/ruler'
import { getConfig } from '../utils/config'
import resolveLengthDiff from '../utils/comments/index'

/**
 * 
 * TODO: document
 * @export
 * @param {number} [level=0] 
 */
export default function prismo(level: number = 0): void {
  const editor: TextEditor = window.activeTextEditor
  if (!editor) {
    window.showErrorMessage('[Prismo]: No currently active editor.')
    return
  }
  const selection: Selection = editor.selection
  if (!selection.isSingleLine) {
    // TODO: handle multiple lines
    window.showErrorMessage(
      '[Prismo]: Decorating multiple lines is not currently supported.'
    )
    return
  }
  const document: TextDocument = editor.document

  const lineNumber = selection.anchor.line
  const line = document.lineAt(lineNumber)
  const { firstNonWhitespaceCharacterIndex: indentStartIndex } = line
  const range: Range = line.range

  const title = editor.document.getText(range).trim()
  const rulerWidth: number = getRulerByLevel(level)
  resolveLengthDiff(document.languageId)
    .then(diff => {
      const decoratedTitle: string = decorate(
        title,
        rulerWidth - indentStartIndex - diff,
        getConfig(),
        level
      )

      const rangeToReplace: Range = new Range(
        new Position(lineNumber, indentStartIndex),
        new Position(lineNumber, rulerWidth)
      )
      editor.edit(edit => edit.replace(rangeToReplace, decoratedTitle))
      commands.executeCommand('editor.action.commentLine')
    })
    .catch(() => {
      window.showErrorMessage('Prismo: Ruler could not be computed.')
    })
}
