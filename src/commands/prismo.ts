import { window, TextEditor, commands, Range, Position, TextDocument, Selection } from 'vscode'
import decorate from '../utils/decorate'
import { getRuler } from '../utils/ruler'
import { getConfig } from '../utils/config'
import resolveLengthDiff from '../utils/comments'

export default function prismo(): void {
  const editor : TextEditor  = window.activeTextEditor
  if (!editor) {
    window.showErrorMessage('[Prismo]: No currently active editor.')
    return
  }
  const selection : Selection = editor.selection
  if (!selection.isSingleLine) {
    // TODO: handle multiple lines
    window.showErrorMessage(
      '[Prismo]: Decorating multiple lines is not currently supported.'
    )
    return
  }
  const document : TextDocument = editor.document

  const lineNumber = selection.anchor.line
  const line = document.lineAt(lineNumber)
  const { firstNonWhitespaceCharacterIndex: indentStartIndex } = line
  const range : Range = line.range

  const title = editor.document.getText(range).trim()
  commands.executeCommand('editor.action.commentLine').then(() => {
    const rulerWidth: number = getRuler()
    const diff = resolveLengthDiff(editor, title)
    const decoratedTitle: string = decorate(
      title,
      rulerWidth - indentStartIndex - 1 - diff,
      getConfig()
    )

    const rangeToReplace: Range = new Range(
      new Position(lineNumber, indentStartIndex),
      new Position(lineNumber, rulerWidth)
    )
    editor.edit(edit => edit.replace(rangeToReplace, decoratedTitle))
    // TODO: move back first starting position to initial and comment line
    commands.executeCommand('editor.action.commentLine')
  })
}
