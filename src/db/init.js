import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');

export async function initDatabase() {
  const client = await pool.connect();
  try {
    // Check if mountains table exists
    try {
      const result = await client.query('SELECT COUNT(*) as count FROM mountains');
      // 기존 데이터가 있으면 유지 (테스트 용도로는 새로고침 스킵)
      if (parseInt(result.rows[0].count) > 12) {
        console.log('✓ 데이터베이스가 이미 초기화되어 있습니다');
        return;
      }
      // 데이터가 적으면 새로 초기화 (마운틴 데이터 업데이트용)
      await client.query('DELETE FROM mountains');
      await client.query('DELETE FROM quests');
      console.log('기존 데이터를 초기화했습니다');
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
