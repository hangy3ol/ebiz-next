import { Sequelize } from 'sequelize';

const env = process.env.NODE_ENV || 'development';
const ebiz = process.env.EBIZ_DATABASE;
const dis = process.env.DIS_DATABASE;

const sequelize = new Sequelize(
  process.env.EBIZ_DATABASE,
  process.env.EBIZ_USERNAME,
  process.env.EBIZ_PASSWORD,
  {
    host: process.env.EBIZ_HOST,
    dialect: process.env.EBIZ_DIALECT || 'mysql',
    timezone: '+09:00',
    dialectOptions: {
      charset: 'utf8mb4',
      dateStrings: true,
      typeCast: true,
    },
    pool: {
      max: Number(process.env.EBIZ_POOL_MAX) || 5,
      min: Number(process.env.EBIZ_POOL_MIN) || 0,
      acquire: Number(process.env.EBIZ_POOL_ACQUIRE) || 30000,
      idle: Number(process.env.EBIZ_POOL_IDLE) || 10000,
    },
  },
);

// 로그 출력
console.log(`✨ Sequelize instance created for environment: [${env}]`);
console.log(`📦 EBIZ Schema: ${ebiz}`);
console.log(`📦 DIS  Schema: ${dis}`);

sequelize
  .authenticate()
  .then(() => {
    console.log(`✅ Connected to EBIZ database successfully.`);
  })
  .catch((err) => {
    console.error(`❌ Failed to connect to EBIZ database:`, err.message);
  });

export const db = {
  sequelize,
  ebiz,
  dis,
};
