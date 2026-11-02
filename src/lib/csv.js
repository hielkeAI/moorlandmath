export function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = '';
  let inQuotes = false;

  const pushValue = () => {
    row.push(value.trim());
    value = '';
  };
  const pushRow = () => {
    if (row.some((cell) => cell !== '')) rows.push(row);
    row = [];
  };

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          value += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        value += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      pushValue();
    } else if (char === '\n') {
      pushValue();
      pushRow();
    } else if (char !== '\r') {
      value += char;
    }
  }
  pushValue();
  pushRow();
  return rows;
}

export function parseRoster(text) {
  const rows = parseCsv(text);
  if (!rows.length) return { students: [], skipped: 0 };

  const header = rows[0].map((cell) => cell.toLowerCase());
  const nameIdx = header.findIndex((cell) => /^(student name|name|full name|preferred name|legal name)$/.test(cell));
  const firstIdx = header.findIndex((cell) => /^(forename|first name|firstname)$/.test(cell));
  const lastIdx = header.findIndex((cell) => /^(surname|last name|lastname|family name)$/.test(cell));
  const emailIdx = header.findIndex((cell) => /e-?mail/.test(cell));
  const hasHeader = nameIdx >= 0 || firstIdx >= 0 || lastIdx >= 0 || emailIdx >= 0;
  const body = hasHeader ? rows.slice(1) : rows;

  const students = [];
  let skipped = 0;

  body.forEach((cells) => {
    let name = '';
    if (nameIdx >= 0) {
      name = cells[nameIdx] || '';
    } else if (firstIdx >= 0 || lastIdx >= 0) {
      name = [cells[firstIdx], cells[lastIdx]].filter(Boolean).join(' ');
    } else {
      name = cells[0] || '';
    }
    const email = emailIdx >= 0 ? cells[emailIdx] || '' : '';
    const clean = name.replace(/\s+/g, ' ').trim();
    if (!clean) {
      skipped += 1;
      return;
    }
    students.push({ name: clean, email });
  });

  return { students, skipped };
}