// 현재 달로 계절 계산
export function getCurrentSeason() {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
}

// 지역별 명산 데이터 (읍면동까지 포함)
const mountainsByRegion = {
  '서울 강남구': {
    spring: ['관악산', '청계산', '남산'],
    summer: ['관악산', '남산'],
    autumn: ['관악산', '남산', '청계산'],
    winter: ['남산', '관악산']
  },
  '서울 강북구': {
    spring: ['북한산', '수락산'],
    summer: ['북한산', '수락산'],
    autumn: ['북한산', '도봉산', '수락산'],
    winter: ['북한산']
  },
  '서울 종로구': {
    spring: ['북한산', '남산'],
    summer: ['남산', '북한산'],
    autumn: ['북한산', '남산'],
    winter: ['남산', '북한산']
  },
  '경기 남양주시': {
    spring: ['수락산', '가리산', '일대산'],
    summer: ['수락산', '가리산', '축령산'],
    autumn: ['가리산', '수락산'],
    winter: ['가리산', '수락산']
  },
  '경기 성남시': {
    spring: ['청계산', '경기산'],
    summer: ['청계산', '경기산'],
    autumn: ['청계산'],
    winter: ['경기산']
  },
  '경기 의정부시': {
    spring: ['도봉산', '수락산'],
    summer: ['도봉산'],
    autumn: ['도봉산', '수락산'],
    winter: ['도봉산']
  },
  '강원 춘천시': {
    spring: ['오봉산', '강선봉'],
    summer: ['설악산', '오대산'],
    autumn: ['설악산', '오대산'],
    winter: ['대관령']
  },
  '강원 강릉시': {
    spring: ['오죽령', '보현산'],
    summer: ['설악산', '오대산', '해맞이공원'],
    autumn: ['설악산', '오대산'],
    winter: ['대관령', '오죽령']
  },
  '강원 원주시': {
    spring: ['치악산'],
    summer: ['치악산', '오대산'],
    autumn: ['치악산', '설악산'],
    winter: ['치악산', '태백산']
  },
  '경주 불국사면': {
    spring: ['토함산', '금오산'],
    summer: ['토함산'],
    autumn: ['토함산', '불국사'],
    winter: ['토함산']
  },
  '경주 안강읍': {
    spring: ['팔공산'],
    summer: ['팔공산'],
    autumn: ['팔공산', '팔공산'],
    winter: ['팔공산']
  },
  '전주시 완산구': {
    spring: ['내장산'],
    summer: ['덕유산', '변산'],
    autumn: ['내장산', '덕유산'],
    winter: ['덕유산', '내장산']
  },
  '전주시 덕진구': {
    spring: ['내장산'],
    summer: ['덕유산'],
    autumn: ['내장산'],
    winter: ['덕유산']
  },
  '대구 중구': {
    spring: ['팔공산', '비슬산'],
    summer: ['팔공산'],
    autumn: ['팔공산', '비슬산'],
    winter: ['팔공산']
  },
  '대구 동구': {
    spring: ['팔공산'],
    summer: ['팔공산'],
    autumn: ['팔공산'],
    winter: ['팔공산']
  },
  '제주 제주시': {
    spring: ['한라산', '성산일출봉'],
    summer: ['한라산'],
    autumn: ['한라산'],
    winter: ['한라산']
  },
  '제주 서귀포시': {
    spring: ['한라산', '천지연폭포'],
    summer: ['한라산'],
    autumn: ['한라산'],
    winter: ['한라산']
  },
  '부산 중구': {
    spring: ['금정산'],
    summer: ['금정산'],
    autumn: ['금정산'],
    winter: ['금정산']
  },
  '부산 해운대구': {
    spring: ['금정산'],
    summer: ['금정산'],
    autumn: ['금정산'],
    winter: ['금정산']
  },
  '인천 중구': {
    spring: ['월미산', '북성포'],
    summer: ['영종도', '월미도'],
    autumn: ['월미산'],
    winter: ['월미산']
  },
  '인천 남동구': {
    spring: ['인천대공원'],
    summer: ['인천대공원'],
    autumn: ['인천대공원'],
    winter: ['인천대공원']
  },
  '울산 중구': {
    spring: ['울산암각화'],
    summer: ['울산암각화'],
    autumn: ['울산암각화'],
    winter: ['울산암각화']
  },
  '광주 동구': {
    spring: ['무등산'],
    summer: ['무등산'],
    autumn: ['무등산'],
    winter: ['무등산']
  },
  '대전 중구': {
    spring: ['계족산'],
    summer: ['계족산'],
    autumn: ['계족산'],
    winter: ['계족산']
  }
};

// 메인 추천 함수
export async function getSeasonalRecommendations(season = null, region = null) {
  const targetSeason = season || getCurrentSeason();
  const targetRegion = region || '서울 강남구';

  console.log(`[명산 검색] 계절: ${targetSeason}, 지역: ${targetRegion}`);

  // 지역별 명산 데이터에서 조회
  let mountains = mountainsByRegion[targetRegion]?.[targetSeason];

  // 해당 지역이 없으면 시도 수준으로 폴백
  if (!mountains) {
    const cityLevel = targetRegion.split(' ')[0];
    for (const [region, seasons] of Object.entries(mountainsByRegion)) {
      if (region.startsWith(cityLevel)) {
        mountains = seasons[targetSeason];
        if (mountains) break;
      }
    }
  }

  // 그래도 없으면 기본값
  if (!mountains) {
    mountains = ['북한산', '남산', '관악산'];
  }

  return {
    season: targetSeason,
    region: targetRegion,
    mountains: mountains.map((name, idx) => ({
      name: name,
      region: targetRegion,
      description: `${targetRegion}의 제철 명산 - ${['봄 진달래', '여름 폭포', '가을 단풍', '겨울 눈꽃'][['spring', 'summer', 'autumn', 'winter'].indexOf(targetSeason)]}`
    }))
  };
}
