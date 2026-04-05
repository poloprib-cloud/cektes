import { useMediaQuery } from "@/hooks/use-media-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import Image from "next/image";

interface GuideDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guideImage?: string;
  guideText?: string;
}

const GuideDrawer: React.FC<GuideDrawerProps> = ({ open, onOpenChange, guideImage, guideText }) => {
  const isMobile = useMediaQuery("(max-width: 768px)");

  const Content = (
    <>
      <div className="p-4 space-y-4 mx-auto">
        {/* Gambar Panduan */}
        {guideImage && (
          <Image
            src={guideImage}
            alt="Panduan"
            width={800}
            height={450}
            className="rounded-lg object-cover"
            priority={false}
          />
        )}

        {/* Teks Panduan */}
        {guideText && <p className="text-gray-800 dark:text-gray-200">{guideText}</p>}
      </div>
    </>
  );

  return isMobile ? (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="">
        <DrawerHeader>
          <DrawerTitle className="text-center">Panduan Menemukan ID</DrawerTitle>
        </DrawerHeader>
        {Content}
      </DrawerContent>
    </Drawer>
  ) : (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center">Panduan Menemukan ID</DialogTitle>
        </DialogHeader>
        {Content}
      </DialogContent>
    </Dialog>
  );
};

export default GuideDrawer;