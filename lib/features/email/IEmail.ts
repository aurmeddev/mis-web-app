import { ApiResponseProps } from "@/database/query";

interface IEmailMessage {
  from: string;
  to: string;
  replyTo: string;
  subject: string;
  text: string;
}
interface IEmailProvider {
  sendEmail(message: IEmailMessage): Promise<ApiResponseProps>;
}

export type { IEmailMessage, IEmailProvider };
