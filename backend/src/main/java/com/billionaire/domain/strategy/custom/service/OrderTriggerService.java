package com.billionaire.domain.strategy.custom.service;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.billionaire.domain.index.entity.Index;
import com.billionaire.domain.index.service.IndexService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@Service
public class OrderTriggerService {
	private final IndexService indexService;

	// 한 달 이내에 -3% 이상이 4번 뜨고 이후 두 달 동안 -3%가 뜨지 않은 경우.
	// -3퍼가 뜬 시점으로부터 3회 이상 -3퍼
	// 중간에 -3%가 뜬다면 기준 날짜는 그 해당 날짜 시점에서 다시 두 달 동안 뜨지 않아야 함.

	// 데이터 과거부터 현재 순으로 정렬. -> 가장 최근 -3% 데이터 추적.
	// 역순으로 트래킹. (기준일 한 달을 지정해두고 4번 발생하는지 체크. & 두 달 이내에 뜨는 지 -3%가 뜨는 지 확인
	// 끊기면 시작 기준일자 확인 할 수 있음.
	// 그러면 다시 돌아와서 최신 -3% 지점 이후 2달이 지났는지 or 이전에 기준일로부터 오늘자까지 8거래일 연속 상승이 있었는지 체크.

	/**
	 * 공황 트리거 조건 판단 메인 메서드
	 * 조건:
	 * - 한 달 내 -3% 하락 4회 발생한 기준일이 존재하고
	 * - 기준일 이후 2달간 -3% 하락 없거나, 기준일 이후 8거래일 연속 상승하면 true
	 */
	// TODO 그냥 테스트 코드 작성해서 체크하기
	public boolean isPanicOver() {
		List<Index> data = indexService.getIndexData("COMP", "N").stream()
			.sorted(Comparator.comparing(Index::getDate)) // 과거 → 현재 정렬
			.toList();

		Optional<LocalDate> optionalBaseDate = findValidTriggerStartDate(data);
		// TODO 예외를 두는 것이 나을 듯.
		if (optionalBaseDate.isEmpty()) {
			log.info("공황 기준일 미충족 → 트리거 false");
			return false;
		}

		LocalDate baseDate = optionalBaseDate.get();

		if (isEightDaysUp(data, baseDate)) {
			log.info("기준일 이후 8거래일 연속 상승 → 공황 종료");
			return true;
		}

		if (LocalDate.now().isAfter(baseDate.plusMonths(2).plusDays(1))) {
			log.info("기준일 이후 2달 경과 → 공황 종료");
			return true;
		}

		log.info("공황 종료 조건 미충족 → 트리거 false");
		return false;
	}

	/**
	 * 기준일 탐색 (가장 최근부터 거슬러 올라가며 탐색)
	 * 조건: 한 달 내 -3% 하락 4회 발생 + 이후 2달간 -3% 하락 없음
	 */
	private Optional<LocalDate> findValidTriggerStartDate(List<Index> data) {
		// 최근 → 과거 순으로 정렬
		List<Index> reversedData = data.stream()
			.sorted(Comparator.comparing(Index::getDate).reversed())
			.toList();

		for (int i = 0; i < reversedData.size(); i++) {
			Index current = reversedData.get(i);
			if (current.getRate() > -3.0)
				continue;

			LocalDate end = current.getDate();
			LocalDate start = end.minusMonths(1);

			long dropCount = data.stream()
				.filter(d -> !d.getDate().isBefore(start) && !d.getDate().isAfter(end))
				.filter(d -> d.getRate() <= -3.0)
				.count();

			if (dropCount >= 4) {
				// 이후 2달간 -3% 하락 존재 여부 확인
				LocalDate reDropEnd = end.plusMonths(2);
				boolean hasReDrop = data.stream()
					.filter(d -> d.getDate().isAfter(end) && !d.getDate().isAfter(reDropEnd))
					.anyMatch(d -> d.getRate() <= -3.0);

				if (!hasReDrop) {
					log.info("공황 기준일 탐색 완료: {}", end);
					return Optional.of(end);
				} else {
					log.info("기준일 {} 이후 재하락 발생 → 다음 하락 지점에서 계속 탐색", end);
					// 역순 탐색이므로 continue만 하면 됨
				}
			}
		}
		return Optional.empty();
	}

	/**
	 * 기준일 이후 8거래일 연속 상승 여부 판단
	 */
	private boolean isEightDaysUp(List<Index> data, LocalDate baseDate) {
		List<Index> afterBase = data.stream()
			.filter(i -> i.getDate().isAfter(baseDate))
			.toList();

		for (int i = 0; i <= afterBase.size() - 8; i++) {
			boolean allUp = true;
			for (int j = 1; j < 8; j++) {
				if (afterBase.get(i + j).getPrice() <= afterBase.get(i + j - 1).getPrice()) {
					allUp = false;
					break;
				}
			}
			if (allUp)
				return true;
		}
		return false;
	}
}
