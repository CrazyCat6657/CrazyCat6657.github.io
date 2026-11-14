// Text-only blocks stay inside the existing hub modal and share its input owner.
export function mountRelicPreview(container, preview) {
  const root = document.createElement('div');
  root.className = 'relic-preview';
  for (const [title, values, cls] of [['收益',preview.benefits,'benefit'],['代价',preview.costs,'cost']]) {
    const section = document.createElement('section');
    section.className = cls;
    const heading = document.createElement('h3');
    heading.textContent = title;
    section.append(heading);
    for (const value of values) {
      const line = document.createElement('p');
      line.textContent = value;
      section.append(line);
    }
    root.append(section);
  }
  const notes = document.createElement('p');
  notes.className = 'relic-notes';
  notes.textContent = preview.notes.join(' ');
  root.append(notes);
  container.prepend(root);
}
