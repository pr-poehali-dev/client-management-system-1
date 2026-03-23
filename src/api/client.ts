const URLS = {
  data: 'https://functions.poehali.dev/094b0301-3f96-4c9b-9e00-153c80703b69',
  events: 'https://functions.poehali.dev/f614574a-f9bf-445c-914b-82ab2c291f4e',
  settings: 'https://functions.poehali.dev/1cdff91e-c7f7-4694-9823-d864ccae0cda',
};

export async function fetchData() {
  const res = await fetch(URLS.data);
  return res.json();
}

export async function fetchEvents(params: Record<string, string> = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${URLS.events}${qs ? '?' + qs : ''}`);
  return res.json();
}

export async function createEvent(body: object) {
  const res = await fetch(URLS.events, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function addItem(entity: string, body: object) {
  const res = await fetch(`${URLS.settings}?entity=${entity}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function updateItem(entity: string, body: object) {
  const res = await fetch(`${URLS.settings}?entity=${entity}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function removeItem(entity: string, id: string) {
  const res = await fetch(`${URLS.settings}?entity=${entity}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
  return res.json();
}