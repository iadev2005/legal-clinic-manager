import { BaseRepository } from './base.repository';
import { NotFoundError } from '../errors';

// Usuario Repository - to be fully implemented in Phase 3
export class UsuarioRepository extends BaseRepository {
  constructor() {
    super('usuarios');
  }

  async create(data: any): Promise<any> {
    const fields = Object.keys(data);
    const values = Object.values(data);
    const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');
    const fieldNames = fields.join(', ');

    const sql = `
      INSERT INTO usuarios (${fieldNames})
      VALUES (${placeholders})
      RETURNING *
    `;

    const result = await this.execute(sql, values);
    return result[0];
  }

  async findById(id: number): Promise<any> {
    const usuario = await super.findById(id);
    if (!usuario) {
      throw new NotFoundError('Usuario', id);
    }
    return usuario;
  }

  async findByEmail(email: string): Promise<any | null> {
    const result = await this.execute(
      'SELECT * FROM usuarios WHERE email = $1 AND activo = true',
      [email]
    );
    return result[0] || null;
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
      UPDATE usuarios 
      SET ${setClause}, updated_at = NOW()
      WHERE id = $1 AND activo = true
      RETURNING *
    `;

    const result = await this.execute(sql, [id, ...values]);
    
    if (!result[0]) {
      throw new NotFoundError('Usuario', id);
    }
    
    return result[0];
  }

  async delete(id: number): Promise<any> {
    const sql = `
      UPDATE usuarios 
      SET activo = false, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;

    const result = await this.execute(sql, [id]);
    
    if (!result[0]) {
      throw new NotFoundError('Usuario', id);
    }
    
    return result[0];
  }
}
