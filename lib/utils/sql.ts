import * as SQLite from "expo-sqlite";
import * as Device from "expo-device";

const DB_NAME = "mysqlite.db";
const APP_NAME = "AmoledBackgrounds";
const DEVICE_NAME = Device.designName || "Unknown";
const DEVICE_PLATFORM = Device.platformApiLevel || 0;
const DEVICE_MODEL = Device.manufacturer + " " + Device.modelName;

export const setupDatabase = async () => {
  const db = await SQLite.openDatabaseAsync(DB_NAME);
  // error logger
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS errorlogs (
      id INTEGER PRIMARY KEY NOT NULL,
      app_name TEXT NOT NULL CHECK (length(app_name) <= 200),
      error_title TEXT NOT NULL CHECK (length(error_title) <= 200),
      description TEXT NOT NULL,
      file TEXT NOT NULL CHECK (length(file) <= 255),
      method TEXT NOT NULL CHECK (length(method) <= 200),
      stacktrace TEXT,
      params TEXT,
      severity TEXT NOT NULL CHECK (length(severity) <= 200),
      timestamp_occured TIMESTAMP NOT NULL,
      identifier TEXT NOT NULL,
      device_model TEXT NOT NULL CHECK (length(device_model) <= 200),
      device_platform INTEGER NOT NULL,
      device_name TEXT NOT NULL CHECK (length(device_name) <= 200)
    );
  `);
};

export type ErrorLog = {
  app_name: string;
  error_title: string;
  description: string;
  file: string;
  method: string;
  stacktrace: string;
  params: string;
  severity: string;
  timestamp_occured: string;
  identifier: string;
  device_model: string;
  device_platform: number;
  device_name: string;
};

export type RequiredErrorLog = Omit<
  ErrorLog,
  "app_name" | "timestamp_occured" | "identifier" | "device_model" | "device_platform" | "device_name"
>;

export const insertErrorLog = async (errorLog: RequiredErrorLog, deviceIdentifier: string) => {
  const db = await SQLite.openDatabaseAsync(DB_NAME);
  const query = `
    INSERT INTO errorlogs (
      app_name,
      error_title,
      description,
      file,
      method,
      stacktrace,
      params,
      severity,
      timestamp_occured,
      identifier,
      device_model,
      device_platform,
      device_name
    ) VALUES (
      "${APP_NAME}",
      "${esip(errorLog.error_title)}",
      "${esip(errorLog.description)}",
      "${esip(errorLog.file)}",
      "${esip(errorLog.method)}",
      "${esip(errorLog.stacktrace)}",
      "${esip(errorLog.params)}",
      "${errorLog.severity}",
      "${new Date().toISOString()}",
      "${deviceIdentifier}",
      "${DEVICE_MODEL}",
      ${DEVICE_PLATFORM},
      "${DEVICE_NAME}"
    );
  `;
  await db.execAsync(query);
};

export const getAllErrorLogs = async (): Promise<ErrorLog[]> => {
  const db = await SQLite.openDatabaseAsync(DB_NAME);
  const allRows = await db.getAllAsync("SELECT * FROM errorlogs");
  return (allRows as (ErrorLog & {id: number})[]).map(row => {
    const {id, ...rest} = row;
    return rest;
  });
};

export const deleteAllErrorLogs = async () => {
  const db = await SQLite.openDatabaseAsync(DB_NAME);
  await db.execAsync("DELETE FROM errorlogs");
};

const esip = (val: string | null) => {
  return val ? val.toString().replace(/"/g, '""') : val;
};
