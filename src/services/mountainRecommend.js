import axios from 'axios';
import * as cheerio from 'cheerio';

// 현재 달로 계절 계산
export function getCurrentSeason() {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
}

// 계절별 검색 키워드 생성
function getSeasonKeyword(season) {
  const keywords = {
    spring: '봄 명산',
    summer: '여름 명산 폭포',
    autumn: '가을 단풍 명산',
    winter: '겨울 눈꽃 명산'
  };
  return keywords[season] || '명산';
}

// 구글 검색 결과 스크래핑
async function searchGoogle(query) {
  try {
    const encodedQuery = encodeURIComponent(query);
    const url = `https://www.google.com/search?q=${encodedQuery}`;

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 5000
    });

    // 간단한 파싱으로 산 이름들 추출
    const matches = response.data.match(/[가-힣]+산/g);
    if (matches) {
      // 중복 제거 및 상위 5개만 추출
      const unique = [...new Set(matches)].slice(0, 5);
      return unique;
    }
    return null;
  } catch (err) {
    console.error('Google 검색 오류:', err.message);
    return null;
  }
}

// 나이버 블로그 검색
async function searchNaverBlog(query) {
  try {
    const encodedQuery = encodeURIComponent(query);
    const url = `https://search.naver.com/search.naver?where=blog&sm=tab_jum&query=${encodedQuery}`;

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 5000
    });

    const $ = cheerio.load(response.data);
    const mountains = [];

    // 블로그 결과에서 산 이름 추출
    $('div.lst_item').each((idx, el) => {
      if (mountains.length >= 3) return false;
      const title = $(el).find('a.title_link').text().trim();
      if (title && title.includes('산')) {
        mountains.push(title.substring(0, 40));
      }
    });

    return mountains.length > 0 ? mountains : null;
  } catch (err) {
    console.error('Naver 블로그 검색 오류:', err.message);
    return null;
  }
}

// 주요 지역 명산 데이터 (폴백)
const regionalMountains = {
  서울: {
    spring: ['아차산', '남산', '관악산'],
    summer: ['남산', '아차산'],
    autumn: ['북한산', '도봉산', '관악산'],
    winter: ['관악산', '남산']
  },
  경기: {
    spring: ['북한산', '가리산', '수락산'],
    summer: ['내봉산', '수락산', '축령산'],
    autumn: ['도봉산', '가리산', '북한산'],
    winter: ['가리산', '수락산']
  },
  강원: {
    spring: ['팔미봉', '오죽령'],
    summer: ['설악산', '오대산', '치악산'],
    autumn: ['설악산', '오대산', '태백산'],
    winter: ['태백산', '대관령', '치악산']
  },
  경주: {
    spring: ['불국사', '토함산'],
    summer: ['토함산', '문명산'],
    autumn: ['불국사', '토함산'],
    winter: ['토함산']
  },
  전주: {
    spring: ['내장산'],
    summer: ['덕유산', '변산'],
    autumn: ['내장산', '덕유산'],
    winter: ['덕유산', '내장산']
  },
  대구: {
    spring: ['팔공산', '비슬산'],
    summer: ['팔공산', '비슬산'],
    autumn: ['팔공산', '비슬산'],
    winter: ['팔공산']
  },
  제주: {
    spring: ['한라산'],
    summer: ['한라산'],
    autumn: ['한라산'],
    winter: ['한라산']
  }
};

// 메인 추천 함수
export async function getSeasonalRecommendations(season = null, region = null) {
  const targetSeason = season || getCurrentSeason();
  const targetRegion = region || '서울';

  console.log(`[명산 검색] 계절: ${targetSeason}, 지역: ${targetRegion}`);

  // 검색 키워드 생성: "서울 봄 명산" 형식
  const seasonKeyword = getSeasonKeyword(targetSeason);
  const searchQuery = `${targetRegion} ${seasonKeyword}`;

  console.log(`[검색] ${searchQuery}`);

  // 네이버 블로그 검색 시도
  let mountains = await searchNaverBlog(searchQuery);

  // 블로그 검색 실패 시 구글 검색
  if (!mountains) {
    mountains = await searchGoogle(searchQuery);
  }

  // 모든 검색 실패 시 지역별 기본 명산 반환
  if (!mountains || mountains.length === 0) {
    const regionMountains = regionalMountains[targetRegion] || regionalMountains['서울'];
    mountains = regionMountains[targetSeason] || regionMountains['spring'];
  }

  return {
    season: targetSeason,
    region: targetRegion,
    searchQuery,
    mountains: mountains.slice(0, 4).map(name => ({
      name: name.trim(),
      region: targetRegion,
      description: `${targetRegion}의 ${seasonKeyword}`
    }))
  };
}
