class HttpError extends Error {
  constructor(message, statusCode, responseBody) {
    super(message);
    this.name = 'HttpError';
    this.statusCode = statusCode;
    this.responseBody = responseBody;
  }
}

function buildQuery(query = {}) {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    params.append(key, String(value));
  });

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

async function request({ baseUrl, path, method = 'GET', token, headers = {}, body, query }) {
  const url = `${baseUrl}${path}${buildQuery(query)}`;

  const requestHeaders = {
    Accept: 'application/json',
    ...headers,
  };

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  const hasBody = body !== undefined;
  if (hasBody && !requestHeaders['Content-Type']) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    method,
    headers: requestHeaders,
    body: hasBody ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  const parsedBody = text ? safeJsonParse(text) : null;

  if (!response.ok) {
    throw new HttpError(`Gympass request failed (${response.status})`, response.status, parsedBody || text);
  }

  if (response.status === 204) {
    return null;
  }

  return parsedBody;
}

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

module.exports = {
  request,
  HttpError,
};
