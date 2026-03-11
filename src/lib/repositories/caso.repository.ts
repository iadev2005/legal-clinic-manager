import { BaseRepository } from './base.repository';
import { query } from '../db';
import { NotFoundError } from '../errors';

// Caso Repository - to be fully implemented in Phase 2
export class CasoRepository extends BaseRepository {
  constructor() {
    super('casos');
  }

  async create(data: any): Promise<any> {
    const fields = Object.keys(data);
    const values = Object.values(data);
    const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');
    const fieldNames = fields.join(', ');

    const sql = `
      INSERT INTO casos (${fieldNames})
      VALUES (${placeholders})
      RETURNING *
    `;

    const result = await this.execute(sql, values);
    return result[0];
  }

  async findById(id: number): Promise<any> {
    const caso = await super.findById(id);
    if (!caso) {
      throw new NotFoundError('Caso', id);
    }
    return caso;
  }

  async findMany(filters?: Record<string, any>): Promise<any[]> {
    return super.findMany(filters);
  }

  async update(id: number, data: any): Promise<any> {
    const fields = Object.keys(data);
    const values = Object.values(data);
    
    if (fields.length === 0) {
      return this.findById(id);
    }

    const setClause = fields.map((field, i) => `${field} = $${i + 2}`).join(', ');
    const sql = `
      UPDATE casos 
      SET ${setClause}, updated_at = NOW()
      WHERE id = $1 AND activo = true
      RETURNING *
    `;

    const result = await this.execute(sql, [id, ...values]);
    
    if (!result[0]) {
      throw new NotFoundError('Caso', id);
    }
    
    return result[0];
  }

  async delete(id: number): Promise<any> {
    // Soft delete
    const sql = `
      UPDATE casos 
      SET activo = false, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;

    const result = await this.execute(sql, [id]);
    
    if (!result[0]) {
      throw new NotFoundError('Caso', id);
    }
    
    return result[0];
  }

  async getEstatusActual(casoId: number): Promise<any> {
    const sql = `
      SELECT e.* 
      FROM estatus e
      JOIN casos_estatus ce ON e.id = ce.estatus_id
      WHERE ce.caso_id = $1
      ORDER BY ce.fecha_cambio DESC
      LIMIT 1
    `;
    
    const result = await this.execute(sql, [casoId]);
    return result[0];
  }

  async findWithFilters(
    search?: string,
    estatusId?: number,
    fechaInicio?: string,
    fechaFin?: string
  ): Promise<any[]> {
    let sql = `
      SELECT c.*, e.nombre as estatus_actual
      FROM casos c
      LEFT JOIN (
        SELECT ce.caso_id, e.nombre
        FROM casos_estatus ce
        JOIN estatus e ON ce.estatus_id = e.id
        WHERE ce.id IN (
          SELECT MAX(id) FROM casos_estatus GROUP BY caso_id
        )
      ) e ON c.id = e.caso_id
      WHERE c.activo = true
    `;
    
    const params: any[] = [];
    let paramIndex = 1;

    if (search) {
      sql += ` AND (c.titulo ILIKE $${paramIndex} OR c.descripcion ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (estatusId) {
      sql += ` AND c.id IN (
        SELECT caso_id FROM casos_estatus 
        WHERE estatus_id = $${paramIndex} AND id IN (
          SELECT MAX(id) FROM casos_estatus GROUP BY caso_id
        )
      )`;
      params.push(estatusId);
      paramIndex++;
    }

    if (fechaInicio) {
      sql += ` AND c.fecha_creacion >= $${paramIndex}`;
      params.push(fechaInicio);
      paramIndex++;
    }

    if (fechaFin) {
      sql += ` AND c.fecha_creacion <= $${paramIndex}`;
      params.push(fechaFin);
    }

    sql += ' ORDER BY c.fecha_creacion DESC';

    return this.execute(sql, params);
  }
}
