import { createContext, useContext, type ReactNode } from 'react'
import Markdown, { defaultUrlTransform, type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { parseMentionHref, type Mention } from '../../../lib/gm/notes'

interface NoteRender {
  renderMention: (mention: Mention, label: ReactNode) => ReactNode
  /** Sem ele, as caixinhas das tarefas só mostram o estado. */
  onToggleTask?: (offset: number) => void
}

const NoteRenderContext = createContext<NoteRender>({ renderMention: (_, label) => label })
/** Alterna a tarefa do `<li>` mais próximo — o `<input>` não sabe onde está no texto, o item sabe. */
const TaskToggleContext = createContext<(() => void) | null>(null)

const REMARK_PLUGINS = [remarkGfm]

/** Menções passam com o esquema próprio; o resto segue o filtro padrão (que barra `javascript:`). */
function urlTransform(url: string): string {
  return parseMentionHref(url) ? url : defaultUrlTransform(url)
}

function Link({ href, children }: { href?: string; children?: ReactNode }) {
  const { renderMention } = useContext(NoteRenderContext)
  const mention = parseMentionHref(href)
  if (mention) return renderMention(mention, children)
  // Endereço barrado pelo filtro (`javascript:`…) chega vazio: fica só o texto.
  if (!href) return <span className="underline decoration-dotted underline-offset-2">{children}</span>
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-[#E8C25A] underline underline-offset-2 hover:text-[#F5F0E8]">
      {children}
    </a>
  )
}

function ListItem({ node, className, children }: { node?: { position?: { start: { offset?: number } } }; className?: string; children?: ReactNode }) {
  const { onToggleTask } = useContext(NoteRenderContext)
  const offset = node?.position?.start.offset
  const isTask = className?.includes('task-list-item') ?? false
  const item = <li className={isTask ? 'list-none -ml-5 my-1' : 'my-1'}>{children}</li>
  if (!isTask || offset == null || !onToggleTask) return item
  return <TaskToggleContext.Provider value={() => onToggleTask(offset)}>{item}</TaskToggleContext.Provider>
}

function TaskBox({ checked, type }: { checked?: boolean; type?: string }) {
  const toggle = useContext(TaskToggleContext)
  if (type !== 'checkbox') return null
  return (
    <input
      type="checkbox"
      checked={checked ?? false}
      disabled={!toggle}
      onChange={() => toggle?.()}
      className="w-4 h-4 mr-2 align-[-2px] scheme-dark accent-[#D4A017] cursor-pointer disabled:cursor-default"
    />
  )
}

/** Fora do componente: tipos novos a cada render fariam o React remontar a nota inteira. */
const COMPONENTS: Components = {
  a: ({ href, children }) => <Link href={href}>{children}</Link>,
  li: ({ node, className, children }) => <ListItem node={node} className={className}>{children}</ListItem>,
  input: ({ checked, type }) => <TaskBox checked={checked} type={type} />,
  h1: ({ children }) => <h3 className="font-cinzel text-[22px] font-semibold text-[#F5F0E8] mt-6 mb-2 first:mt-0">{children}</h3>,
  h2: ({ children }) => <h4 className="font-cinzel text-[19px] font-semibold text-[#EAD9B0] mt-5 mb-2 first:mt-0">{children}</h4>,
  h3: ({ children }) => <h5 className="font-cinzel text-[16px] font-semibold text-[#EAD9B0] mt-4 mb-1.5 first:mt-0">{children}</h5>,
  h4: ({ children }) => <h6 className="text-[15px] font-bold text-[#EAD9B0] mt-4 mb-1 first:mt-0">{children}</h6>,
  h5: ({ children }) => <p className="text-[14px] font-bold text-[#EAD9B0] mt-3 mb-1">{children}</p>,
  h6: ({ children }) => <p className="text-[13px] font-bold uppercase tracking-wider text-[#A8A09B] mt-3 mb-1">{children}</p>,
  p: ({ children }) => <p className="my-2.5 first:mt-0 last:mb-0">{children}</p>,
  ul: ({ children }) => <ul className="list-disc pl-5 my-2.5 marker:text-[#D4A017]">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal pl-5 my-2.5 marker:text-[#D4A017]">{children}</ol>,
  blockquote: ({ children }) => (
    <blockquote className="my-3 border-l-2 border-[#D4A017] bg-[rgba(212,160,23,0.06)] rounded-r-[8px] pl-4 pr-3 py-1.5 text-[#EAD9B0] italic">{children}</blockquote>
  ),
  hr: () => <hr className="my-5 border-0 h-px bg-[rgba(212,160,23,0.25)]" />,
  pre: ({ children }) => (
    <pre className="my-3 overflow-x-auto rounded-[10px] bg-[#131110] border border-white/[0.07] p-3 text-[13px] leading-relaxed [&_code]:bg-transparent [&_code]:p-0 [&_code]:border-0">{children}</pre>
  ),
  code: ({ children }) => <code className="font-mono text-[0.9em] bg-[#131110] border border-white/[0.07] rounded px-1 py-px">{children}</code>,
  table: ({ children }) => (
    <div className="my-3 overflow-x-auto">
      <table className="w-full border-collapse text-[14px]">{children}</table>
    </div>
  ),
  th: ({ children }) => <th className="border-b border-[rgba(212,160,23,0.3)] px-2.5 py-1.5 text-left font-semibold text-[#EAD9B0]">{children}</th>,
  td: ({ children }) => <td className="border-b border-white/[0.06] px-2.5 py-1.5 align-top">{children}</td>,
  img: ({ src, alt }) => (
    <img src={typeof src === 'string' ? src : undefined} alt={alt ?? ''} loading="lazy" referrerPolicy="no-referrer" className="my-3 max-w-full rounded-[10px]" />
  ),
}

interface MarkdownNoteProps extends NoteRender {
  markdown: string
}

/**
 * Nota renderizada. HTML cru no texto aparece como texto (nada de
 * `dangerouslySetInnerHTML`); links externos abrem fora do app.
 */
export function MarkdownNote({ markdown, renderMention, onToggleTask }: MarkdownNoteProps) {
  return (
    <NoteRenderContext.Provider value={{ renderMention, onToggleTask }}>
      <div className="text-[15px] leading-relaxed text-[#E8DFD0] break-words">
        <Markdown remarkPlugins={REMARK_PLUGINS} urlTransform={urlTransform} components={COMPONENTS}>
          {markdown}
        </Markdown>
      </div>
    </NoteRenderContext.Provider>
  )
}
