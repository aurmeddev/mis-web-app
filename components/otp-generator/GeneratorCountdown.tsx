import { useEffect, useState } from "react";
import { GeneratorCountdownProps } from "./type";

export function GeneratorCountdown({
  otp,
  generateOTP,
}: GeneratorCountdownProps) {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(30);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (otp) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            generateOTP(true); // refresh OTP when countdown hits 0
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [otp]);
  return (
    <div className="font-bold text-muted-foreground">{secondsRemaining}s.</div>
  );
}
