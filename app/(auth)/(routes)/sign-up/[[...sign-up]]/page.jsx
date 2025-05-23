import { SignUp } from "@clerk/nextjs";
import './styles.css';  // Make sure to import the custom styles

export default function Page() {
  return (
    <div className="flex items-center justify-center min-h-screen animated-gradient">
      <SignUp afterSignUpUrl="/upload" />
    </div>
  );
}
