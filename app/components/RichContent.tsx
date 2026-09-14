import { Fragment } from "react";
import type { ReactNode } from "react";

function formatInlineText(value: string): ReactNode[] {
  const parts: ReactNode[] = [];
  let position = 0;

  while (position < value.length) {
    const boldStart = value.indexOf("**", position);
    const underscoreItalicStart = value.indexOf("_", position);
    const asteriskItalicStart = value.indexOf("*", position);
    const italicStart = [underscoreItalicStart, asteriskItalicStart]
      .filter((start) => start >= 0)
      .sort((a, b) => a - b)[0] ?? -1;
    const starts = [boldStart, italicStart].filter((start) => start >= 0);
    const nextStart = starts.length ? Math.min(...starts) : -1;

    if (nextStart < 0) {
      parts.push(<Fragment key={position}>{value.slice(position)}</Fragment>);
      break;
    }

    if (nextStart > position) {
      parts.push(<Fragment key={position}>{value.slice(position, nextStart)}</Fragment>);
    }

    if (nextStart === boldStart) {
      const end = value.indexOf("**", nextStart + 2);
      if (end >= 0) {
        parts.push(<strong key={nextStart}>{formatInlineText(value.slice(nextStart + 2, end))}</strong>);
        position = end + 2;
        continue;
      }
    } else {
      const delimiter = nextStart === underscoreItalicStart ? "_" : "*";
      const end = value.indexOf(delimiter, nextStart + 1);
      if (end >= 0) {
        parts.push(<em key={nextStart}>{formatInlineText(value.slice(nextStart + 1, end))}</em>);
        position = end + 1;
        continue;
      }
    }

    parts.push(<Fragment key={nextStart}>{value.slice(nextStart, nextStart + (nextStart === boldStart ? 2 : 1))}</Fragment>);
    position = nextStart + (nextStart === boldStart ? 2 : 1);
  }

  return parts;
}

export default function RichContent({ content, inline = false }: { content: string; inline?: boolean }) {
  const blocks = content.split(/\n\s*\n/).filter(Boolean);

  // Headings (e.g. an <h1>) can't contain block elements like <p>/<ul>, so
  // inline mode flattens every block/line into plain text joined by <br>.
  if (inline) {
    return (
      <>
        {blocks.map((block, blockIndex) => {
          const lines = block.split("\n");
          return lines.map((line, lineIndex) => (
            <Fragment key={`${blockIndex}-${lineIndex}`}>
              {(blockIndex > 0 || lineIndex > 0) && <br />}
              {formatInlineText(line.startsWith("- ") ? line.slice(2) : line)}
            </Fragment>
          ));
        })}
      </>
    );
  }

  return (
    <>
      {blocks.map((block, index) => {
        const lines = block.split("\n");
        const isList = lines.every((line) => line.startsWith("- "));

        if (isList) {
          return <ul key={index} className="list-disc space-y-1 pl-5">{lines.map((line, lineIndex) => <li key={lineIndex}>{formatInlineText(line.slice(2))}</li>)}</ul>;
        }

        return <p key={index}>{lines.map((line, lineIndex) => <Fragment key={lineIndex}>{lineIndex > 0 && <br />}{formatInlineText(line)}</Fragment>)}</p>;
      })}
    </>
  );
}
