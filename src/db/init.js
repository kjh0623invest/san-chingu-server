import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { query } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');

export async function initDatabase() {
  try {
    // Check if mountains table has data
    const result = await query('SELECT COUNT(*) as count FROM mountains');
    if (result.rows[0].count > 0) {
      console.log('✓ 데이터베이스가 이미 초기화되어 있습니다');
      return;
    }

    console.log('데이터베이스 초기화 중...');
    const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');

    // Split by semicolons and execute each statement
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    for (const statement of statements) {
      await query(statement);
    }

    console.log('✓ 데이터베이스 초기화 완료');
  } catch (err) {
    console.error('데이터베이스 초기화 중 오류:', err);
    // Continue anyway - tables might already exist
  }
}
