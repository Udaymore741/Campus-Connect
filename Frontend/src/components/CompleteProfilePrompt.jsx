import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function CompleteProfilePrompt({ isOpen, onClose, onContinue }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-white">Complete Your Profile</DialogTitle>
          <DialogDescription>
            Please complete your profile information to get the best experience on Campus Connect.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-4 mt-4">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Skip for now
          </Button>
          <Button
            onClick={onContinue}
          >
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 