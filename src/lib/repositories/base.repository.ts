import { query } from '../db';
import { AppError } from '../errors/app-error';

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export abstract class BaseRepository {
  protected tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  protected async execute(text: string, params?: any[]): Promise<any[]> {
    try {
      const result = await query(text, params);
      return result.rows;
    } catch (error: any) {
      console.error(`[DB Error] ${this.tableName}:`, error.message);
      throw new AppError(
        `Database error in ${this.tableName}`,
        500,
        'DB_ERROR',
        { message: error.message }
      );
    }
  }

  async findById(id: number): Promise<any | null> {
    const result = await this.execute(
      `SELECT * FROM ${this.tableName} WHERE id = $1 AND activo = true`,
      [id]
    );
    return result[0] || null;
  }

  async findMany(filters?: Record<string, any>, additionalSql?: string): Promise<any[]> {
    let sql = `SELECT * FROM ${this.tableName} WHERE activo = true`;
    const params: any[] = [];
    let paramIndex = 1;

    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== null) {
          sql += ` AND ${key} = $${paramIndex}`;
          params.push(value);
          paramIndex++;
        }
      }
    }

    if (additionalSql) {
      sql += ` ${additionalSql}`;
    }

    sql += ' ORDER BY id DESC';

    return this.execute(sql, params);
  }

  async findManyWithPagination(
    filters?: Record<string, any>,
    pagination?: PaginationParams,
    additionalSql?: string
  ): Promise<PaginationResult<any>> {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const offset = (page - 1) * limit;

    // Build WHERE clause
    let whereSql = 'WHERE activo = true';
    const params: any[] = [];
    let paramIndex = 1;

    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== null) {
          whereSql += ` AND ${key} = $${paramIndex}`;
          params.push(value);
          paramIndex++;
        }
      }
    }

    // Get total count
    const countResult = await this.execute(
      `SELECT COUNT(*) as total FROM ${this.tableName} ${whereSql}`,
      params
    );
    const total = parseInt(countResult[0]?.total || '0', 10);

    // Get paginated data
    let dataSql = `SELECT * FROM ${this.tableName} ${whereSql}`;
    if (additionalSql) {
      dataSql += ` ${additionalSql}`;
    }
    dataSql += ` ORDER BY id DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    
    const dataParams = [...params, limit, offset];
    const data = await this.execute(dataSql, dataParams);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
