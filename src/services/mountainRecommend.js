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

// 계절별 검색 키워드
function getSeasonKeyword(season) {
  const keywords = {
    spring: '봄 명산',
    summer: '여름 명산',
    autumn: '가을 단풍 명산',
    winter: '겨울 눈꽃'
  };
  return keywords[season] || '명산';
}

// 구글 검색으로 산 이름 추출
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

    // HTML에서 산 이름 추출 (산, 봉, 산맥 등)
    const mountainMatches = response.data.match(/([가-힣]+(?:산|봉|산맥|암산))/g) || [];
    const unique = [...new Set(mountainMatches)].slice(0, 5);
    return unique.length > 0 ? unique : null;
  } catch (err) {
    console.error('Google 검색 오류:', err.message);
    return null;
  }
}

// 나이버 블로그에서 산 이름 추출
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

    // 블로그 제목에서 산 이름 추출
    $('a.title_link').each((idx, el) => {
      if (mountains.length >= 5) return false;
      const title = $(el).text().trim();
      const match = title.match(/([가-힣]+(?:산|봉|산맥|암산))/);
      if (match && match[1]) {
        mountains.push(match[1]);
      }
    });

    return mountains.length > 0 ? [...new Set(mountains)] : null;
  } catch (err) {
    console.error('Naver 블로그 검색 오류:', err.message);
    return null;
  }
}

// 웹 검색 수행
async function searchMountains(query) {
  console.log(`[웹 검색] ${query}`);

  // 네이버 블로그 검색 시도
  let results = await searchNaverBlog(query);
  if (results && results.length > 0) {
    console.log(`[검색 성공] Naver 블로그에서 ${results.length}개 발견`);
    return results;
  }

  // 구글 검색 시도
  results = await searchGoogle(query);
  if (results && results.length > 0) {
    console.log(`[검색 성공] Google에서 ${results.length}개 발견`);
    return results;
  }

  console.log('[검색 실패] 웹 검색 결과 없음');
  return null;
}

// 메인 추천 함수
export async function getSeasonalRecommendations(season = null, region = null) {
  const targetSeason = season || getCurrentSeason();
  const targetRegion = region || '서울';

  const seasonKeyword = getSeasonKeyword(targetSeason);
  const searchQuery = `${targetRegion} ${seasonKeyword}`;

  console.log(`[명산 추천] 계절: ${targetSeason}, 지역: ${targetRegion}, 검색어: ${searchQuery}`);

  // 웹 검색 실행
  const searchResults = await searchMountains(searchQuery);

  if (searchResults && searchResults.length > 0) {
    // 검색 결과에서 상위 3개 반환
    return {
      season: targetSeason,
      region: targetRegion,
      searchQuery,
      mountains: searchResults.slice(0, 3).map((name) => ({
        name: name.trim(),
        region: targetRegion,
        description: `${targetRegion}의 ${seasonKeyword}`
      }))
    };
  }

  // 검색 실패 시 안내
  return {
    season: targetSeason,
    region: targetRegion,
    searchQuery,
    mountains: [
      {
        name: '검색 결과 없음',
        region: targetRegion,
        description: `${searchQuery} 검색 결과가 없습니다. 다시 시도해주세요.`
      }
    ]
  };
}
