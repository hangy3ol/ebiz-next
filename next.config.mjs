/** @type {import('next').NextConfig} */
const nextConfig = {
  // serverExternalPackages: 서버 전용 패키지를 Next.js에게 알려주는 설정.
  // 이 옵션이 없으면 'sequelize', 'mysql2' 같은 DB 관련 패키지가 인식되지 않아
  // 아예 데이터베이스 연결이 불가능해집니다.
  serverExternalPackages: ['sequelize', 'mysql2'],
};

export default nextConfig;
