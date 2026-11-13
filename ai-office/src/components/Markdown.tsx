import { Fragment, type ReactNode } from "react";

// Rapor gösterimi için küçük ve güvenli Markdown çevirici: HTML üretmez, yalnızca React öğeleri döner.

function inline(text: string, key: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\(https?:\/\/[^\s)]+\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const t = m[0];
    const k = `${key}-${i++}`;
    if (t.startsWith("**")) out.push(<strong key={k}>{t.slice(2, -2)}</strong>);
    else if (t.startsWith("`")) out.push(<code key={k}>{t.slice(1, -1)}</code>);
    else {
      const mm = /^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/.exec(t)!;
      out.push(
        <a key={k} href={mm[2]} target="_blank" rel="noopener noreferrer nofollow">
          {mm[1]}
        </a>,
      );
    }
    last = m.index + t.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

const cells = (line: string) => line.replace(/^\s*\|/, "").replace(/\|\s*$/, "").split("|").map((c) => c.trim());

export function Markdown({ text }: { text: string }) {
  const lines = text.replace(/\r/g, "").split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  let k = 0;
  while (i < lines.length) {
    const line = lines[i];
    const key = `b${k++}`;
    if (!line.trim()) {
      i++;
    } else if (line.startsWith("```")) {
      const buf: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) buf.push(lines[i++]);
      i++;
      blocks.push(<pre key={key}>{buf.join("\n")}</pre>);
    } else if (/^#{1,6}\s/.test(line)) {
      const level = Math.min(4, line.match(/^#+/)![0].length);
      const content = inline(line.replace(/^#+\s*/, ""), key);
      blocks.push(level <= 1 ? <h2 key={key}>{content}</h2> : level === 2 ? <h3 key={key}>{content}</h3> : <h4 key={key}>{content}</h4>);
      i++;
    } else if (/^(-{3,}|\*{3,})\s*$/.test(line)) {
      blocks.push(<hr key={key} />);
      i++;
    } else if (line.startsWith(">")) {
      const buf: string[] = [];
      while (i < lines.length && lines[i].startsWith(">")) buf.push(lines[i++].replace(/^>\s?/, ""));
      blocks.push(<blockquote key={key}>{inline(buf.join(" "), key)}</blockquote>);
    } else if (/^\s*([-*]|\d+[.)])\s+/.test(line)) {
      const ordered = /^\s*\d+[.)]\s+/.test(line);
      const items: string[] = [];
      while (i < lines.length && /^\s*([-*]|\d+[.)])\s+/.test(lines[i])) items.push(lines[i++].replace(/^\s*([-*]|\d+[.)])\s+/, ""));
      const lis = items.map((it, n) => <li key={n}>{inline(it, `${key}-${n}`)}</li>);
      blocks.push(ordered ? <ol key={key}>{lis}</ol> : <ul key={key}>{lis}</ul>);
    } else if (line.trim().startsWith("|") && i + 1 < lines.length && /^\s*\|?[\s:|-]+\|[\s:|-]*$/.test(lines[i + 1])) {
      const head = cells(line);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) rows.push(cells(lines[i++]));
      blocks.push(
        <div className="md-table" key={key}>
          <table>
            <thead>
              <tr>{head.map((h, n) => <th key={n}>{inline(h, `${key}h${n}`)}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((r, rn) => (
                <tr key={rn}>{r.map((c, n) => <td key={n}>{inline(c, `${key}r${rn}c${n}`)}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
    } else {
      const buf: string[] = [];
      while (i < lines.length && lines[i].trim() && !/^(#{1,6}\s|>|```|\s*([-*]|\d+[.)])\s+|\s*\|)/.test(lines[i])) buf.push(lines[i++]);
      if (!buf.length) buf.push(lines[i++]);
      blocks.push(
        <p key={key}>
          {buf.map((b, n) => (
            <Fragment key={n}>
              {n > 0 && <br />}
              {inline(b, `${key}-${n}`)}
            </Fragment>
          ))}
        </p>,
      );
    }
  }
  return <div className="md">{blocks}</div>;
}
