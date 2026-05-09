import type { Block } from 'payload'

export const CodeBlock: Block = {
  slug: 'code',
  interfaceName: 'CodeBlock',
  labels: { singular: 'Code', plural: 'Code blocks' },
  fields: [
    {
      name: 'language',
      type: 'select',
      required: true,
      defaultValue: 'ts',
      admin: { description: 'Add more in the schema as needed.' },
      options: [
        { label: 'TypeScript', value: 'ts' },
        { label: 'JavaScript', value: 'js' },
        { label: 'TSX',        value: 'tsx' },
        { label: 'JSX',        value: 'jsx' },
        { label: 'Bash',       value: 'bash' },
        { label: 'JSON',       value: 'json' },
        { label: 'YAML',       value: 'yaml' },
        { label: 'SQL',        value: 'sql' },
        { label: 'Python',     value: 'python' },
        { label: 'Go',         value: 'go' },
        { label: 'Rust',       value: 'rust' },
        { label: 'HTML',       value: 'html' },
        { label: 'CSS',        value: 'css' },
        { label: 'Markdown',   value: 'md' },
        { label: 'Plain text', value: 'plaintext' },
      ],
    },
    { name: 'filename', type: 'text', admin: { description: 'Optional filename header.' } },
    { name: 'code',     type: 'code', required: true },
  ],
}
