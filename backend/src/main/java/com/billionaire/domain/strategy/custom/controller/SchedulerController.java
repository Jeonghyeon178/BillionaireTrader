package com.billionaire.domain.strategy.custom.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.billionaire.domain.strategy.custom.scheduler.CustomScheduler;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/scheduler")
@RequiredArgsConstructor
public class SchedulerController {

	private final CustomScheduler customScheduler;

	@PostMapping("/enable")
	public ResponseEntity<String> enable() {
		customScheduler.enable();
		return ResponseEntity.ok("스케줄러가 활성화되었습니다.");
	}

	@PostMapping("/disable")
	public ResponseEntity<String> disable() {
		customScheduler.disable();
		return ResponseEntity.ok("스케줄러가 비활성화되었습니다.");
	}

	@GetMapping("/status")
	public ResponseEntity<String> status() {
		return ResponseEntity.ok("현재 상태: " + (customScheduler.isEnabled() ? "활성화됨" : "비활성화됨"));
	}
}
