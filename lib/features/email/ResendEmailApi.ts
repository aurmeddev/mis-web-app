import { Resend } from "resend";
import { IEmailMessage } from "./IEmail";

export class ResendEmailApi {
  private resend = new Resend(process.env.NEXT_RESEND_EMAIL_API_KEY);
  sendEmail = async (message: IEmailMessage) => {
    const { data } = await this.resend.emails.send(message);
    console.log("data", data);
    if (!data) {
      console.error("Failed to send email");
      return {
        isSuccess: false,
        message: "Failed to send email!",
        data: [],
      };
    }

    console.log(`Email ${data.id} has been sent`);
    return {
      isSuccess: true,
      message: "Email has been sent successfully!",
      data: [],
    };
  };
}
