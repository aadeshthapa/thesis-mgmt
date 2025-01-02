import db from "../utils/db";
import { QueryResult } from "pg";

export abstract class BaseRepository {
  protected tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  protected async findOne<T>(conditions: Partial<T>): Promise<T | null> {
    const entries = Object.entries(conditions);
    const whereClause = entries
      .map((_, index) => `${entries[index][0]} = $${index + 1}`)
      .join(" AND ");
    const values = entries.map((entry) => entry[1]);

    const query = `SELECT * FROM ${this.tableName} WHERE ${whereClause} LIMIT 1`;
    const result = await db.query<T>(query, values);

    return result.rows[0] || null;
  }

  protected async findMany<T>(conditions: Partial<T> = {}): Promise<T[]> {
    const entries = Object.entries(conditions);
    let query = `SELECT * FROM ${this.tableName}`;
    const values: any[] = [];

    if (entries.length > 0) {
      const whereClause = entries
        .map((_, index) => `${entries[index][0]} = $${index + 1}`)
        .join(" AND ");
      query += ` WHERE ${whereClause}`;
      values.push(...entries.map((entry) => entry[1]));
    }

    const result = await db.query<T>(query, values);
    return result.rows;
  }

  protected async create<T>(data: Partial<T>): Promise<T> {
    const entries = Object.entries(data);
    const columns = entries.map((entry) => entry[0]).join(", ");
    const valuePlaceholders = entries
      .map((_, index) => `$${index + 1}`)
      .join(", ");
    const values = entries.map((entry) => entry[1]);

    const query = `
      INSERT INTO ${this.tableName} (${columns})
      VALUES (${valuePlaceholders})
      RETURNING *
    `;

    const result = await db.query<T>(query, values);
    return result.rows[0];
  }

  protected async update<T>(id: string | number, data: Partial<T>): Promise<T> {
    const entries = Object.entries(data);
    const setClause = entries
      .map((_, index) => `${entries[index][0]} = $${index + 2}`)
      .join(", ");
    const values = [id, ...entries.map((entry) => entry[1])];

    const query = `
      UPDATE ${this.tableName}
      SET ${setClause}
      WHERE id = $1
      RETURNING *
    `;

    const result = await db.query<T>(query, values);
    return result.rows[0];
  }

  protected async delete(id: string | number): Promise<void> {
    const query = `DELETE FROM ${this.tableName} WHERE id = $1`;
    await db.query(query, [id]);
  }
}
