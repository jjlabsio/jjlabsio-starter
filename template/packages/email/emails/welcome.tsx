import { WelcomeEmail } from "../src/templates/welcome";

export default function WelcomePreview() {
  return (
    <WelcomeEmail
      name="Alex"
      brandName="Acme"
      appUrl="https://app.example.com"
    />
  );
}
