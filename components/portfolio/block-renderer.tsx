import Image from 'next/image';
import { ContentBlock, TextBlockPayload, ImageBlockPayload, TableBlockPayload, YoutubeBlockPayload, ButtonBlockPayload, EmbedBlockPayload } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

interface BlockRendererProps {
  blocks: ContentBlock[];
}

export function BlockRenderer({ blocks }: BlockRendererProps) {
  const sortedBlocks = [...blocks].sort((a, b) => a.block_order - b.block_order);

  return (
    <div className="space-y-6">
      {sortedBlocks.map((block) => (
        <RenderBlock key={block.id} block={block} />
      ))}
    </div>
  );
}

function RenderBlock({ block }: { block: ContentBlock }) {
  switch (block.block_type) {
    case 'text':
      return <TextBlock payload={block.payload as TextBlockPayload} />;
    case 'image':
      return <ImageBlock payload={block.payload as ImageBlockPayload} />;
    case 'table':
      return <TableBlock payload={block.payload as TableBlockPayload} />;
    case 'youtube':
      return <YoutubeBlock payload={block.payload as YoutubeBlockPayload} />;
    case 'button':
      return <ButtonBlock payload={block.payload as ButtonBlockPayload} />;
    case 'embed':
      return <EmbedBlock payload={block.payload as EmbedBlockPayload} />;
    default:
      return null;
  }
}

function TextBlock({ payload }: { payload: TextBlockPayload }) {
  return (
    <div
      className="prose prose-neutral dark:prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: payload.content }}
    />
  );
}

function ImageBlock({ payload }: { payload: ImageBlockPayload }) {
  return (
    <figure className="space-y-2">
      <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
        <Image src={payload.url} alt={payload.caption || 'Image'} fill className="object-contain" />
      </div>
      {payload.caption && (
        <figcaption className="text-center text-sm text-muted-foreground">{payload.caption}</figcaption>
      )}
    </figure>
  );
}

function TableBlock({ payload }: { payload: TableBlockPayload }) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full">
        <thead className="bg-muted">
          <tr>
            {payload.headers.map((header, i) => (
              <th key={i} className="px-4 py-2 text-left font-medium">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {payload.rows.map((row, i) => (
            <tr key={i} className="border-t">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-2">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function YoutubeBlock({ payload }: { payload: YoutubeBlockPayload }) {
  return (
    <div className="space-y-2">
      <div className="relative aspect-video overflow-hidden rounded-lg">
        <iframe
          src={`https://www.youtube.com/embed/${payload.video_id}`}
          title={payload.title || 'YouTube video'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      </div>
      {payload.title && (
        <p className="text-center text-sm text-muted-foreground">{payload.title}</p>
      )}
    </div>
  );
}

function ButtonBlock({ payload }: { payload: ButtonBlockPayload }) {
  return (
    <div className="flex justify-center">
      <a href={payload.url} target="_blank" rel="noopener noreferrer">
        <Button className="gap-2">
          {payload.text}
          <ExternalLink className="h-4 w-4" />
        </Button>
      </a>
    </div>
  );
}

function EmbedBlock({ payload }: { payload: EmbedBlockPayload }) {
  return (
    <div className="space-y-2">
      <div
        className="overflow-hidden rounded-lg"
        dangerouslySetInnerHTML={{ __html: payload.html }}
      />
      {payload.title && (
        <p className="text-center text-sm text-muted-foreground">{payload.title}</p>
      )}
    </div>
  );
}
