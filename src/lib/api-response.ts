export function success(data: unknown, status = 200) {
  return Response.json({ success: true, data }, { status })
}

export function error(message: string, status = 400) {
  return Response.json({ success: false, error: message }, { status })
}

export function unauthorized() {
  return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 })
}

export function forbidden(message = 'Forbidden') {
  return Response.json({ success: false, error: message }, { status: 403 })
}
