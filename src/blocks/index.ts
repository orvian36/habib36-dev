import type { Block } from 'payload'
import { CalloutBlock } from './callout/config'
import { DividerBlock } from './divider/config'
import { PullQuoteBlock } from './pull-quote/config'

export const blocks: Block[] = [
  CalloutBlock,
  DividerBlock,
  PullQuoteBlock,
]
