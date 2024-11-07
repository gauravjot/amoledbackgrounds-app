import {SEND_ERROR_LOGS_URL} from "@/appconfig";
import axios from "axios";
import * as SqlUtility from "@/lib/utils/sql";

export default async function SendErrorLogs(isSendingEnabled: boolean) {
  if (!isSendingEnabled) {
    return;
  }
  const logs = await SqlUtility.getAllErrorLogs();
  if (logs.length > 0) {
    await axios.post(SEND_ERROR_LOGS_URL, SqlUtility.getAllErrorLogs(), {
      headers: {
        "Content-Type": "application/json",
      },
    });
    await SqlUtility.deleteAllErrorLogs();
  }
}
