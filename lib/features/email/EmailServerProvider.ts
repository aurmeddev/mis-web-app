import { IEmailMessage, IEmailProvider } from "./IEmail";

export class EmailServerProvider {
  constructor(private emailService: IEmailProvider) {}
  sendEmail = async (message: IEmailMessage) => {
    return await this.emailService.sendEmail(message);
  };
}
