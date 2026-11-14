/**
 * columns: [{ key, header, align?: 'left'|'right', numeric?: boolean, render?: (row) => node }]
 */
export function DataTable({ columns, rows, rowKey, caption }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[32rem] border-collapse text-sm">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr className="border-b border-line">
            {columns.map((c) => (
              <th
                key={c.key}
                scope="col"
                className={`eyebrow whitespace-nowrap px-5 py-3 font-medium ${c.align === 'right' ? 'text-right' : 'text-left'}`}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={rowKey ? rowKey(row) : i} className="border-b border-line/60 last:border-0 hover:bg-raised/50">
              {columns.map((c) => (
                <td
                  key={c.key}
                  className={`px-5 py-3 text-ink ${c.align === 'right' ? 'text-right' : 'text-left'} ${c.numeric ? 'num' : ''}`}
                >
                  {c.render ? c.render(row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
