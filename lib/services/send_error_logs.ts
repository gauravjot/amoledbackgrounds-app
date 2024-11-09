import {SEND_ERROR_LOGS_URL} from "@/appconfig";
import axios from "axios";
import * as SqlUtility from "@/lib/utils/sql";

export default async function SendErrorLogs(isSendingEnabled: boolean): Promise<boolean> {
  if (!isSendingEnabled) {
    return false;
  }
  const logs = await SqlUtility.getAllErrorLogs();
  if (logs.length > 0) {
    console.log(logs);
    const result = await axios.post(SEND_ERROR_LOGS_URL, logs, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (result.status === 204) {
      await SqlUtility.deleteAllErrorLogs();
      return true;
    }
  }
  return false;
}
