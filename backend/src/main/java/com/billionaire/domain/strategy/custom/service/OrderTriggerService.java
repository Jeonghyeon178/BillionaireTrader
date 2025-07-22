package com.billionaire.domain.strategy.custom.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Service;

import com.billionaire.domain.index.dto.response.IndexRes;
import com.billionaire.domain.index.service.IndexService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@Service
public class OrderTriggerService {
	private final IndexService indexService;

	public boolean isPanic() {
		List<IndexRes> data = indexService.getIndexData("COMP", "N");

		if (data.isEmpty()) {
			log.warn("COMP 인덱스 데이터가 없어 공황 상태를 판단할 수 없습니다. 기본값(false) 반환");
			return false;
		}

		data = data.stream()
			.sorted(Comparator.comparing(IndexRes::date).reversed())
			.toList();

		return check(data);
	}

	private boolean check(List<IndexRes> data) {
		LocalDate fromDate = LocalDate.now().minusMonths(2).minusDays(1);
		List<IndexRes> drops = getRecentDrops(data, fromDate);

		if (drops.isEmpty()) {
			log.info("📉 최근 2달간 -3% 하락 없음 → 공황 아님");
			return false;
		}

		return drops.size() >= 4 ? checkMultipleDrops(data, drops) : checkSingleDrop(data, drops);
	}

	private List<IndexRes> getRecentDrops(List<IndexRes> data, LocalDate fromDate) {
		List<IndexRes> drops = new ArrayList<>();
		for (IndexRes index : data) {
			if (!index.date().isBefore(fromDate) && index.rate() <= -3.0) {
				drops.add(index);
			}
		}
		return drops;
	}

	private boolean checkMultipleDrops(List<IndexRes> data, List<IndexRes> drops) {
		LocalDate first = drops.get(0).date();
		LocalDate fourth = drops.get(3).date();
		boolean fourDropsInOneMonth = !first.isAfter(fourth.plusMonths(1).plusDays(1));

		if (fourDropsInOneMonth) {
			return checkPanicWithRecovery(data, drops);
		} else {
			return checkExpiredPanic(first);
		}
	}

	private boolean checkPanicWithRecovery(List<IndexRes> data, List<IndexRes> drops) {
		LocalDate dropDate = drops.get(drops.size() - 1).date();
		if (hasEightConsecutiveUps(data, dropDate)) {
			log.info("📈 공황 해제 (8거래일 연속 상승)");
			return false;
		}
		log.info("⚠️ 공황 상태 (4회 이상 발생)");
		return true;
	}

	private boolean checkExpiredPanic(LocalDate first) {
		if (LocalDate.now().isAfter(first.plusMonths(1).plusDays(1))) {
			log.info("✅ 공황 아님 (최근 하락 발생일로부터 한 달 이상 지남)");
			return false;
		}
		log.info("⚠️ 공황 상태 (4회 이상이지만 1개월 내 조건 미충족)");
		return true;
	}

	private boolean checkSingleDrop(List<IndexRes> data, List<IndexRes> drops) {
		LocalDate dropDate = drops.get(0).date();
		if (!dropDate.isBefore(LocalDate.now().minusMonths(1).minusDays(1))) {
			if (hasEightConsecutiveUps(data, dropDate)) {
				log.info("📈 공황 아님 (8거래일 연속 상승)");
				return false;
			} else {
				log.info("⚠️ 공황 상태 (한 달 내 -3% 발생, 해제조건 불충족)");
				return true;
			}
		} else {
			log.info("✅ 공황 아님 (최근 하락 오래됨)");
			return false;
		}
	}

	private boolean hasEightConsecutiveUps(List<IndexRes> data, LocalDate fromDate) {
		List<IndexRes> filtered = data.stream()
			.filter(i -> !i.date().isBefore(fromDate))
			.sorted(Comparator.comparing(IndexRes::date))
			.toList();

		for (int i = 0; i <= filtered.size() - 8; i++) {
			boolean allUp = true;
			for (int j = 1; j < 8; j++) {
				if (filtered.get(i + j).price() <= filtered.get(i + j - 1).price()) {
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
