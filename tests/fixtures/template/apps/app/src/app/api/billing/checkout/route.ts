export async function GET() {
  const successUrl = new URL("/dashboard", "http://localhost:3000").toString();
  return new Response(successUrl);
}
