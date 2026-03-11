import { BaseRepository } from './base.repository';
import { NotFoundError } from '../errors';

// Cita Repository - to be fully implemented in Phase 3
export class CitaRepository extends BaseRepository {
  constructor() {
    super('citas');
  }

  async create(data: any): Promise<any> {
    const fields = Object.keys(data);
    const values = Object.values(data);
    const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');
    const fieldNames = fields.join(', ');

    const sql = `
      INSERT INTO citas (${fieldNames})
      VALUES (${placeholders})
      RETURNING *
    `;

    const result = await this.execute(sql, values);
    return result[0];
  }

  async findById(id: number): Promise<any> {
    const cita = await super.findById(id);
    if (!cita) {
      throw new NotFoundError('Cita', id);
    }
    return cita;
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
      UPDATE citas 
      SET ${setClause}, updated_at = NOW()
      WHERE id = $1 AND activo = true
      RETURNING *
    `;

    const result = await this.execute(sql, [id, ...values]);
    
    if (!result[0]) {
      throw new NotFoundError('Cita', id);
    }
    
    return result[0];
  }

  async delete(id: number): Promise<any> {
    const sql = `
      UPDATE citas 
      SET activo = false, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;

    const result = await this.execute(sql, [id]);
    
    if (!result[0]) {
      throw new NotFoundError('Cita', id);
    }
    
    return result[0];
  }
}
