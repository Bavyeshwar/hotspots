/** Content block used inside Leaflet popups. rows: [[label, value], ...] */
export function PopupCard({ title, rows, note }) {
  return (
    <div className="fire-card">
      <p className="fire-card__title">{title}</p>
      <dl className="fire-card__grid">
        {rows.map(([label, value]) => (
          <div key={label} className="fire-card__row">
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      {note && <p className="fire-card__note">{note}</p>}
    </div>
  );
}