import { UsersLogsClientService } from "../users/logs/UsersLogsClientService";

type LogActionParams = {
  log_type_id: number;
  description: string;
};

const userLogsService = new UsersLogsClientService();

export async function logAction({ log_type_id, description }: LogActionParams) {
  return userLogsService.post({ log_type_id, description });
}
