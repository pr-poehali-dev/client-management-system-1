const URLS = {
  data: 'https://functions.poehali.dev/094b0301-3f96-4c9b-9e00-153c80703b69',
  events: 'https://functions.poehali.dev/f614574a-f9bf-445c-914b-82ab2c291f4e',
  settings: 'https://functions.poehali.dev/1cdff91e-c7f7-4694-9823-d864ccae0cda',
  auth: 'https://functions.poehali.dev/4176592f-e798-44c9-b7aa-7c0198e26a4e',
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

export async function updateEvent(body: object) {
  const res = await fetch(URLS.events, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function deleteEvent(id: string) {
  const res = await fetch(URLS.events, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
  return res.json();
}

export async function authUser(userId: string, password: string) {
  const res = await fetch(URLS.auth, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, password }),
  });
  return res.json();
}

export async function setUserPassword(userId: string, password: string) {
  const res = await fetch(`${URLS.settings}?entity=users`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: userId, password }),
  });
  return res.json();
}