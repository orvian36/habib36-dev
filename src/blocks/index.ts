import type { Block } from 'payload'
import { CalloutBlock } from './callout/config'
import { DividerBlock } from './divider/config'
import { ImageBlock } from './image/config'
import { ImagePairBlock } from './image-pair/config'
import { PullQuoteBlock } from './pull-quote/config'

export const blocks: Block[] = [
  CalloutBlock,
  DividerBlock,
  ImageBlock,
  ImagePairBlock,
  PullQuoteBlock,
]
