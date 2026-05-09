import type { Block } from 'payload'
import { CalloutBlock } from './callout/config'
import { CodeBlock } from './code/config'
import { DividerBlock } from './divider/config'
import { ImageBlock } from './image/config'
import { ImagePairBlock } from './image-pair/config'
import { MermaidBlock } from './mermaid/config'
import { PullQuoteBlock } from './pull-quote/config'
import { StatsBlock } from './stats/config'
import { StepsBlock } from './steps/config'
import { VideoBlock } from './video/config'

export const blocks: Block[] = [
  CalloutBlock,
  CodeBlock,
  DividerBlock,
  ImageBlock,
  ImagePairBlock,
  MermaidBlock,
  PullQuoteBlock,
  StatsBlock,
  StepsBlock,
  VideoBlock,
]
