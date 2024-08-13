export async function editUser(input: { type: string }) {
  const request = await fetch(`https://rhythia.com/api/editUser`);
  return request.json();
}

export function GET(request: Request) {
  return new Response(`You're visiting from beautiful`);
}

export async function POST(request: Request) {
  return new Response(`good one`);
}
