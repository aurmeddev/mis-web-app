import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  text: string;
  fileNameWithExt: string; //eg: file.csv
  url: string;
};

export function DownloadLocalFile({
  className,
  fileNameWithExt,
  text,
  url,
}: Props) {
  return (
    <a
      href={url}
      download={fileNameWithExt}
      className={cn("hover:underline text-blue-500 text-sm", className)}
    >
      {text}
    </a>
  );
}
