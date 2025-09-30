import { query } from "@/database/query";
import { cookies } from "next/headers";
import { UserLoginParams, VerifyUserIpParams } from "./type/UserAuthProps";
import { CryptoUtilsManager } from "../cryptography/util/CryptoUtilsManager";
import { CryptoUtilsServerService } from "../cryptography/util/CryptoUtilsServerService";
import { UserAccessControlService } from "./util/UserAccessControlService";
import { MySqlUtils } from "@/lib/utils/mysql/MySqlUtils";
import { CryptoServerService } from "../cryptography/CryptoServerService";

export class UserAuthServerService {
  async login(params: UserLoginParams) {
    const { email, password, ip_address } = params;
    const util = new MySqlUtils();
    const { columns, values } = util.generateFindQuery({
      column: {
        email: email,
      },
      operator: "equals",
    });
    const queryString = `SELECT * FROM v_UserAccess WHERE ${columns} LIMIT 1;`;
    console.log(queryString);
    console.log(values);
    try {
      const validateUserEmailResult: any = await query({
        query: queryString,
        values: values,
      });

      if (validateUserEmailResult.length === 0) {
        return {
          isSuccess: false,
          message:
            "Please ensure you are using the correct credentials for this account.",
          data: [],
        };
      }

      if (validateUserEmailResult[0].is_active !== 1) {
        return {
          isSuccess: false,
          message: "Access denied. This account is no longer active.",
          data: [],
        };
      }

      const getUserPassword = validateUserEmailResult[0].password;
      const decipher = new CryptoServerService();
      const { isSuccess, decryptedData, message } = await decipher.decrypt({
        data: getUserPassword,
      });

      if (!isSuccess) {
        console.log(message);
        return {
          isSuccess: false,
          message: "Data parse error occurred.",
          data: [],
        };
      }

      const isUserPasswordMatch = decryptedData === password;
      if (!isUserPasswordMatch) {
        return {
          isSuccess: false,
          message:
            "Please ensure you are using the correct credentials for this account.",
          data: [],
        };
      }

      // Check if the user is SUPER ADMINISTRATOR
      const IS_USER_SUPER_ADMIN = validateUserEmailResult[0].user_type_id === 1;
      if (!IS_USER_SUPER_ADMIN) {
        // Check if the user is whitelisted.
        const userIpAccess = new UserAccessControlService();
        const ipAccessVerificationResult =
          await userIpAccess.verifyUserAccessByIp({
            ip_address: `${ip_address}`,
          });

        if (!ipAccessVerificationResult.isSuccess) {
          // If the IP is not whitelisted, return a 403 Forbidden response.
          return ipAccessVerificationResult;
        }
      }

      const data = await processUserSessionDataEncryption(
        validateUserEmailResult
      );
      const isUserExists = data.length > 0;
      console.log("is_active:", data[0].is_active);
      return {
        isSuccess: true,
        message:
          isUserExists && data[0].is_active === 1 // user is active
            ? "Sign in successfully!"
            : isUserExists && data[0].is_active === 0 // user is inactive
            ? "Account is inactive!"
            : "Please ensure you are using the correct credentials for this account.",
        data: data,
      };
    } catch (error: any) {
      console.error(error);
      return {
        isSuccess: false,
        message: "Something went wrong! Please reload the page and try again.",
        data: [],
      };
    }
  }

  async destroySession() {
    try {
      // Destroy the session
      (await cookies()).set("session", "", { expires: new Date(0) });
      return { isSuccess: true };
    } catch (error: any) {
      console.error(error);
      return {
        isSuccess: false,
        message: "Something went wrong! Please reload the page.",
      };
    }
  }

  isTokenValid(token: string) {
    return token && token === process.env.NEXT_SERVER_ACCESS_TOKEN;
  }

  async verifyUserIp(params: VerifyUserIpParams) {
    const util = new MySqlUtils();
    const { columns, values } = util.generateFindQuery({
      column: params,
      operator: "equals",
    });
    const queryString = `SELECT * FROM User_IP_Whitelist WHERE ${columns}`;
    try {
      const validateUserIpAddress: any = await query({
        query: queryString,
        values: values,
      });

      if (validateUserIpAddress.length === 0) {
        return {
          isSuccess: false,
          data: [],
          message: "Access denied. IP address not whitelisted.",
        };
      }

      if (validateUserIpAddress[0].is_active !== 1) {
        return {
          isSuccess: false,
          data: [],
          message: "Access denied. IP address is no longer active.",
        };
      }
      console.log(validateUserIpAddress);
      return {
        isSuccess: true,
        data: [],
        message: "Authorized access",
      };
    } catch (error: any) {
      console.error(error);
      return {
        isSuccess: false,
        message: "Something went wrong! Please reload the page and try again.",
        data: [],
      };
    }
  }
}

const processUserSessionDataEncryption = async (session: any) => {
  const decipher = new CryptoUtilsManager(new CryptoUtilsServerService());
  for (const user of session) {
    const decryptedUserId = (
      await decipher.cryptoArrayString({
        data: String(user.id),
        isEncrypt: true,
      })
    ).string();
    user.id = decryptedUserId;
  }

  return session;
};
