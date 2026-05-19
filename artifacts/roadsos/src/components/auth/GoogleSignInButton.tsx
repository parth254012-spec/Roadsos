import { SiGoogle } from 'react-icons/si';
import { Button } from '@/components/ui/button';

interface GoogleSignInButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export default function GoogleSignInButton({ onClick, disabled }: GoogleSignInButtonProps) {
  return (
    <Button
      variant="outline"
      size="lg"
      className="w-full bg-white text-black hover:bg-gray-100 border-transparent font-medium py-6"
      onClick={onClick}
      disabled={disabled}
      data-testid="button-google-signin"
    >
      {disabled ? (
        <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin mr-3"></div>
      ) : (
        <SiGoogle className="mr-3 w-5 h-5 text-black" />
      )}
      Continue with Google
    </Button>
  );
}
