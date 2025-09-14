import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import VariableComponent from '../components/VariableComponent'

const Variable = Node.create({
  name: 'variable',

  group: 'inline',

  inline: true,

  atom: true,

  addAttributes() {
    return {
      name: {
        default: '',
        parseHTML: element => element.getAttribute('data-name'),
        renderHTML: attributes => {
          if (!attributes.name) {
            return {}
          }
          return {
            'data-name': attributes.name,
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="variable"]',
        getAttrs: element => ({
          name: element.getAttribute('data-name'),
        }),
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, { 'data-type': 'variable' }), 0]
  },

  addNodeView() {
    return ReactNodeViewRenderer(VariableComponent)
  },

  addCommands() {
    return {
      setVariable: (attributes) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: attributes,
        })
      },
    }
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('variablePasteHandler'),
        props: {
          handlePaste: (view, event, slice) => {
            const text = event.clipboardData?.getData('text/plain') || ''
            
            // Check if pasted text contains variable syntax like {variable_name}
            const variableRegex = /\{([^}]+)\}/g
            const matches = [...text.matchAll(variableRegex)]
            
            if (matches.length > 0) {
              event.preventDefault()
              
              const { state, dispatch } = view
              const { selection } = state
              
              // Replace each {variable_name} with a Variable node
              let tr = state.tr
              let pos = selection.from
              
              matches.forEach(match => {
                const variableName = match[1]
                const node = state.schema.nodes.variable.create({ name: variableName })
                tr = tr.insert(pos, node)
                pos += node.nodeSize
              })
              
              dispatch(tr)
              return true
            }
            
            return false
          },
        },
      }),
    ]
  },
})

export default Variable
