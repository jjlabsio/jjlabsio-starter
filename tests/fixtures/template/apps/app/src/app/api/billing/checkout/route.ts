export async function GET() {
  const successUrl = new URL("/", "http://localhost:3000").toString();
  return new Response(successUrl);
}
