import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Image, SearchX, X } from "lucide-react";
import Link from "next/link";
import { AdCreatives } from "../AdCheckerContainer";
import { useEffect, useState } from "react";
type Props = {
  adCreatives: AdCreatives[];
  open: boolean;
  handleOpen: (open: boolean) => void;
};

export function AdCreativesDialog({ adCreatives, open, handleOpen }: Props) {
  const [images, setImages] = useState<Record<number, string>>({});

  useEffect(() => {
    const fetchImages = async () => {
      const results: Record<number, string> = {};

      await Promise.all(
        adCreatives.map(async (ad, idx) => {
          try {
            const res = await fetch(ad.image);
            results[idx] = res.url || ad.image;
          } catch (e) {
            results[idx] = ad.image; // fallback
          }
        })
      );

      setImages(results);
    };

    if (open) {
      fetchImages();
    }
  }, [adCreatives, open]);

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent
        onEscapeKeyDown={(ev) => ev.preventDefault()}
        onInteractOutside={(ev) => ev.preventDefault()}
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle>Ad Creatives</DialogTitle>
          <DialogDescription />
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 cursor-pointer">
            <X className="h-4 w-4" />
          </DialogClose>
        </DialogHeader>

        <div className="max-h-[36rem] overflow-y-auto">
          {adCreatives.length > 0 ? (
            adCreatives.map((ad, idx) => (
              <Card key={idx} className="mb-2">
                <CardContent>
                  <div className="flex gap-4">
                    <div>
                      {images[idx] ? (
                        <img
                          alt={ad.title}
                          src={images[idx]}
                          height={100}
                          width={100}
                        />
                      ) : (
                        <Image className="h-[100px] w-[100px]" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="font-semibold">{ad.title}</div>
                      <div className="text-sm">{ad.message}</div>

                      <div className="flex items-center gap-2 mt-2">
                        <div className="w-3/5">
                          <Input readOnly value={ad.url} />
                        </div>
                        <Link
                          className="flex-1 hover:underline text-ellipsis text-blue-500 text-sm"
                          target="_blank"
                          href={ad.url}
                        >
                          Preview URL
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="flex flex-col gap-2 items-center py-4">
              <SearchX className="h-10 w-10 text-muted-foreground" />
              <div className="text-sm text-muted-foreground">
                No creatives found.
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
