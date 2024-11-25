import sqlite3 from "better-sqlite3";
import { SyncDatabase } from "@pilcrowjs/db-query";
import { readFileSync } from "fs";
import { join } from "path";

import type { SyncAdapter } from "@pilcrowjs/db-query";

// 使用绝对路径并确保数据库文件可写
const dbPath = join(process.cwd(), "sqlite.db");
const sqlite = sqlite3(dbPath, { fileMustExist: false });

// 初始化数据库表
const schema = readFileSync(join(process.cwd(), "src/lib/server/schema.sql"), "utf-8");
schema.split(";").forEach((statement) => {
  const trimmed = statement.trim();
  if (trimmed) {
    sqlite.exec(trimmed);
  }
});

const adapter: SyncAdapter<sqlite3.RunResult> = {
  query: (statement: string, params: unknown[]): unknown[][] => {
    const result = sqlite
      .prepare(statement)
      .raw()
      .all(...params);
    return result as unknown[][];
  },
  queryOne: (statement: string, params: unknown[]): unknown[] | null => {
    const result = sqlite.prepare(statement).raw().get(...params);
    return result === undefined ? null : (result as unknown[]);
  },
  execute: (statement: string, params: unknown[]): sqlite3.RunResult => {
    const result = sqlite.prepare(statement).run(...params);
    return result;
  }
};

export const db = new SyncDatabase(adapter);
