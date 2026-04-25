import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');

export async function initDatabase() {
  const client = await pool.connect();
  try {
    // Check if tables exist and have data
    try {
      const result = await client.query('SELECT COUNT(*) as count FROM mountains');
      const mountainCount = parseInt(result.rows[0].count);

      // 데이터가 32개 이상이면 이미 초기화됨
      if (mountainCount >= 32) {
        console.log('✓ 데이터베이스가 이미 초기화되어 있습니다');
        return;
      }

      // 기존 데이터 삭제 후 새로 삽입
      if (mountainCount > 0) {
        await client.query('DELETE FROM mountains');
        await client.query('DELETE FROM quests');
        console.log('기존 데이터를 삭제했습니다');
      }
    } catch (err) {
      // Table doesn't exist yet, proceed with initialization
    }

    console.log('데이터베이스 초기화 중...');
    const schemaPath = join(__dirname, 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf-8');

    // Split statements by semicolon and execute each one
    const statements = schema
      .split(';')
      .map(s => s.replace(/--.*$/gm, '').trim())
      .filter(s => s.length > 0);

    for (const statement of statements) {
      await client.query(statement);
    }

    console.log('✓ 데이터베이스 초기화 완료');
  } catch (err) {
    console.error('데이터베이스 초기화 중 오류:', err.message);
    // Continue anyway - let the app run even if init fails
  } finally {
    client.release();
  }
}
